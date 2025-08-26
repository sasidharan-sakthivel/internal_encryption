import * as crypto from "crypto";
import { Readable } from "stream";
export const encrypt_symmentric = (payload, passphrase) => {
    const salt = crypto.randomBytes(16);
    const key = crypto.scryptSync(passphrase, salt, 32);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const ciphertext = Buffer.concat([
        cipher.update(payload, "utf8"),
        cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return {
        ciphertext: ciphertext.toString("hex"),
        salt: salt.toString("hex"),
        iv: iv.toString("hex"),
        tag: tag.toString("hex"),
        // algorithm: "aes-256-gcm",
    };
};
export const decrypte_symmentric = (payload, passphrase) => {
    const salt = Buffer.from(payload.salt, "hex");
    const key = crypto.scryptSync(passphrase, salt, 32);
    const iv = Buffer.from(payload.iv, "hex");
    const tag = Buffer.from(payload.tag, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(payload.ciphertext, "hex")),
        decipher.final(),
    ]);
    return decrypted.toString("utf8");
};
export const hashWithKey = (payload, key) => {
    return crypto.createHmac("sha256", key).update(payload).digest("hex");
};
export function encryptStream(input, passphrase) {
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);
    const key = crypto.scryptSync(passphrase, salt, 32);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const encryptedStream = input.pipe(cipher);
    let authTag;
    cipher.on("end", () => {
        authTag = cipher.getAuthTag();
    });
    return {
        stream: encryptedStream,
        salt: salt.toString("hex"),
        iv: iv.toString("hex"),
        getTag: () => authTag?.toString("hex"),
        // algorithm: "aes-256-gcm",
    };
}
export function decryptStream(payload, passphrase) {
    const salt = Buffer.from(payload.salt, "hex");
    const iv = Buffer.from(payload.iv, "hex");
    const key = crypto.scryptSync(passphrase, salt, 32);
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(Buffer.from(payload.tag, "hex"));
    return payload.stream.pipe(decipher);
}
export const hashWithKeyStream = (stream, key) => {
    const hmac = crypto.createHmac("sha256", key);
    const outputStream = new Readable({ read() { } });
    stream.on("data", (chunk) => hmac.update(chunk));
    stream.on("end", () => {
        const digest = hmac.digest("hex");
        outputStream.push(digest);
        outputStream.push(null);
    });
    stream.on("error", (err) => outputStream.destroy(err));
    return outputStream;
};
