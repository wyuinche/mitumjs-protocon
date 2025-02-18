import { CurrencyID } from "../../types/property.js";
import { ServiceID } from "../../types/serviceId.js";
import { Fact } from "../../types/fact.js";
import { Address } from "../../account/address.js";
const CreateCredentialServiceFactHint = "mitum-credential-create-credential-service-operation-fact";
const CreateCredentialServiceHint = "mitum-credential-create-credential-service-operation";
export class CreateCredentialServiceFact extends Fact {
    constructor(token, sender, contract, credentialServiceID, currency) {
        super(CreateCredentialServiceFactHint, token);
        this.sender = new Address(sender);
        this.contract = new Address(contract);
        this.credentialServiceID = new ServiceID(credentialServiceID);
        this.currency = new CurrencyID(currency);
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            this.token.toBuffer(),
            this.sender.toBuffer(),
            this.contract.toBuffer(),
            this.credentialServiceID.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            sender: this.sender.toString(),
            contract: this.contract.toString(),
            credential_service_id: this.credentialServiceID.toString(),
            currency: this.currency.toString(),
        };
    }
    get operationHint() {
        return CreateCredentialServiceHint;
    }
}
//# sourceMappingURL=create.js.map