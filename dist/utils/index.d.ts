import { DECRYPTION_PAYLOAD_DETAILS, DECRYPTION_PAYLOAD_DETAILS_STREAM } from "../types.js";
export declare function validateEnvVars(): void;
export declare const isValidDecryptionPayloadStream: (payload: DECRYPTION_PAYLOAD_DETAILS_STREAM) => boolean;
export declare const isValidDecryptionPayload: (payload: DECRYPTION_PAYLOAD_DETAILS) => boolean;
