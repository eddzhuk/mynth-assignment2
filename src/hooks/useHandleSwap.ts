import { handleCardanoSwap } from "./cardanoSwapHandler";
import { handleTronSwap } from "./tronSwapHandler";
import { Blockchain, SwapInput } from "../types/types";
import { useGetValidationErrorsQuery } from "../store/errorMessages/validationErrors";
import { useState } from "react";

const useHandleSwap = () => {
  const [isSwapLoading, setSwapLoading] = useState(false);
  const { data: errorMessages } = useGetValidationErrorsQuery();

  const handleSwap = async (data: SwapInput) => {
    if (data.sender.blockchain === Blockchain.Cardano) {
      await handleCardanoSwap(
        data,
        errorMessages,
        isSwapLoading,
        setSwapLoading
      );
    } else {
      await handleTronSwap(data, errorMessages, isSwapLoading, setSwapLoading);
    }
  };

  return {
    handleSwap,
    isSwapLoading,
  };
};

export default useHandleSwap;
