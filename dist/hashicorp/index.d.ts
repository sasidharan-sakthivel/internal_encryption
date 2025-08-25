import { DECRYPTION_PAYLOAD_DETAILS, DECRYPTION_PAYLOAD_DETAILS_STREAM, ENCRYPTION_PAYLOAD_DETAILS_STREAM, HASH_RESPONSE, HASH_RESPONSE_STREAM, PAYLOAD_OPTIONS, VERSION } from "../types.js";
import { IKeyVault } from "../encryption.interface.js";
import { Readable } from "stream";
declare class Vault_HashiCorp implements IKeyVault {
    defaultPolicy: null | string;
    constructor(defaultPolicy: string);
    private getKey;
    hash(type: string, payload: string, version?: VERSION): Promise<HASH_RESPONSE>;
    encrypt(type: string, payload: string, version: VERSION): Promise<DECRYPTION_PAYLOAD_DETAILS>;
    decrypt(payload: DECRYPTION_PAYLOAD_DETAILS): Promise<string>;
    changeVersion(payload: DECRYPTION_PAYLOAD_DETAILS): Promise<DECRYPTION_PAYLOAD_DETAILS>;
    encryptStream(type: string, payload: Readable, version: VERSION): Promise<ENCRYPTION_PAYLOAD_DETAILS_STREAM>;
    decryptStream(payload: DECRYPTION_PAYLOAD_DETAILS_STREAM): Promise<import("crypto").DecipherGCM>;
    hashStream(type: string, payload: Readable, version?: VERSION): Promise<HASH_RESPONSE_STREAM>;
    changeVersionStream(payload: DECRYPTION_PAYLOAD_DETAILS_STREAM, options?: PAYLOAD_OPTIONS): Promise<ENCRYPTION_PAYLOAD_DETAILS_STREAM>;
}
export default Vault_HashiCorp;
