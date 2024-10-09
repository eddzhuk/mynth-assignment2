import axios from "axios";

export const buildSwap = async (url: string, data: object) => {
  try {
    const response = await axios.post(url, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
