import { AxiosResponse } from "axios";

import { isIPAddress, isAddress } from "../../utils/validation.js";
import { OperationType } from "../../types/operation.js";
import { TimeStamp } from "../../utils/time.js";
import { Fact } from "../../types/fact.js";

import { CollectionRegisterFact, collectionData } from "./register.js";
import { DelegateItem, DelegateFact, DELEGATE } from "./delegate.js";
import { CollectionPolicyUpdaterFact } from "./updatePolicy.js";
import { ApproveFact, ApproveItem } from "./approve.js";
import { MintItem, MintFact } from "./mint.js";
import { gererateCreator } from "./sign.js";
import { Creator } from "./creatorType.js";
import nftInfo from "./information.js";
import { NFTTransferFact, NFTTransferItem } from "./transfer.js";

export class Nft {
  private _networkID: string = "";
  private _node: string = "";
  private _contractAddress: string = "";
  private _collection: string = "";

  constructor(networkID: string, provider?: string) {
    this._setNode(provider);
    this._setChain(networkID);
  }

  private _setNode(provider?: string) {
    if (isIPAddress(provider)) {
      this._node = provider as string;
    }
  }

  private _setChain(networkID: string) {
    this._networkID = networkID;
  }

  setContractAddress(contractAddress: string) {
    if (
      this._contractAddress !== contractAddress &&
      isAddress(contractAddress)
    ) {
      this._contractAddress = contractAddress;
      console.log("Contract address is changed : ", this._contractAddress);
    } else {
      console.error("This is invalid address type");
    }
  }

  setCollectionId(collectionID: string) {
    if (this._collection !== collectionID) {
      this._collection = collectionID;
      console.log("Collection ID is changed : ", this._collection);
    }
  }

  getContractAddress(): string {
    return this._contractAddress.toString();
  }

  getCollectionId(): string {
    return this._collection.toString();
  }

  async getCollectionInfo(
    collectionID?: string
  ): Promise<AxiosResponse | null> {
    let id = this._collection;

    if (collectionID !== undefined) {
      id = collectionID;
    }

    const res = await nftInfo.getCollectionInfo(
      this._node,
      this._contractAddress,
      id
    );

    if (!res) {
      return null;
    }

    return res.data;
  }

  async getCollectionPolicy(
    collectionID?: string
  ): Promise<AxiosResponse | null> {
    let id = this._collection;

    if (collectionID !== undefined) {
      id = collectionID;
    }

    const res = await nftInfo.getCollectionInfo(
      this._node,
      this._contractAddress,
      id
    );

    if (!res) {
      return null;
    }

    return res.data._embedded.policy;
  }

  // owner의 nft 갯수. TBD.
  // balanceOf() {}

  async ownerOf(
    tokenID: number,
    collectionID?: string
  ): Promise<AxiosResponse | null> {
    let id = this._collection;

    if (collectionID !== undefined) {
      id = collectionID;
    }

    const res = await nftInfo.getNftInfo(
      this._node,
      this._contractAddress,
      id,
      tokenID
    );

    if (!res) {
      return null;
    }

    return res.data._embedded.owner;
  }

  async name(collectionID?: string): Promise<AxiosResponse | null> {
    let id = this._collection;

    if (collectionID !== undefined) {
      id = collectionID;
    }

    const res = await nftInfo.getCollectionInfo(
      this._node,
      this._contractAddress,
      id
    );

    if (!res) {
      return null;
    }

    return res.data._embedded.policy.name;
  }

  symbol(): string {
    return this.getCollectionId();
  }

  async totalSupply(collectionID?: string): Promise<AxiosResponse | null> {
    let id = this._collection;

    if (collectionID !== undefined) {
      id = collectionID;
    }

    const res = await nftInfo.getAllNftInfo(
      this._node,
      this._contractAddress,
      id
    );

    if (!res) {
      return null;
    }

    return res.data._embedded.length;
  }

  async tokenURI(
    tokenID: number,
    collectionID?: string
  ): Promise<AxiosResponse | null> {
    let id = this._collection;

    if (collectionID !== undefined) {
      id = collectionID;
    }

    const res = await nftInfo.getNftInfo(
      this._node,
      this._contractAddress,
      id,
      tokenID
    );

    if (!res) {
      return null;
    }

    return res.data._embedded.uri;
  }

