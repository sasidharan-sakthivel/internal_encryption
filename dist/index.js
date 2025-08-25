import * as dotenv from "dotenv";
dotenv.config();
import Vault_HashiCorp from "./hashicorp/index.js";
import { isValidDecryptionPayload, isValidDecryptionPayloadStream, validateEnvVars, } from "./utils/index.js";
export default class Encryption {
    provider;
    constructor(providerName, config) {
        if (!providerName) {
            throw new Error("INVALID_CONFIGURATION: Missing required field 'providerName' in configuration.");
        }
        if (!config || !config.defaultPolicy) {
            throw new Error("INVALID_CONFIGURATION: Missing required field 'defaultPolicy'.");
        }
        validateEnvVars();
        this.provider = this.loadProvider(providerName, config);
    }
    payloadFormatter(payload) {
        let formattedPayload = payload;
        if (typeof payload == "object") {
            formattedPayload = JSON.stringify(payload);
        }
        if (typeof formattedPayload != "string") {
            throw new Error("INVALID_PAYLOAD: The provided payload is empty, malformed, or not supported. Please ensure a valid string.");
        }
        return formattedPayload;
    }
    loadProvider(providerName, config) {
        switch (providerName.toLowerCase()) {
            case "hashicorp":
                return new Vault_HashiCorp(config.defaultPolicy);
            default:
                throw new Error(`Unknown provider: ${providerName}`);
        }
    }
    async encrypt(payload, options) {
        if (!payload) {
            throw new Error("INVALID_PAYLOAD: The provided payload is empty, malformed, or not supported. Please ensure a valid string.");
        }
        return this.provider.encrypt(options?.type ?? "", this.payloadFormatter(payload), options?.version ?? null);
    }
    async decrypt(payload) {
        if (!isValidDecryptionPayload(payload)) {
            throw new Error("INVALID_PAYLOAD: The provided payload is empty, malformed, not supported or some keys are missing.");
        }
        return this.provider.decrypt(payload);
    }
    async changeVersion(payload) {
        if (!isValidDecryptionPayload(payload)) {
            throw new Error("INVALID_PAYLOAD: The provided payload is empty, malformed, not supported or some keys are missing.");
        }
        return this.provider.changeVersion(payload);
    }
    async hash(payload, options) {
        if (!payload) {
            throw new Error("INVALID_PAYLOAD: The provided payload is empty, malformed, or not supported. Please ensure a valid string.");
        }
        return this.provider.hash(options?.type ?? "", this.payloadFormatter(payload), options?.version ?? null);
    }
    async encryptStream(payload, options) {
        if (!payload) {
            throw new Error("INVALID_PAYLOAD: The provided payload is empty, malformed, or not supported. Please ensure a valid stream is passed.");
        }
        return this.provider.encryptStream(options?.type ?? "", payload, options?.version ?? null);
    }
    async decryptStream(payload) {
        if (!isValidDecryptionPayloadStream(payload)) {
            throw new Error("INVALID_PAYLOAD: The provided payload is empty, malformed, not supported or some keys are missing.");
        }
        return this.provider.decryptStream(payload);
    }
    async changeVersionStream(payload, options) {
        if (!payload) {
            throw new Error("INVALID_PAYLOAD: The provided payload is empty, malformed, or not supported. Please ensure a valid stream is passed.");
        }
        return this.provider.changeVersionStream(payload, options);
    }
    async hashStream(payload, options) {
        if (!payload) {
            throw new Error("INVALID_PAYLOAD: The provided payload is empty, malformed, or not supported. Please ensure a valid stream is passed.");
        }
        return this.provider.hashStream(options?.type ?? "", payload, options?.version ?? null);
    }
}
