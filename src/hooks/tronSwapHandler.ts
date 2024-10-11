import { useTronlink } from "../contexts/connectTronWalletContext";
import { balance, build, sign } from "../libs/tronweb";
import { showProcessModal, showSuccessModal } from "../utils/modals";
import {
  getAddressUrl,
  getEnvConfig,
  getTransactionUrl,
} from "../libs/functions";
import { toCardanoTokens } from "./useDecimals";
import { handleApiError } from "./useHandleApiErrors";
import { SwapInput } from "../types/types";

export const handleTronSwap = async (
  data: SwapInput,
  errorMessages: any,
  isSwapLoading: boolean,
  setSwapLoading: (value: boolean) => void
) => {
  const { address } = useTronlink();

  if (isSwapLoading) return;
  setSwapLoading(true);

  const userAddress = data.receiver.address;

  showProcessModal("building");

  if (!address) {
    showProcessModal(
      "failed",
      "Connect your Wallet",
      errorMessages?.walletUnconnected ?? "Error"
    );
    setSwapLoading(false);
    return;
  }

  try {
    const usdtContractAddress = getEnvConfig<string>(
      "tron.usdt.contract_address"
    );
    const usdcContractAddress = getEnvConfig<string>(
      "tron.usdc.contract_address"
    );
    const usdtDestination = getEnvConfig<string>("tron.usdt.destination");
    const usdcDestination = getEnvConfig<string>("tron.usdc.destination");

    const contractAddress =
      data.sender.ticker === "USDT" ? usdtContractAddress : usdcContractAddress;

    const destination =
      data.sender.ticker === "USDT" ? usdtDestination : usdcDestination;

    if (
      !window.tron ||
      !window.tron.tronWeb ||
      !window.tron.tronWeb.defaultAddress
    )
      throw new Error("Tron wallet must be connected");

    const userBalance = await balance(
      window.tron.tronWeb.defaultAddress,
      window.tron.tronWeb.trx
    );

    if (!userBalance) return;

    const minbalance = parseInt(getEnvConfig<string>("tron.minimumBalance"));

    if (parseInt(userBalance) < minbalance * 1000000) {
      // 1000000 SUN = 1 TRX
      const errorToSend = {
        info: `Minimum Required balance is ${minbalance} TRX`,
      };
      handleApiError(errorToSend, showProcessModal);
      setSwapLoading(false);
      return;
    }

    const txFromTronBuildApi = await build(
      window.tron.tronWeb.defaultAddress,
      window.tron.tronWeb.transactionBuilder,
      contractAddress,
      BigInt(toCardanoTokens(data.sender.amount)),
      destination,
      data.receiver.address
    );

    if (!txFromTronBuildApi) return;

    showProcessModal("signing");

    const result = await sign(
      window.tron.tronWeb.trx,
      window.tron.tronWeb.transactionBuilder,
      data.receiver.address,
      txFromTronBuildApi
    );

    showSuccessModal(
      getTransactionUrl(data.sender.blockchain, result),
      getAddressUrl(data.receiver.blockchain, data.receiver.address)
    );
  } catch (error) {
    handleApiError(error, showProcessModal);
  } finally {
    setSwapLoading(false);
  }
};
