var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from "axios";
import { isIPAddress } from "../utils/validation";
export class Node {
    constructor(provider) {
        this._node = "";
        this.setNode(provider);
    }
    setNode(provider) {
        if (isIPAddress(provider)) {
            this._node = provider;
            console.log("NOTE: mitum.js is running with RPC-URL: ", provider);
        }
        else {
            console.warn("NOTE: Failed to configure the RPC-URL. Please verify and register the RPC-URL");
        }
    }
    getNodeUri() {
        return this._node;
    }
    getNodeInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._node === "") {
                return Promise.reject(new Error("RPC-URL is not provided."));
            }
            try {
                const res = yield axios.get(`${this._node}/`);
                return res;
            }
            catch (error) {
                return Promise.reject(new Error(`Error getting node information: ${error.message}`));
            }
        });
    }
}
//# sourceMappingURL=node.js.map