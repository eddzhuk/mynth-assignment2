import { useCardano } from "mynth-use-cardano";
import { showProcessModal, showSuccessModal } from "../utils/modals";
import { buildSwap } from "../services/swapService";
import { SwapInput } from "../types/types";
import { toCardanoTokens } from "./useDecimals";
import { handleApiError } from "./useHandleApiErrors";
import config from "../libs/config";
import {
  getAddressUrl,
  getTransactionUrl,
  mapAssetsToRequestFormat,
} from "../libs/functions";

export const handleCardanoSwap = async (
  data: SwapInput,
  errorMessages: any,
  isSwapLoading: boolean,
  setSwapLoading: (value: boolean) => void
) => {
  const { lucid, account } = useCardano();
  if (isSwapLoading) return;

  setSwapLoading(true);
  try {
    const userAddress = account?.address;
    if (!lucid || !userAddress) {
      showProcessModal(
        "failed",
        "Connect your Wallet",
        errorMessages?.walletUnconnected ?? "Error"
      );
      setSwapLoading(false);
      return;
    }

    showProcessModal("generating");

    // Build UTXO logic
    const utxos = await lucid.wallet.getUtxos();
    if (!utxos || !utxos.length) {
      setSwapLoading(false);
      showProcessModal(
        "failed",
        "Insufficient UTXOs",
        errorMessages?.insufficientUtxos ?? "Error"
      );
      return;
    }

    showProcessModal("building");

    const mappedUtxos = utxos.map((item: any) => ({
      ...item,
      assets: mapAssetsToRequestFormat(item.assets),
    }));

    // Determine which swap API to call based on token logic
    const backendBaseUrl = config.get("backend.uri");
    let swapBuildUrl = "";
    let swapBuildData = {};
    let swapRequireSignatorie = true;

    const tokenToSwap = data.sender.ticker;
    const tokenToReceive = data.receiver.ticker;

    if (tokenToSwap === "ADA" && tokenToReceive === "MyUSD") {
      swapRequireSignatorie = false;
      swapBuildUrl = `${backendBaseUrl}/swap-ada/build`;
      swapBuildData = {
        address: userAddress,
        utxos: mappedUtxos,
        adaAmount: toCardanoTokens(data.sender.amount),
      };
    } else if (tokenToSwap === "MyUSD" && tokenToReceive === "ADA") {
      swapRequireSignatorie = false;
      swapBuildUrl = `${backendBaseUrl}/swap-myusd-ada/build`;
      swapBuildData = {
        address: userAddress,
        utxos: mappedUtxos,
        amount: toCardanoTokens(data.sender.amount),
      };
    } else if (
      (tokenToSwap === "MyUSD" || tokenToSwap === "IAG") &&
      (tokenToReceive === "USDT" || tokenToReceive === "USDC")
    ) {
      swapBuildUrl = `${backendBaseUrl}/swap/build`;
      swapBuildData = {
        address: userAddress,
        utxos: mappedUtxos,
        amountToSwap: toCardanoTokens(data.sender.amount),
        destinationAddress: data.receiver.address,
        tokenToSwap,
        tokenToReceive,
      };
    } else {
      setSwapLoading(false);
      showProcessModal(
        "failed",
        "Unavailable swap",
        `Swap of ${tokenToSwap} to ${tokenToReceive} is not available at this time, try again later`
      );
      return;
    }

    const txFromSwapBuildApi = await buildSwap(swapBuildUrl, swapBuildData);

    if (!txFromSwapBuildApi || !txFromSwapBuildApi.tx) return;

    showProcessModal("signing");

    // Handle signing and submission
    let signedTx;
    if (!swapRequireSignatorie) {
      const lucidTx = lucid.fromTx(txFromSwapBuildApi.tx);
      signedTx = await lucidTx.sign().complete();
    } else {
      if (!txFromSwapBuildApi.signature) return;
      const lucidTx = lucid.fromTx(txFromSwapBuildApi.tx);
      signedTx = await lucidTx
        .sign()
        .assemble([txFromSwapBuildApi.signature])
        .complete();
    }

    showProcessModal("submitting");

    const transactionID = await signedTx.submit();

    showSuccessModal(
      getTransactionUrl(data.sender.blockchain, transactionID),
      getAddressUrl(data.receiver.blockchain, data.receiver.address)
    );
  } catch (error) {
    handleApiError(error, showProcessModal);
  } finally {
    setSwapLoading(false);
  }
};
