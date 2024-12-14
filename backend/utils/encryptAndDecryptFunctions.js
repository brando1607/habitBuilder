import crypto from "crypto";
process.loadEnvFile();

const key = crypto
  .createHash("sha256")
  .update(process.env.ENCRYPTION_KEY)
  .digest("hex");

class Encryption {
  constructor(key) {
    this.key = Buffer.from(key, "hex");
  }
  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", this.key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");

    encrypted += cipher.final("hex");

    return iv.toString("hex") + ":" + encrypted;
  }
  decrypt(encryptedText) {
    const parts = encryptedText.split(":");
    const iv = Buffer.from(parts[0], "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", this.key, iv);
    let decrypted = decipher.update(parts[1], "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }
}

export const encryption = new Encryption(key);
