import { ContractID, CurrencyID } from "../../types/property";
import { FactJson } from "../../types/iFact";
import { String } from "../../types/string";
import { Fact } from "../../types/fact";
import { Big } from "../../utils/math";

import { Address } from "../../account/address";

const AppendFactHint = "mitum-timestamp-append-operation-fact";
const AppendHint = "mitum-timestamp-append-operation";

export class AppendFact extends Fact {
  readonly sender: Address;
  readonly contract: Address;
  readonly serviceID: ContractID;
  readonly projectID: String;
  readonly requestTimeStamp: Big;
  readonly data: String;
  readonly currency: CurrencyID;

  constructor(
    token: string,
    sender: string,
    contract: string,
    serviceID: string,
    projectID: string,
    requestTimestamp: number,
    data: string,
    currency: string
  ) {
    super(AppendFactHint, token);

    this.sender = new Address(sender);
    this.contract = new Address(contract);
    this.serviceID = new ContractID(serviceID);
    this.projectID = new String(projectID);
    this.requestTimeStamp = new Big(requestTimestamp);
    this.data = new String(data);
    this.currency = new CurrencyID(currency);

    this._hash = this.hashing();
  }

  toBuffer(): Buffer {
    return Buffer.concat([
      this.token.toBuffer(),
      this.sender.toBuffer(),
      this.contract.toBuffer(),
      this.serviceID.toBuffer(),
      this.projectID.toBuffer(),
      this.requestTimeStamp.toBuffer("fill"),
      this.data.toBuffer(),
      this.currency.toBuffer(),
    ]);
  }

  toHintedObject(): FactJson {
    return {
      ...super.toHintedObject(),
      sender: this.sender.toString(),
      contract: this.contract.toString(),
      service_id: this.serviceID.toString(),
      projectID: this.projectID.toString(),
      requestTimeStamp: this.requestTimeStamp.v,
      data: this.data.toString(),
      currency: this.currency.toString(),
    };
  }

  get operationHint() {
    return AppendHint;
  }
}
