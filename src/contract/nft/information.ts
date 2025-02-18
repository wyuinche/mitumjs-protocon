import axios, { AxiosResponse } from "axios";

export default {
  async getNftInfo(
    provider: string,
    contract: string,
    collection: string,
    tokenID: number
  ): Promise<AxiosResponse> {
    if (provider === "" || contract === undefined || collection === undefined) {
      throw new Error(
        "RPC-URL is not provided or You need to set 'contract address and collection id'."
      );
    }

    try {
      const res = await axios.get(
        `${provider}/nft/${contract}/collection/${collection}/${tokenID}`
      );
      return res;
    } catch (error: any) {
      throw new Error(error.response.data);
    }
  },

  async getCollectionInfo(
    provider: string,
    contract: string,
    collection: string
  ): Promise<AxiosResponse> {
    if (provider === "" || contract === undefined || collection === undefined) {
      throw new Error(
        "RPC-URL is not provided or You need to set 'contract address and collection id'."
      );
    }

    try {
      const res = await axios.get(
        `${provider}/nft/${contract}/collection/${collection}`
      );
      return res;
    } catch (error: any) {
      throw new Error(error.response.data);
    }
  },

  async getAllNftInfo(
    provider: string,
    contract: string,
    collection: string
  ): Promise<AxiosResponse> {
    if (provider === "" || contract === undefined || collection === undefined) {
      throw new Error(
        "RPC-URL is not provided or You need to set 'contract address and collection id'."
      );
    }

    try {
      const res = await axios.get(
        `${provider}/nft/${contract}/collection/${collection}/nfts`
      );
      return res;
    } catch (error: any) {
      throw new Error(error.response.data);
    }
  },

  async getOperationInfo(
    provider: string,
    contract: string,
    collection: string,
    address: string
  ): Promise<AxiosResponse> {
    if (provider === "" || contract === undefined || collection === undefined) {
      throw new Error(
        "RPC-URL is not provided or You need to set 'contract address and collection id'."
      );
    }

    try {
      const res = await axios.get(
        `${provider}/nft/${contract}/collection/${collection}/account/${address}/operators`
      );
      return res;
    } catch (error: any) {
      throw new Error(error.response.data);
    }
  },
};
