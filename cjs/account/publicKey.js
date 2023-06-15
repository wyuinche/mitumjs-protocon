"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Keys = exports.PubKey = exports.Key = void 0;
const bs58_1 = __importDefault(require("bs58"));
const address_1 = require("./address");
const math_1 = require("../utils/math");
const config_1 = require("../utils/config");
const property_1 = require("../types/property");
const hint_1 = require("../types/hint");
const error_1 = require("../utils/error");
class Key {
    constructor(s) {
        error_1.StringAssert.with(s, error_1.MitumError.detail(error_1.ECODE.INVALID_KEY, "invalid key"))
            .empty()
            .not()
            .chainOr(s.endsWith(hint_1.SUFFIX.KEY_PRIVATE) &&
            config_1.MitumConfig.KEY.M2.PRIVATE.satisfy(s.length), s.endsWith(hint_1.SUFFIX.KEY_ETHER_PRIVATE) &&
            config_1.MitumConfig.KEY.M2ETHER.PRIVATE.satisfy(s.length), s.endsWith(hint_1.SUFFIX.KEY_PUBLIC) &&
            config_1.MitumConfig.KEY.M2.PUBLIC.satisfy(s.length), s.endsWith(hint_1.SUFFIX.KEY_ETHER_PUBLIC) &&
            config_1.MitumConfig.KEY.M2ETHER.PUBLIC.satisfy(s.length))
            .excute();
        this.key = s.substring(0, s.length - config_1.MitumConfig.SUFFIX.DEFAULT.value);
        this.suffix = s.substring(s.length - config_1.MitumConfig.SUFFIX.DEFAULT.value);
        this.version = "m2";
        this.type =
            s.endsWith(hint_1.SUFFIX.KEY_ETHER_PRIVATE) ||
                s.endsWith(hint_1.SUFFIX.KEY_ETHER_PUBLIC)
                ? "ether"
                : "btc";
        this.isPriv =
            s.endsWith(hint_1.SUFFIX.KEY_PRIVATE) || s.endsWith(hint_1.SUFFIX.KEY_ETHER_PRIVATE);
    }
    static from(s) {
        return s instanceof Key ? s : new Key(s);
    }
    get noSuffix() {
        return this.key;
    }
    toBuffer() {
        return Buffer.from(this.toString());
    }
    toString() {
        return this.key + this.suffix;
    }
}
exports.Key = Key;
class PubKey extends Key {
    constructor(key, weight) {
        super(typeof key === "string" ? key : key.toString());
        this.weight = math_1.Big.from(weight);
        error_1.Assert.check(config_1.MitumConfig.WEIGHT.satisfy(this.weight.v), error_1.MitumError.detail(error_1.ECODE.INVALID_PUBLIC_KEY, "weight out of range"));
    }
    toBuffer() {
        return Buffer.concat([super.toBuffer(), this.weight.toBuffer("fill")]);
    }
    toHintedObject() {
        return {
            _hint: PubKey.hint.toString(),
            weight: this.weight.v,
            key: this.toString(),
        };
    }
}
exports.PubKey = PubKey;
PubKey.hint = new property_1.Hint(hint_1.HINT.KEY);
class Keys {
    constructor(keys, threshold) {
        error_1.Assert.check(config_1.MitumConfig.KEYS_IN_ACCOUNT.satisfy(keys.length), error_1.MitumError.detail(error_1.ECODE.INVALID_KEYS, "keys length out of range"));
        this._keys = keys.map((k) => {
            if (k instanceof PubKey) {
                return k;
            }
            const [key, weight] = k;
            return new PubKey(key instanceof Key ? key.toString() : key, weight);
        });
        this.threshold = threshold instanceof math_1.Big ? threshold : new math_1.Big(threshold);
        error_1.Assert.check(config_1.MitumConfig.THRESHOLD.satisfy(this.threshold.v), error_1.MitumError.detail(error_1.ECODE.INVALID_KEYS, "threshold out of range"));
        error_1.Assert.check(new Set(this._keys.map((k) => k.toString())).size === this._keys.length, error_1.MitumError.detail(error_1.ECODE.INVALID_KEYS, "duplicate keys found in keys"));
    }
    get keys() {
        return this._keys;
    }
    get address() {
        return new address_1.Address(bs58_1.default.encode((0, math_1.sha3)(this.toBuffer())) + hint_1.SUFFIX.ACCOUNT_ADDRESS);
    }
    get etherAddress() {
        return new address_1.Address((0, math_1.keccak256)(this.toBuffer()).subarray(12).toString("hex") +
            hint_1.SUFFIX.ETHER_ACCOUNT_ADDRESS);
    }
    toBuffer() {
        return Buffer.concat([
            Buffer.concat(this._keys
                .sort((a, b) => Buffer.compare(Buffer.from(a.toString()), Buffer.from(b.toBuffer())))
                .map((k) => k.toBuffer())),
            this.threshold.toBuffer("fill"),
        ]);
    }
    toHintedObject() {
        return {
            _hint: Keys.hint.toString(),
            hash: bs58_1.default.encode((0, math_1.sha3)(this.toBuffer())),
            keys: this._keys
                .sort((a, b) => Buffer.compare(Buffer.from(a.toString()), Buffer.from(b.toBuffer())))
                .map((k) => k.toHintedObject()),
            threshold: this.threshold.v,
        };
    }
}
exports.Keys = Keys;
Keys.hint = new property_1.Hint(hint_1.HINT.KEYS);
//# sourceMappingURL=publicKey.js.map