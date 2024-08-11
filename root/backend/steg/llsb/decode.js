const JIMP = require("jimp");
const decrypt = require("../../crypto/decode");

async function decode_llsb(stego_image_path, stego_key) {
  function get_delimiter(stegokey) {
    return require("crypto")
      .createHash("md5")
      .update(stegokey)
      .digest("hex")
      .slice(0, 32);
  }
  return new Promise(async (resolve, reject) => {
    JIMP.read(stego_image_path, async function (err, image) {
      if (!err) {
        const IMAGE_WIDTH = image.getWidth();
        const IMAGE_HEIGHT = image.getHeight();
        const DELIMITER = get_delimiter(stego_key);
        let decoded_text = "";
        let byn = "";

        for (let x = 0; x < IMAGE_WIDTH; x++) {
          for (let y = 0; y < IMAGE_HEIGHT; y++) {
            let rgba = JIMP.intToRGBA(image.getPixelColor(x, y));
            for (const channel in rgba) {
              if (Object.hasOwnProperty.call(rgba, channel)) {
                if (byn.length == 8) {
                  function isASCII(str) {
                    return /^[\x00-\x7F]*$/.test(str);
                  }
                  let decoded_char = String.fromCharCode(parseInt(byn, 2));
                  if (!isASCII(decoded_char)) {
                    resolve({
                      success: false,
                      decodedText: false,
                      reason: "no encoded message was found!",
                    });
                    return;
                  }
                  decoded_text += String.fromCharCode(parseInt(byn, 2));
                  byn = "";
                  if (
                    decoded_text.slice(
                      decoded_text.length - 32,
                      decoded_text.length
                    ) == DELIMITER
                  ) {
                    decoded_text = await decrypt(
                      decoded_text.slice(0, decoded_text.length - 32),
                      stego_key
                    );
                    resolve({
                      success: true,
                      decodedText: decoded_text,
                    });
                    return;
                  }
                }
                if (channel != "a") {
                  byn += rgba[channel].toString(2).padStart(8, "0").slice(6, 8);
                }
              }
            }
          }
        }
        resolve({
          success: false,
          decodedText: null,
          reason: "no encoded message was found!",
        });
      } else {
        reject(err);
      }
    });
  });
}

module.exports = decode_llsb;
