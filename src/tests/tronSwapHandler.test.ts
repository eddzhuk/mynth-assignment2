import { handleTronSwap } from "../hooks/tronSwapHandler";
import { build, sign } from "../libs/tronweb";
import { Blockchain } from "../types/types";
import { showProcessModal, showSuccessModal } from "../utils/modals";

jest.mock("../libs/TronWeb");
jest.mock("../utils/modals");

describe("handleTronSwap", () => {
  const mockSetSwapLoading = jest.fn();
  const mockErrorMessages = { walletUnconnected: "Connect your wallet" };
  const mockSwapInput = {
    sender: { amount: "10", ticker: "USDT", blockchain: Blockchain.Tron },
    receiver: {
      address: "addr",
      amount: "10",
      ticker: "MyUSD",
      blockchain: Blockchain.Tron,
    },
  };

  it("should handle a successful Tron swap", async () => {
    // build.mockResolvedValue({ data: "txData" });
    // sign.mockResolvedValue({ data: "transactionId" });

    await handleTronSwap(
      mockSwapInput,
      mockErrorMessages,
      false,
      mockSetSwapLoading
    );

    expect(build).toHaveBeenCalled();
    expect(sign).toHaveBeenCalled();
    expect(showProcessModal).toHaveBeenCalledWith("signing");
  });

  // Add more tests for error handling
});
