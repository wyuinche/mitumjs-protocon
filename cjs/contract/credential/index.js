"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Credential = void 0;
const operation_js_1 = require("../../types/operation.js");
const validation_js_1 = require("../../utils/validation.js");
const validation_js_2 = require("../../utils/validation.js");
const time_js_1 = require("../../utils/time.js");
const assign_js_1 = require("./assign.js");
const revoke_js_1 = require("./revoke.js");
const create_js_1 = require("./create.js");
const template_js_1 = require("./template.js");
const information_js_1 = __importDefault(require("./information.js"));
class Credential {
    constructor(networkID, provider) {
        this._networkID = "";
        this._node = "";
        this._address = "";
        this._serviceID = "";
        this._setNode(provider);
        this._setChain(networkID);
    }
    _setNode(provider) {
        if ((0, validation_js_1.isIPAddress)(provider)) {
            this._node = provider;
        }
    }
    _setChain(networkID) {
        this._networkID = networkID;
    }
    setContractAddress(contractAddress) {
        if (this._address !== contractAddress && (0, validation_js_2.isAddress)(contractAddress)) {
            this._address = contractAddress;
            console.log("Contract address is changed : ", this._address);
        }
        else {
            console.error("This is invalid address type");
        }
    }
    setServiceId(serviceId) {
        if (this._serviceID !== serviceId) {
            this._serviceID = serviceId;
            console.log("Credential ID is changed : ", this._serviceID);
        }
    }
    getContractAddress() {
        return this._address.toString();
    }
    getServiceId() {
        return this._serviceID.toString();
    }
    createCredentialService(sender, serviceId, currency) {
        this.setServiceId(serviceId);
        const token = new time_js_1.TimeStamp().UTC();
        const fact = new create_js_1.CreateCredentialServiceFact(token, sender, this._address, this._serviceID, currency);
        return new operation_js_1.OperationType(this._networkID, fact);
    }
    /** Description of templateData **
      templateData = {
          templateId: string,
          templateName: string,
          serviceDate: date,
          expirationDate: date,
          templateShare: boolean,
          multiAudit: boolean,
          displayName: string,
          subjectKey: string,
          description: string,
          creator: string,
      }
    */
    addTemplate(sender, data, currency) {
        const token = new time_js_1.TimeStamp().UTC();
        const fact = new template_js_1.AddTemplateFact(token, sender, this._address, this._serviceID, data.templateId, data.templateName, data.serviceDate, data.expirationDate, data.templateShare, data.multiAudit, data.displayName, data.subjectKey, data.description, data.creator, currency);
        return new operation_js_1.OperationType(this._networkID, fact);
    }
    /** Description of issueData **
      issueData = {
          holder: string,
          templateId: string,
          id: string,
          value: string,
          validFrom: number,
          validUntil: number,
          did: string,
      }
    */
    issue(sender, data, currency) {
        const token = new time_js_1.TimeStamp().UTC();
        const item = new assign_js_1.AssignCredentialsItem(this._address, this._serviceID, data.holder, data.templateId, data.id, data.value, data.validFrom, data.validUntil, data.did, currency);
        const fact = new assign_js_1.AssignCredentialsFact(token, sender, [item]);
        return new operation_js_1.OperationType(this._networkID, fact);
    }
    revoke(sender, holder, templateId, id, currency) {
        const token = new time_js_1.TimeStamp().UTC();
        const item = new revoke_js_1.RevokeCredentialsItem(this._address, this._serviceID, holder, templateId, id, currency);
        const fact = new revoke_js_1.RevokeCredentialsFact(token, sender, [item]);
        return new operation_js_1.OperationType(this._networkID, fact);
    }
    getServiceInfo(serviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            let sid = this._serviceID;
            if (serviceId !== undefined) {
                sid = serviceId;
            }
            const res = yield information_js_1.default.getServiceInfo(this._node, this._address, sid);
            return res.data;
        });
    }
    getCredentialInfo(serviceId, templateId, credentialId) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield information_js_1.default.getCredentialInfo(this._node, this._address, serviceId, templateId, credentialId);
            return res.data;
        });
    }
    getTemplate(serviceId, templateId) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield information_js_1.default.getTemplate(this._node, this._address, serviceId, templateId);
            return res.data;
        });
    }
    getAllCredentials(serviceID, templateId) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield information_js_1.default.getCredentialByHolder(this._node, this._address, serviceID, templateId);
            return res.data;
        });
    }
    claimCredential(serviceID, holder) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield information_js_1.default.getCredentialByHolder(this._node, this._address, serviceID, holder);
            return res.data;
        });
    }
}
exports.Credential = Credential;
//# sourceMappingURL=index.js.map