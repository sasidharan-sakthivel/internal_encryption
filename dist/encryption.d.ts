import * as crypto from "crypto";
import { DECRYPTION_PAYLOAD } from "./types.js";
import { Readable } from "stream";
export declare const encrypt_symmentric: (payload: string, passphrase: string) => {
    ciphertext: string;
    salt: string;
    iv: string;
    tag: string;
};
export declare const decrypte_symmentric: (payload: DECRYPTION_PAYLOAD, passphrase: string) => string;
export declare const hashWithKey: (payload: string, key: string) => string;
export declare function encryptStream(input: Readable, passphrase: string): {
    stream: crypto.CipherGCM;
    salt: string;
    iv: string;
    getTag: () => string;
};
export declare function decryptStream(payload: {
    stream: Readable;
    salt: string;
    iv: string;
    tag: string;
}, passphrase: string): crypto.DecipherGCM;
export declare const hashWithKeyStream: (stream: Readable, key: string) => Readable;
