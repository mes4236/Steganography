const crypto = require("crypto");

async function encrypt(plainText, password) {
  return new Promise(async (resolve, reject) => {
    try {
      const iv = crypto.randomBytes(16);
      const key = crypto
        .createHash("sha256")
        .update(password)
        .digest("base64")
        .substr(0, 32);
      const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

      let encrypted = cipher.update(plainText);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      resolve(encrypted.toString("hex") + ":" + iv.toString("hex"));
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = encrypt;
