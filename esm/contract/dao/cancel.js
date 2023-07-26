import { ContractID, CurrencyID } from "../../types/property.js";
import { Address } from "../../account/address.js";
import { String } from "../../types/string.js";
import { Fact } from "../../types/fact.js";
const CancelProposalFactHint = "mitum-dao-cancel-proposal-operation-fact";
const CancelProposalHint = "mitum-dao-cancel-proposal-operation";
export class CancelProposalFact extends Fact {
    constructor(token, sender, contract, serviceId, proposalId, currency) {
        super(CancelProposalFactHint, token);
        this.sender = new Address(sender);
        this.contract = new Address(contract);
        this.serviceId = new ContractID(serviceId);
        this.proposalId = new String(proposalId);
        this.currency = new CurrencyID(currency);
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
        return {
            ...super.toHintedObject(),
            sender: this.sender.toString(),
            contract: this.contract.toString(),
            dao_id: this.serviceId.toString(),
            proposal_id: this.proposalId.toString(),
            currency: this.currency.toString(),
        };
    }
    get operationHint() {
        return CancelProposalHint;
    }
}
//# sourceMappingURL=cancel.js.map