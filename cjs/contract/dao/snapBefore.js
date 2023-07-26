"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreSnapFact = void 0;
const property_js_1 = require("../../types/property.js");
const address_js_1 = require("../../account/address.js");
const string_js_1 = require("../../types/string.js");
const fact_js_1 = require("../../types/fact.js");
const PreSnapFactHint = "mitum-dao-pre-snap-operation-fact";
const PreSnapHint = "mitum-dao-pre-snap-operation";
class PreSnapFact extends fact_js_1.Fact {
    constructor(token, sender, contract, serviceId, proposalId, currency) {
        super(PreSnapFactHint, token);
        this.sender = new address_js_1.Address(sender);
        this.contract = new address_js_1.Address(contract);
        this.serviceId = new property_js_1.ContractID(serviceId);
        this.proposalId = new string_js_1.String(proposalId);
        this.currency = new property_js_1.CurrencyID(currency);
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            this.token.toBuffer(),
            this.sender.toBuffer(),
            this.contract.toBuffer(),
            this.serviceId.toBuffer(),
            this.proposalId.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return Object.assign(Object.assign({}, super.toHintedObject()), { sender: this.sender.toString(), contract: this.contract.toString(), dao_id: this.serviceId.toString(), proposal_id: this.proposalId.toString(), currency: this.currency.toString() });
    }
    get operationHint() {
        return PreSnapHint;
    }
}
exports.PreSnapFact = PreSnapFact;
//# sourceMappingURL=snapBefore.js.map