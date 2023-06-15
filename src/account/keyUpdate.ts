import { CurrencyID } from "../types/property";
import { FactJson } from "../types/iFact";
import { Fact } from "../types/fact";
import { HINT } from "../types/hint";

import { Address } from "./address";
import { Keys } from "./publicKey";

export class KeyUpdaterFact extends Fact {
  readonly target: Address;
  readonly keys: Keys;
  readonly currency: CurrencyID;

  constructor(
    token: string,
    target: string | Address,
    keys: Keys,
    currency: string | CurrencyID
  ) {
    super(HINT.KEY_UPDATER_OPERATION_FACT, token);
    this.target = Address.from(target);
    this.keys = keys;
    this.currency = CurrencyID.from(currency);
    this._hash = this.hashing();
  }

  toBuffer(): Buffer {
    return Buffer.concat([
      this.token.toBuffer(),
      this.target.toBuffer(),
      this.keys.toBuffer(),
      this.currency.toBuffer(),
    ]);
  }

  toHintedObject(): FactJson {
    return {
      ...super.toHintedObject(),
      target: this.target.toString(),
      keys: this.keys.toHintedObject(),
      currency: this.currency.toString(),
    };
  }

  get operationHint() {
    return HINT.KEY_UPDATER_OPERATION;
  }
}
