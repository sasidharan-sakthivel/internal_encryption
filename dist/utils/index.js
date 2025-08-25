export function validateEnvVars() {
    const required = ["HASHICORP_VAULT", "HASHICORP_TOKEN"];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`MISSING_ENV_VARS: ${missing.join(", ")}. Please set them in your .env file.`);
    }
}
export const isValidDecryptionPayloadStream = (payload) => {
    if (!payload ||
        !payload.tag ||
        !payload.salt ||
        !payload.iv ||
        !payload.stream ||
        !payload.type ||
        !payload.version ||
        !payload.provider) {
        return false;
    }
    return true;
};
export const isValidDecryptionPayload = (payload) => {
    if (!payload ||
        !payload.tag ||
        !payload.salt ||
        !payload.iv ||
        !payload.ciphertext ||
        !payload.type ||
        !payload.version ||
        !payload.provider) {
        return false;
    }
    return true;
};
