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
      return;
    }

    // Build UTXO logic
    const utxos = await lucid.wallet.getUtxos();
    if (!utxos.length) {
      showProcessModal(
        "failed",
        "Insufficient UTXOs",
        errorMessages?.insufficientUtxos ?? "Error"
      );
      return;
    }

    const mappedUtxos = utxos.map((item: any) => ({
      ...item,
      assets: mapAssetsToRequestFormat(item.assets),
    }));

    // Determine which swap API to call based on token logic
    let swapBuildUrl = "";
    let swapBuildData = {};
    if (data.sender.ticker === "ADA" && data.receiver.ticker === "MyUSD") {
      const backendBaseUrl = config.get("backend.uri");
      swapBuildUrl = `${backendBaseUrl}/swap-ada/build`;
      swapBuildData = {
        address: userAddress,
        utxos: mappedUtxos,
        adaAmount: toCardanoTokens(data.sender.amount),
      };
    } else {
      // Handle other cases...
    }

    const txFromSwapBuildApi = await buildSwap(swapBuildUrl, swapBuildData);

    // Handle signing and submission
    let signedTx = await lucid.fromTx(txFromSwapBuildApi.tx).sign().complete();
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
