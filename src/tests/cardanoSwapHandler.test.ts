import { handleCardanoSwap } from "../hooks/cardanoSwapHandler";
import { buildSwap } from "../services/swapService";
import { Blockchain } from "../types/types";
import { showProcessModal, showSuccessModal } from "../utils/modals";

jest.mock("../services/swapService");
jest.mock("../utils/modals");
jest.mock("mynth-use-cardano");

describe("handleCardanoSwap", () => {
  const mockSetSwapLoading = jest.fn();
  const mockErrorMessages = { walletUnconnected: "Connect your wallet" };
  const mockSwapInput = {
    sender: { amount: "10", ticker: "ADA", blockchain: Blockchain.Cardano },
    receiver: {
      address: "addr",
      amount: "10",
      ticker: "MyUSD",
      blockchain: Blockchain.Tron,
    },
  };

  it("should handle a successful Cardano swap", async () => {
    // buildSwap.mockResolvedValue({ tx: "txData" });
    // lucid.wallet.getUtxos.mockResolvedValue([{ assets: {} }]);

    await handleCardanoSwap(
      mockSwapInput,
      mockErrorMessages,
      false,
      mockSetSwapLoading
    );

    expect(buildSwap).toHaveBeenCalledWith(
      "/swap-ada/build",
      expect.any(Object)
    );
    expect(showProcessModal).toHaveBeenCalledWith("signing");
  });

  it("should show error if no UTXOs available", async () => {
    // lucid.wallet.getUtxos.mockResolvedValue([]);

    await handleCardanoSwap(
      mockSwapInput,
      mockErrorMessages,
      false,
      mockSetSwapLoading
    );

    expect(showProcessModal).toHaveBeenCalledWith(
      "failed",
      "Insufficient UTXOs",
      "Error"
    );
  });

  // Add more tests for edge cases
});
