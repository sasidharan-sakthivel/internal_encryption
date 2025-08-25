# 🔐 internal_encryption

A lightweight encryption and hashing library with provider-based key management.  
Currently supports **HashiCorp Vault**, with plans to add streaming support and additional providers in the future.

---

## Document

[Google Docs](https://docs.google.com/document/d/1tf6MENqAyt_uNJ6O5mPDXEUN2MDXj4rUFwWYOyjiSd0/edit?usp=sharing)

## Installation

```
npm install internal_encryption
```

## Key format.

![alt text](https://beeimg.com/images/o99667435341.png)

## Key version

**Key name and path name should be same.**

![alt text](https://beeimg.com/images/r53496401302.png)

## Environment Variables

You must configure the following environment variables before using the library:

```
    HASHICORP_VAULT=http://localhost:8200/v1/kv/data
    HASHICORP_TOKEN=root
```

```
    import * as dotenv from "dotenv";
    dotenv.config();

    import Encryption from "internal_encryption";

    // Example config (can be fetched from DB, Redis, etc.)
    const config = {
        provider: "hashicorp",
        defaultPolicy: "default"
    };

    const payload = {
        name: "Mike",
        message: "this is a secret message",
    };

    const encryption = new Encryption(config.provider, {
        defaultPolicy: config.defaultPolicy,
    });

    const encryptionAndDecryption = async () => {
        const encryptedPayload = await encryption.encrypt(payload);
        const decryptedPayload = await encryption.decrypt(encryptedPayload);

        console.log(encryptedPayload, decryptedPayload);
    };
    encryptionAndDecryption();

    const hasing = async () => {
        let hashOne = await encryption.hash(payload);
        let hashTwo = await encryption.hash(payload);

        console.log(hashOne, hashTwo);
        console.log("isSame = ", hashOne.hash == hashTwo.hash);
    };
    hasing();

    const hasingWithVersion = async () => {
        let hashOne = await encryption.hash(payload, {
            version: 1,
            type: "password",
        });
        let hashTwo = await encryption.hash(payload, {
            version: 1,
            type: "password",
        });

        console.log(hashOne, hashTwo);
        console.log("isSame = ", hashOne.hash == hashTwo.hash);
    };
    hasingWithVersion();

    // Store the encrypted results as base64 string.
    const base64Encode = () => {
        return new Transform({
            transform(chunk, _enc, cb) {
            cb(null, chunk.toString("base64"));
            },
        });
    };

    const base64Decode = () => {
        return new Transform({
            transform(chunk, _enc, cb) {
            cb(null, Buffer.from(chunk.toString(), "base64"));
            },
        });
    };

    const encryptionAndDecryptionStreams = async () => {
        const inputFile = path.join(__dirname, "longtext.txt");
        const encryptedFile = path.join(__dirname, "encrypted.txt");
        const decryptedFile = path.join(__dirname, "decrypted.txt");

        const encryptedPayload = await encryption.encryptStream(
            fs.createReadStream(inputFile)
        );

        const encryptedWritable = fs.createWriteStream(encryptedFile);
        await pipeline(encryptedPayload.stream, base64Encode(), encryptedWritable);

        const tag = encryptedPayload.getTag();
        if (!tag) throw new Error("Encryption failed: authTag is missing");

        const encryptedReadStream = fs
            .createReadStream(encryptedFile)
            .pipe(base64Decode());

        const decryptedStream = await encryption.decryptStream({
            stream: encryptedReadStream,
            salt: encryptedPayload.salt,
            iv: encryptedPayload.iv,
            tag: tag,
            type: encryptedPayload.type,
            version: encryptedPayload.version,
            provider: "hashicorp",
            algorithm: "aes-256-gcm",
        });

        const decryptedWritable = fs.createWriteStream(decryptedFile);
        await pipeline(decryptedStream, decryptedWritable);

        console.log("✅ Encryption & Decryption completed successfully!");
    };

```

## Features

    - 🔑 Provider-based encryption and hashing
    - 🏗️ Currently supports HashiCorp Vault
    - 📄 Easy integration with .env configs
    - 📦 Small payloads optimized (stream support coming soon)

## Common Errors

    - INVALID_CONFIGURATION: Missing required field 'providerName' in configuration.
    - INVALID_CONFIGURATION: Missing required field 'defaultPolicy'.
    - INVALID_PAYLOAD: The provided payload is empty, malformed, or not supported. Please ensure a valid string or stream is passed.
    - INVALID_PAYLOAD: The provided payload is empty, malformed, or not supported. Some keys are missing. ( Decryption )
    - TYPE_OR_VERSION_NOT_FOUND: The requested key type or version is not defined.
    - KEY_NOT_FOUND: No matching key found. Either the key is missing, the provided type is invalid, or the requested version does not exist.
    - VERSION_NOT_FOUND: The requested key version is missing or does not exist.
    - INVALID_ENCRYPTION_DETAILS: Encryption failed due to invalid payload, type, or version.
    - INVALID_DECRYPTION_DETAILS: Decryption failed because the payload is invalid, corrupted, or incompatible with the provided key.
