import { OperationType } from "../../types/operation.js";
import { isIPAddress } from "../../utils/validation.js";
import { isAddress } from "../../utils/validation.js";
import { TimeStamp as time } from "../../utils/time.js";
import timestampInfo from "./information.js";
import { AppendFact } from "./append.js";
import { ServiceRegisterFact } from "./register.js";
export class Timestamp {
    constructor(networkID, provider) {
        this._networkID = "";
        this._node = "";
        this._contractAddress = "";
        this._serviceID = "";
        this._setNode(provider);
        this._setChain(networkID);
    }
    _setNode(provider) {
        if (isIPAddress(provider)) {
            this._node = provider;
        }
    }
    _setChain(networkID) {
        this._networkID = networkID;
    }
    setContractAddress(contractAddress) {
        if (this._contractAddress !== contractAddress &&
            isAddress(contractAddress)) {
            this._contractAddress = contractAddress;
            console.log("Contract address is changed : ", this._contractAddress);
        }
        else {
            console.error("This is invalid address type");
        }
    }
    setServiceId(serviceId) {
        if (this._serviceID !== serviceId) {
            this._serviceID = serviceId;
            console.log("Service ID is changed : ", this._serviceID);
        }
    }
    getContractAddress() {
        return this._contractAddress.toString();
    }
    getServiceId() {
        return this._serviceID.toString();
    }
    async getServiceInfo(serviceID) {
        let sid = this._serviceID;
        if (serviceID !== undefined) {
            sid = serviceID;
        }
        const res = await timestampInfo.getServiceInfo(this._node, this._contractAddress, sid);
        if (!res) {
            return null;
        }
        return res.data;
    }
    async getTimestampInfo(serviceID, projectID, tID) {
        const res = await timestampInfo.getTimestampInfo(this._node, this._contractAddress, serviceID, projectID, tID);
        if (!res) {
            return null;
        }
        return res.data;
    }
    append(sender, projectID, requestTime, data, currencyID) {
        const token = new time().UTC();
        const fact = new AppendFact(token, sender, this._contractAddress, this._serviceID, projectID, requestTime, data, currencyID);
        return new OperationType(this._networkID, fact);
    }
    createTimestampService(sender, serviceId, currencyID) {
        const token = new time().UTC();
        const fact = new ServiceRegisterFact(token, sender, this._contractAddress, serviceId, currencyID);
        this.setServiceId(serviceId);
        return new OperationType(this._networkID, fact);
    }
}
//# sourceMappingURL=index.js.map