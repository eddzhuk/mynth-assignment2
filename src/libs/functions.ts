export const getEnvConfig = <T>(key: string): T => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env variable: ${key}`);
  return value as unknown as T;
};

export const getTransactionUrl = (
  blockchain: string,
  transactionID: string
) => {
  // Generate and return the transaction URL based on the blockchain and transactionID
  return "";
};

export const getAddressUrl = (blockchain: string, address: string) => {
  // Generate and return the address URL based on the blockchain and address
  return "";
};

export const mapAssetsToRequestFormat = (assets: any) => {
  // Map assets to the format expected by the request
  return "";
};
