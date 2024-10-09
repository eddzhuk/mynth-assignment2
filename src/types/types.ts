export enum Blockchain {
  Cardano = "cardano",
  Tron = "tron",
}

export type SwapInput = {
  sender: {
    amount: string;
    ticker: string;
    blockchain: Blockchain;
  };
  receiver: {
    address: string;
    amount: string;
    ticker: string;
    blockchain: Blockchain;
  };
};
