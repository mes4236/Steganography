const JIMP = require("jimp");
const encrypt = require("../../crypto/encode");

async function encode_llsb(
  cover_image_path,
  message,
  stegokey,
  stego_file_path
) {
  function get_delimiter(stegokey) {
    return require("crypto")
      .createHash("md5")
      .update(stegokey)
      .digest("hex")
      .slice(0, 32);
  }
  return new Promise(async (resolve, reject) => {
    try {
      message = await encrypt(message, stegokey);
      const image = await JIMP.read(cover_image_path);
      const IMAGE_WIDTH = image.getWidth();
      const IMAGE_HEIGHT = image.getHeight();
      const DELIMITER = get_delimiter(stegokey);
      message += DELIMITER;
      const MESSAGE_LENGTH = message.length;
      let bin_message = "";
      for (let i = 0; i < MESSAGE_LENGTH; i++) {
        bin_message += message.charCodeAt(i).toString(2).padStart(8, "0");
      }
      const BIN_MESSAGE_LENGTH = bin_message.length;
      if (IMAGE_WIDTH * IMAGE_HEIGHT * 3 < BIN_MESSAGE_LENGTH / 2) {
        resolve({ success: "false", error: "FILE_TOO_BIG" });
      }
      mainloop: for (let x = 0; x < image.getWidth(); x++) {
        for (let y = 0; y < image.getHeight(); y++) {
          let { r, g, b, a } = JIMP.intToRGBA(image.getPixelColor(x, y));
          let num = (x * image.getHeight() + y) * 6;
          if (num > BIN_MESSAGE_LENGTH) break mainloop;
          r = parseInt(bin_message.slice(num, num + 2), 2) | ((r >> 2) << 2);

          g =
            parseInt(bin_message.slice(num + 2, num + 4), 2) | ((g >> 2) << 2);
          b =
            parseInt(bin_message.slice(num + 4, num + 6), 2) | ((b >> 2) << 2);
          image.setPixelColor(JIMP.rgbaToInt(r, g, b, a), x, y);
        }
      }
      await image.writeAsync(stego_file_path);
      resolve({ success: true, stego_file_path: stego_file_path });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = encode_llsb;
