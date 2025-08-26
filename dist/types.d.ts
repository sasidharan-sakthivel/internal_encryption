import { Readable } from "stream";
export type VERSION = null | number;
export type ENCRYPTION_PAYLOAD = {
    data: any;
    type: string;
};
export type DECRYPTION_PAYLOAD = {
    salt: string;
    iv: string;
    ciphertext: string;
    tag: string;
};
export type DECRYPTION_PAYLOAD_DETAILS = {
    version: number;
    type: string;
    provider: string;
} & DECRYPTION_PAYLOAD;
export type PAYLOAD_OPTIONS = {
    type?: string;
    version?: VERSION;
};
export type HASH_RESPONSE = {
    hash: string;
    version: number;
    type: string;
};
export type ENCRYPTION_PAYLOAD_STREAM = {
    salt: string;
    iv: string;
    stream: Readable;
    getTag: () => string;
};
export type DECRYPTION_PAYLOAD_STREAM = {
    salt: string;
    iv: string;
    stream: Readable;
    tag: string;
};
export type DECRYPTION_PAYLOAD_DETAILS_STREAM = {
    version: number;
    type: string;
    provider: string;
} & DECRYPTION_PAYLOAD_STREAM;
export type ENCRYPTION_PAYLOAD_DETAILS_STREAM = {
    stream: Readable;
    salt: string;
    iv: string;
    getTag: () => string;
    version: number;
    type: string;
    provider: string;
};
export type HASH_RESPONSE_STREAM = {
    stream: Readable;
    version: number;
    type: string;
};