  /** structure
   * collectionData = {
   *    name: string;
   *    symbol: string;
   *    uri: string;
   *    royalty: string | number | Buffer | BigInt | Uint8Array
   *    whiteLists: string[],
   * }
   */
  createCollection(
    sender: string,
    data: collectionData,
    currencyID: string
  ): OperationType<Fact> {
    const token = new TimeStamp().UTC();

    const fact = new CollectionRegisterFact(
      token,
      sender,
      this._contractAddress,
      data.symbol,
      data.name,
      data.royalty,
      data.uri,
      data.whiteLists,
      currencyID
    );

    this.setCollectionId(data.symbol);

    return new OperationType(this._networkID, fact);
  }

  /** structure
   * inputData = {
   *    name: string;
   *    symbol: string;
   *    uri: string;
   *    royalty: string | number | Buffer | BigInt | Uint8Array
   *    whiteLists: string[],
   * }
   */
  setPolicy(
    sender: string,
    data: collectionData,
    currencyId: string
  ): OperationType<Fact> {
    const token = new TimeStamp().UTC();

    const fact = new CollectionPolicyUpdaterFact(
      token,
      sender,
      this._contractAddress,
      data.symbol,
      data.name,
      data.royalty,
      data.uri,
      data.whiteLists,
      currencyId
    );

    return new OperationType(this._networkID, fact);
  }

  mint(
    sender: string,
    uri: string,
    hash: string,
    currencyID: string,
    creator: string
  ): OperationType<Fact> {
    const originator = gererateCreator([{ account: creator, share: 100 }]);
    const token = new TimeStamp().UTC();

    const item = new MintItem(
      this._contractAddress,
      this._collection,
      hash,
      uri,
      originator,
      currencyID
    );
    const fact = new MintFact(token, sender, [item]);

    return new OperationType(this._networkID, fact);
  }

  mintForMultiCreators(
    sender: string,
    uri: string,
    hash: string,
    currencyID: string,
    creator: Creator[]
  ): OperationType<Fact> {
    const originators = gererateCreator(creator);
    const token = new TimeStamp().UTC();

    const item = new MintItem(
      this._contractAddress,
      this._collection,
      hash,
      uri,
      originators,
      currencyID
    );
    const fact = new MintFact(token, sender, [item]);

    return new OperationType(this._networkID, fact);
  }

  transfer(
    sender: string,
    receiver: string,
    tokenId: string | number | Buffer | BigInt | Uint8Array,
    currencyId: string
  ) {
    const token = new TimeStamp().UTC();

    const item = new NFTTransferItem(
      this._contractAddress,
      this._collection,
      receiver,
      tokenId,
      currencyId
    );
    const fact = new NFTTransferFact(token, sender, [item]);

    return new OperationType(this._networkID, fact);
  }

  approve(
    owner: string,
    operator: string,
    tokenID: string | number | Buffer | BigInt | Uint8Array,
    currencyID: string
  ): OperationType<Fact> {
    const token = new TimeStamp().UTC();

    const item = new ApproveItem(
      this._contractAddress,
      this._collection,
      operator,
      tokenID,
      currencyID
    );
    const fact = new ApproveFact(token, owner, [item]);

    return new OperationType(this._networkID, fact);
  }

  async getApproved(
    tokenID: number,
    collectionID?: string
  ): Promise<AxiosResponse | null> {
    let id = this._collection;

    if (collectionID !== undefined) {
      id = collectionID;
    }

    const res = await nftInfo.getNftInfo(
      this._node,
      this._contractAddress,
      id,
      tokenID
    );

    if (!res) {
      return null;
    }

    return res.data._embedded.approved;
  }

  setApprovalForAll(
    owner: string,
    operator: string,
    mode: boolean,
    currencyID: string
  ) {
    const token = new TimeStamp().UTC();

    let approved: DELEGATE = "allow";
    if (mode == false) {
      approved = "cancel";
    }

    const item = new DelegateItem(
      this._contractAddress,
      this._collection,
      operator,
      approved,
      currencyID
    );
    const fact = new DelegateFact(token, owner, [item]);

    return new OperationType(this._networkID, fact);
  }

  // 모든 nft 를 위임하였냐
  async isApprovedForAll(
    owner: string,
    collectionID?: string
  ): Promise<AxiosResponse | null> {
    let id = this._collection;

    if (collectionID !== undefined) {
      id = collectionID;
    }

    const res = await nftInfo.getOperationInfo(
      this._node,
      this._contractAddress,
      id,
      owner
    );

    if (!res) {
      return null;
    }

    return res.data;
  }

  async getNFTInfo(
    tokenID: number,
    collectionID?: string
  ): Promise<AxiosResponse | null> {
    let id = this._collection;

    if (collectionID !== undefined) {
      id = collectionID;
    }

    const res = await nftInfo.getNftInfo(
      this._node,
      this._contractAddress,
      id,
      tokenID
    );

    if (!res) {
      return null;
    }

    return res.data;
  }
}
