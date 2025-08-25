import { Readable } from "stream";
import { DECRYPTION_PAYLOAD_DETAILS, DECRYPTION_PAYLOAD_DETAILS_STREAM, ENCRYPTION_PAYLOAD_DETAILS_STREAM, HASH_RESPONSE, HASH_RESPONSE_STREAM, PAYLOAD_OPTIONS, VERSION } from "./types.js";
import { DecipherGCM } from "crypto";
export interface IKeyVault {
    encrypt(type: string, payload: string, version: VERSION): Promise<DECRYPTION_PAYLOAD_DETAILS>;
    hash(type: string, payload: string, version: VERSION): Promise<HASH_RESPONSE>;
    decrypt(payload: DECRYPTION_PAYLOAD_DETAILS): Promise<string>;
    changeVersion(payload: DECRYPTION_PAYLOAD_DETAILS): Promise<DECRYPTION_PAYLOAD_DETAILS>;
    encryptStream(type: string, payload: Readable, version: VERSION): Promise<ENCRYPTION_PAYLOAD_DETAILS_STREAM>;
    decryptStream(payload: DECRYPTION_PAYLOAD_DETAILS_STREAM): Promise<DecipherGCM>;
    changeVersionStream(payload: DECRYPTION_PAYLOAD_DETAILS_STREAM, options?: PAYLOAD_OPTIONS): Promise<ENCRYPTION_PAYLOAD_DETAILS_STREAM>;
    hashStream(type: string, payload: Readable, version: VERSION): Promise<HASH_RESPONSE_STREAM>;
}
