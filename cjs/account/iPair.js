"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyPair = void 0;
const hmac_1 = require("@noble/hashes/hmac");
const secp256k1 = __importStar(require("@noble/secp256k1"));
const sha256_1 = require("@noble/hashes/sha256");
const bs58_1 = __importDefault(require("bs58"));
const crypto = __importStar(require("crypto"));
const elliptic_1 = require("elliptic");
const ec = new elliptic_1.ec("secp256k1");
const math_js_1 = require("../utils/math.js");
const error_js_1 = require("../utils/error.js");
class KeyPair {
    constructor(privateKey) {
        this.privateKey = privateKey;
        this.signer = this.getSigner();
        this.publicKey = this.getPub();
        secp256k1.utils.hmacSha256Sync = (key, ...msgs) => (0, hmac_1.hmac)(sha256_1.sha256, key, secp256k1.utils.concatBytes(...msgs));
        secp256k1.utils.sha256Sync = (...msgs) => (0, sha256_1.sha256)(secp256k1.utils.concatBytes(...msgs));
    }
    static random(option) {
        return this.generator.random(option);
    }
    static fromPrivate(key) {
        return this.generator.fromPrivate(key);
    }
    static fromSeed(seed, option) {
        return this.generator.fromSeed(seed, option);
    }
    btcSign(msg) {
        return Buffer.from(secp256k1.signSync((0, math_js_1.sha256)((0, math_js_1.sha256)(msg)), this.signer));
    }
    ethSign(msg) {
        const key = ec.keyFromPrivate(this.privateKey.noSuffix, "hex");
        const msgHash = crypto.createHash("sha256").update(msg).digest();
        const signature = key.sign(msgHash);
        const r = Buffer.from(signature.r.toArray());
        const s = Buffer.from(signature.s.toArray());
        // const sig = secp256k1.signSync(
        //   crypto.createHash("sha256").update(msg).digest(),
        //   this.signer
        // );
        // const r = Buffer.from(signature.slice(0, 32));
        // const s = Buffer.from(signature.slice(32, 64));
        const sigLength = 4 + r.length + s.length;
        const sigBuffer = Buffer.alloc(sigLength);
        sigBuffer.writeUInt32LE(r.length, 0);
        sigBuffer.set(r, 4);
        sigBuffer.set(s, 4 + r.length);
        return sigBuffer;
        // const sig = secp256k1.signSync(
        //   nobleSha256(msg),
        //   // (this.signer as EthWallet).getPrivateKey()
        //   this.signer
        // );
        // const rlen = sig[3];
        // const r = sig.slice(4, 4 + rlen);
        // const slen = sig[5 + rlen];
        // const s = sig.slice(6 + rlen);
        // const brlen = new Big(rlen).toBuffer();
        // const buf = Buffer.alloc(rlen + slen + 4);
        // brlen.copy(buf, 0, 0, 4);
        // Buffer.from(r).copy(buf, 4, 0, rlen);
        // Buffer.from(s).copy(buf, rlen + 4, 0, slen);
        // return buf;
    }
    // from seed
    static from(seed) {
        seed = Buffer.from(bs58_1.default.encode((0, math_js_1.sha3)(Buffer.from(seed))));
        error_js_1.Assert.check(40 <= seed.length, error_js_1.MitumError.detail(error_js_1.ECODE.INVALID_SEED, "seed length out of range"));
        seed = seed.subarray(0, 40);
        const N = secp256k1.CURVE.n - BigInt(1);
        let k = new math_js_1.Big(seed).big;
        k %= N;
        k += BigInt(1);
        return k;
    }
}
exports.KeyPair = KeyPair;
//# sourceMappingURL=iPair.js.map