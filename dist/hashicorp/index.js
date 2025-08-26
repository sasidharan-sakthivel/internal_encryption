import { decrypte_symmentric, decryptStream, encrypt_symmentric, encryptStream, hashWithKey, hashWithKeyStream, } from "../encryption.js";
import { Readable } from "stream";
class Vault_HashiCorp {
    defaultPolicy;
    constructor(defaultPolicy) {
        this.defaultPolicy = defaultPolicy;
    }
    async getKey(type, version) {
        const finalType = type && type !== "" ? type : this.defaultPolicy;
        const finalVersion = version ? version : null;
        if (!finalType || (finalVersion && isNaN(finalVersion)))
            throw new Error("TYPE_OR_VERSION_NOT_FOUND: The requested key type or version is not defined. Please verify that the type exists and the version is available.");
        let key = null;
        let defaultVersion = null;
        try {
            let url = `${process.env.HASHICORP_VAULT}/${finalType}`;
            if (version) {
                url += `?version=${finalVersion}`;
            }
            let response = await fetch(url, {
                method: "GET",
                headers: {
                    "X-Vault-Token": process.env.HASHICORP_TOKEN,
                },
            });
            let keyDetails = (await response.json());
            if (keyDetails && keyDetails.data) {
                key = keyDetails.data.data[finalType] ?? null;
                defaultVersion = keyDetails?.data?.metadata?.version ?? null;
            }
        }
        catch (err) {
            throw new Error("KEY_NOT_FOUND: No matching key found. Either the key is missing, the provided type is invalid, or the requested version does not exist.");
        }
        if (!key)
            throw new Error("KEY_NOT_FOUND : key is missing or not found");
        if (!defaultVersion)
            throw new Error("VERSION_NOT_FOUND: The requested key version is missing or does not exist. Verify that the version number is correct.");
        return {
            key,
            version: version ? +version : +defaultVersion,
        };
    }
    async hash(type, payload, version) {
        if (!payload) {
            throw new Error("INVALID_PAYLOAD: The provided payload is empty, malformed, or not supported. Please ensure a valid string or stream is passed.");
        }
        let { key, version: keyVersion } = await this.getKey(type, version);
        try {
            let hashedValue = hashWithKey(payload, key);
            return {
                hash: hashedValue,
                version: version ? version : keyVersion,
                type: type ? type : this.defaultPolicy,
            };
        }
        catch (err) {
            throw new Error("INVALID_ENCRYPTION_DETAILS : encryption failed due to either invalid payload, type or version.");
        }
    }
    async encrypt(type, payload, version) {
        if (!payload) {
            throw new Error("INVALID_PAYLOAD: The provided payload is empty, malformed, or not supported. Please ensure a valid string or stream is passed.");
        }
        let { key, version: keyVersion } = await this.getKey(type, version);
        try {
            let encrypted = encrypt_symmentric(payload, key);
            return {
                ...encrypted,
                version: version || keyVersion,
                type: type ? type : this.defaultPolicy,
                provider: "hashicorp",
            };
        }
        catch (err) {
            throw new Error("INVALID_ENCRYPTION_DETAILS : encryption failed due to either invalid payload, type or version.");
        }
    }
    async decrypt(payload) {
        if (!payload) {
            throw new Error("INVALID_PAYLOAD: The provided payload is empty, malformed, or not supported. Please ensure a valid string or stream is passed.");
        }
        let { key } = await this.getKey(payload.type, payload.version);
        try {
            let decrypted = decrypte_symmentric(payload, key);
            return decrypted;
        }
        catch (err) {
            throw new Error("INVALID_DECRYPTION_DETAILS: Decryption failed because the payload is invalid, corrupted, or incompatible with the provided key.");
        }
    }
    async changeVersion(payload) {
        if (!payload) {
            throw new Error("INVALID_PAYLOAD: The provided payload is empty, malformed, or not supported. Please ensure a valid string or stream is passed.");
        }
        const currentVersion = payload.version;
        const [oldKey, newKey] = await Promise.all([
            this.getKey(payload.type, currentVersion),
            this.getKey(payload.type),
        ]);
        try {
            if (oldKey.version === newKey.version) {
                return payload;
            }
            const decrypted = decrypte_symmentric(payload, oldKey.key);
            const encrypted = encrypt_symmentric(decrypted, newKey.key);
            return {
                ...encrypted,
                version: newKey.version,
                type: payload.type || this.defaultPolicy,
                provider: "hashicorp",
            };
        }
        catch (err) {
            throw new Error("INVALID_DECRYPTION_DETAILS: Decryption failed because the payload is invalid, corrupted, or incompatible with the provided key.");
        }
    }
    async encryptStream(type, payload, version) {
        if (!payload) {
            throw new Error("INVALID_PAYLOAD: ...");
        }
        const { key, version: keyVersion } = await this.getKey(type, version);
        try {
            const inputStream = typeof payload === "string"
                ? Readable.from(payload, { encoding: "utf8" })
                : payload;
            const encrypted = encryptStream(inputStream, key);
            return {
                stream: encrypted.stream,
                salt: encrypted.salt,
                iv: encrypted.iv,
                // algorithm: encrypted.algorithm,
                getTag: encrypted.getTag,
                version: keyVersion,
                type: type ? type : this.defaultPolicy ? this.defaultPolicy : "",
                provider: "hashicorp",
            };
        }
        catch (err) {
            throw new Error("INVALID_ENCRYPTION_DETAILS: ...");
        }
    }
    async decryptStream(payload) {
        if (!payload || !payload.stream) {
            throw new Error("INVALID_PAYLOAD: The provided payload is empty, malformed, or not supported. Please ensure a valid stream is passed.");
        }
        const { key } = await this.getKey(payload.type, payload.version);
        try {
            return decryptStream(payload, key);
        }
        catch (err) {
            throw new Error("INVALID_DECRYPTION_DETAILS: Decryption failed because the payload is invalid, corrupted, or incompatible with the provided key.");
        }
    }
    async hashStream(type, payload, version) {
        if (!payload) {
            throw new Error("INVALID_PAYLOAD: The provided payload is empty, malformed, or not supported. Please ensure a valid string or stream is passed.");
        }
        const { key, version: keyVersion } = await this.getKey(type, version);
        try {
            const inputStream = typeof payload === "string"
                ? Readable.from(payload, { encoding: "utf8" })
                : payload;
            const hashedStream = hashWithKeyStream(inputStream, key);
            return {
                stream: hashedStream,
                version: version ?? keyVersion,
                type: type ? type : this.defaultPolicy ? this.defaultPolicy : "",
            };
        }
        catch (err) {
            throw new Error("INVALID_HASH_DETAILS: Hashing failed because the payload, type, or version is invalid or missing.");
        }
    }
    async changeVersionStream(payload, options) {
        if (!payload) {
            throw new Error("INVALID_PAYLOAD: Payload is empty or malformed.");
        }
        const currentVersion = payload.version;
        const [oldKey, newKey] = await Promise.all([
            this.getKey(payload.type, currentVersion),
            this.getKey(payload.type, options?.version ?? null),
        ]);
        if (oldKey.version === newKey.version) {
            return {
                stream: payload.stream,
                salt: payload.salt,
                iv: payload.iv,
                getTag: () => payload.tag,
                // algorithm: "aes-256-gcm",
                version: oldKey.version,
                type: payload.type,
                provider: "hashicorp",
            };
        }
        const decryptedStream = decryptStream({
            stream: payload.stream,
            salt: payload.salt,
            iv: payload.iv,
            tag: payload.tag,
        }, oldKey.key);
        const newEncrypted = encryptStream(decryptedStream, newKey.key);
        return {
            stream: newEncrypted.stream,
            salt: newEncrypted.salt,
            iv: newEncrypted.iv,
            getTag: newEncrypted.getTag,
            // algorithm: newEncrypted.algorithm,
            version: newKey.version,
            type: payload.type
                ? payload.type
                : this.defaultPolicy
                    ? this.defaultPolicy
                    : "",
            provider: "hashicorp",
        };
    }
}
export default Vault_HashiCorp;
