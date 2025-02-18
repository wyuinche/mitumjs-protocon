import base58 from "bs58";
import { keccak256 as keccak256js } from "js-sha3";

import { Address } from "./address.js";

import { Big, keccak256, sha3 } from "../utils/math.js";
import { MitumConfig } from "../utils/config.js";

import { KeyPairType } from "../types/address.js";
import { Hint } from "../types/property.js";
import { HINT, SUFFIX } from "../types/hint.js";
import { Assert, ECODE, MitumError, StringAssert } from "../utils/error.js";
import {
  HintedObject,
  IBuffer,
  IHintedObject,
  IString,
} from "../types/interface.js";

type BigArg = string | number | Big;
type Pub = [string | Key, BigArg] | PubKey;

export class Key implements IBuffer, IString {
  private key: string;
  private suffix: string;
  readonly version: "m2";
  readonly type: KeyPairType;
  readonly isPriv: boolean;

  constructor(s: string) {
    StringAssert.with(s, MitumError.detail(ECODE.INVALID_KEY, "invalid key"))
      .empty()
      .not()
      .chainOr(
        s.endsWith(SUFFIX.KEY_PRIVATE) &&
          MitumConfig.KEY.M2.PRIVATE.satisfy(s.length),
        s.endsWith(SUFFIX.KEY_ETHER_PRIVATE) &&
          MitumConfig.KEY.M2ETHER.PRIVATE.satisfy(s.length),
        s.endsWith(SUFFIX.KEY_PUBLIC) &&
          MitumConfig.KEY.M2.PUBLIC.satisfy(s.length),
        s.endsWith(SUFFIX.KEY_ETHER_PUBLIC) &&
          MitumConfig.KEY.M2ETHER.PUBLIC.satisfy(s.length)
      )
      .excute();

    this.key = s.substring(0, s.length - MitumConfig.SUFFIX.DEFAULT.value!);
    this.suffix = s.substring(s.length - MitumConfig.SUFFIX.DEFAULT.value!);

    this.version = "m2";
    this.type =
      s.endsWith(SUFFIX.KEY_ETHER_PRIVATE) ||
      s.endsWith(SUFFIX.KEY_ETHER_PUBLIC)
        ? "ether"
        : "mitum";
    this.isPriv =
      s.endsWith(SUFFIX.KEY_PRIVATE) || s.endsWith(SUFFIX.KEY_ETHER_PRIVATE);
  }

  static from(s: string | Key) {
    return s instanceof Key ? s : new Key(s);
  }

  get noSuffix(): string {
    return this.key;
  }

  toBuffer(): Buffer {
    return Buffer.from(this.toString());
  }

  toString(): string {
    return this.key + this.suffix;
  }
}

export class PubKey extends Key implements IHintedObject {
  private static hint = new Hint(HINT.KEY);
  readonly weight: Big;

  constructor(key: string | Key, weight: number | string | Big) {
    super(typeof key === "string" ? key : key.toString());
    this.weight = Big.from(weight);

    Assert.check(
      MitumConfig.WEIGHT.satisfy(this.weight.v),
      MitumError.detail(ECODE.INVALID_PUBLIC_KEY, "weight out of range")
    );
  }

  toBuffer(): Buffer {
    return Buffer.concat([super.toBuffer(), this.weight.toBuffer("fill")]);
  }

  toHintedObject(): HintedObject {
    return {
      _hint: PubKey.hint.toString(),
      weight: this.weight.v,
      key: this.toString(),
    };
  }
}

export class Keys implements IBuffer, IHintedObject {
  private static hint = new Hint(HINT.KEYS);
  private _keys: PubKey[];
  readonly threshold: Big;

