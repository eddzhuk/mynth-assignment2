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
  if (isSwapLoading) return;

  setSwapLoading(true);
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

    const txFromTronBuildApi = await build(
      window.tron.tronWeb.defaultAddress,
      window.tron.tronWeb.transactionBuilder,
      contractAddress,
      BigInt(toCardanoTokens(data.sender.amount)),
      destination,
      data.receiver.address
    );

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
