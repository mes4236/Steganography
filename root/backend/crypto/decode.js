const crypto = require("crypto");

async function decrypt(encryptedText, password) {
  return new Promise(async (resolve, reject) => {
    try {
      const textParts = encryptedText.split(":");
      const iv = Buffer.from(textParts.pop(), "hex");
      const encryptedData = Buffer.from(textParts[0], "hex");
      const key = crypto
        .createHash("sha256")
        .update(password)
        .digest("base64")
        .substr(0, 32);
      const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

      const decrypted = decipher.update(encryptedData);
      const decryptedText = Buffer.concat([decrypted, decipher.final()]);
      resolve(decryptedText.toString());
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = decrypt;