  constructor(keys: Pub[], threshold: BigArg) {
    Assert.check(
      MitumConfig.KEYS_IN_ACCOUNT.satisfy(keys.length),
      MitumError.detail(ECODE.INVALID_KEYS, "keys length out of range")
    );

    this._keys = keys.map((k) => {
      if (k instanceof PubKey) {
        return k;
      }

      const [key, weight] = k;
      return new PubKey(key instanceof Key ? key.toString() : key, weight);
    });
    this.threshold = threshold instanceof Big ? threshold : new Big(threshold);

    Assert.check(
      MitumConfig.THRESHOLD.satisfy(this.threshold.v),
      MitumError.detail(ECODE.INVALID_KEYS, "threshold out of range")
    );
    Assert.check(
      new Set(this._keys.map((k) => k.toString())).size === this._keys.length,
      MitumError.detail(ECODE.INVALID_KEYS, "duplicate keys found in keys")
    );
  }

  get keys(): PubKey[] {
    return this._keys;
  }

  get address(): Address {
    return new Address(
      base58.encode(sha3(this.toBuffer())) + SUFFIX.ACCOUNT_ADDRESS
    );
  }

  toBuffer(): Buffer {
    return Buffer.concat([
      Buffer.concat(
        this._keys
          .sort((a, b) =>
            Buffer.compare(Buffer.from(a.toString()), Buffer.from(b.toBuffer()))
          )
          .map((k) => k.toBuffer())
      ),
      this.threshold.toBuffer("fill"),
    ]);
  }

  toHintedObject(): HintedObject {
    return {
      _hint: Keys.hint.toString(),
      hash: base58.encode(sha3(this.toBuffer())),
      keys: this._keys
        .sort((a, b) =>
          Buffer.compare(Buffer.from(a.toString()), Buffer.from(b.toBuffer()))
        )
        .map((k) => k.toHintedObject()),
      threshold: this.threshold.v,
    };
  }
}

export class EtherKeys implements IBuffer, IHintedObject {
  private static hint = new Hint(HINT.ETH_KEYS);
  private _keys: PubKey[];
  readonly threshold: Big;

  constructor(keys: Pub[], threshold: BigArg) {
    Assert.check(
      MitumConfig.KEYS_IN_ACCOUNT.satisfy(keys.length),
      MitumError.detail(ECODE.INVALID_KEYS, "keys length out of range")
    );

    this._keys = keys.map((k) => {
      if (k instanceof PubKey) {
        return k;
      }

      const [key, weight] = k;
      return new PubKey(key instanceof Key ? key.toString() : key, weight);
    });
    this.threshold = threshold instanceof Big ? threshold : new Big(threshold);

    Assert.check(
      MitumConfig.THRESHOLD.satisfy(this.threshold.v),
      MitumError.detail(ECODE.INVALID_KEYS, "threshold out of range")
    );
    Assert.check(
      new Set(this._keys.map((k) => k.toString())).size === this._keys.length,
      MitumError.detail(ECODE.INVALID_KEYS, "duplicate keys found in keys")
    );
  }

  get keys(): PubKey[] {
    return this._keys;
  }

  get etherAddress(): Address {
    return new Address(
      keccak256(this.toBuffer()).subarray(12).toString("hex") +
        SUFFIX.ETHER_ACCOUNT_ADDRESS
    );
  }

  toBuffer(): Buffer {
    return Buffer.concat([
      Buffer.concat(
        this._keys
          .sort((a, b) =>
            Buffer.compare(Buffer.from(a.toString()), Buffer.from(b.toBuffer()))
          )
          .map((k) => k.toBuffer())
      ),
      this.threshold.toBuffer("fill"),
    ]);
  }

  toHintedObject(): HintedObject {
    const eHash = keccak256js(this.toBuffer());

    return {
      _hint: EtherKeys.hint.toString(),
      hash: eHash.slice(24),
      keys: this._keys
        .sort((a, b) =>
          Buffer.compare(Buffer.from(a.toString()), Buffer.from(b.toBuffer()))
        )
        .map((k) => k.toHintedObject()),
      threshold: this.threshold.v,
    };
  }
}
