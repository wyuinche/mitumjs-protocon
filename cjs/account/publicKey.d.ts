/// <reference types="node" />
import { Address } from "./address.js";
import { Big } from "../utils/math.js";
import { KeyPairType } from "../types/address.js";
import { HintedObject, IBuffer, IHintedObject, IString } from "../types/interface.js";
type BigArg = string | number | Big;
type Pub = [string | Key, BigArg] | PubKey;
export declare class Key implements IBuffer, IString {
    private key;
    private suffix;
    readonly version: "m2";
    readonly type: KeyPairType;
    readonly isPriv: boolean;
    constructor(s: string);
    static from(s: string | Key): Key;
    get noSuffix(): string;
    toBuffer(): Buffer;
    toString(): string;
}
export declare class PubKey extends Key implements IHintedObject {
    private static hint;
    readonly weight: Big;
    constructor(key: string | Key, weight: number | string | Big);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
}
export declare class Keys implements IBuffer, IHintedObject {
    private static hint;
    private _keys;
    readonly threshold: Big;
    constructor(keys: Pub[], threshold: BigArg);
    get keys(): PubKey[];
    get address(): Address;
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
}
export declare class EtherKeys implements IBuffer, IHintedObject {
    private static hint;
    private _keys;
    readonly threshold: Big;
    constructor(keys: Pub[], threshold: BigArg);
    get keys(): PubKey[];
    get etherAddress(): Address;
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
}
export {};
