import { DECRYPTION_PAYLOAD_DETAILS, DECRYPTION_PAYLOAD_DETAILS_STREAM, PAYLOAD_OPTIONS } from "./types.js";
import { Readable } from "stream";
type CONFIG = {
    defaultPolicy: string;
};
export default class Encryption {
    private provider;
    constructor(providerName: string, config: CONFIG);
    private payloadFormatter;
    private loadProvider;
    encrypt(payload: unknown, options?: PAYLOAD_OPTIONS): Promise<DECRYPTION_PAYLOAD_DETAILS>;
    decrypt(payload: DECRYPTION_PAYLOAD_DETAILS): Promise<string>;
    changeVersion(payload: DECRYPTION_PAYLOAD_DETAILS): Promise<DECRYPTION_PAYLOAD_DETAILS>;
    hash(payload: unknown, options?: PAYLOAD_OPTIONS): Promise<import("./types.js").HASH_RESPONSE>;
    encryptStream(payload: Readable, options?: PAYLOAD_OPTIONS): Promise<import("./types.js").ENCRYPTION_PAYLOAD_DETAILS_STREAM>;
    decryptStream(payload: DECRYPTION_PAYLOAD_DETAILS_STREAM): Promise<import("crypto").DecipherGCM>;
    changeVersionStream(payload: DECRYPTION_PAYLOAD_DETAILS_STREAM, options?: PAYLOAD_OPTIONS): Promise<import("./types.js").ENCRYPTION_PAYLOAD_DETAILS_STREAM>;
    hashStream(payload: Readable, options?: PAYLOAD_OPTIONS): Promise<import("./types.js").HASH_RESPONSE_STREAM>;
}
export {};
