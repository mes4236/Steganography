const decrypt = require("../../crypto/decode");
const JIMP = require("jimp");

async function decode_rlsb(stego_image_path, stego_key) {
  function get_head_loc(stego_key, MAX_N) {
    return Math.abs(
      (parseInt(
        require("crypto").createHash("md5").update(stego_key).digest("hex"),
        16
      ) %
        MAX_N) -
        7
    ); // -7 represent leaving 7 pixel gap from end of image, 8 bit message + 32 bit next address
  }
  return new Promise(async (resolve, reject) => {
    JIMP.read(stego_image_path, async (err, image) => {
      if (!err) {
        const IMAGE_WIDTH = image.getWidth();
        const IMAGE_HEIGHT = image.getHeight();
        const MAX_N = IMAGE_WIDTH * IMAGE_HEIGHT; //total number of pixels to encode
        let head = get_head_loc(stego_key, MAX_N);
        let decoded_string = "";
        let byn = "";
        let next_lock = "";
        let bin_shdf = "";
        while (next_lock !== "".padStart(32, "0")) {
          //empty the string containers
          next_lock = "";
          byn = "";
          bin_shdf = "";
          for (let i = head; i < head + 7; i++) {
            const x = i % IMAGE_WIDTH;
            const y = (i - x) / IMAGE_WIDTH;
            let rgba = JIMP.intToRGBA(image.getPixelColor(x, y));
            for (const channel in rgba) {
              if (Object.hasOwnProperty.call(rgba, channel)) {
                if (channel !== "a") {
                  const element_bin = rgba[channel]
                    .toString(2)
                    .padStart(8, "0");
                  bin_shdf += element_bin.slice(
                    element_bin.length - 2,
                    element_bin.length
                  );
                }
              }
            }
          }
          function isASCII(str) {
            return /^[\x00-\x7F]*$/.test(str);
          }
          let decoded_character = String.fromCharCode(
            parseInt(bin_shdf.slice(0, 8), 2)
          );
          if (!isASCII(decoded_character)) {
            resolve({
              success: false,
              decodedText: false,
              reason: "no encoded message was found!",
            });
            return;
          }
          decoded_string += decoded_character;
          next_lock = bin_shdf.slice(8, 40);
          head = parseInt(next_lock, 2);
          if (head > MAX_N) {
            resolve({
              success: false,
              decodedText: null,
              reason: "no encoded message was found!",
            });
          }
        }
        decoded_string = await decrypt(decoded_string, stego_key);
        resolve({ success: true, decodedText: decoded_string });
      } else {
        reject(err);
      }
    });
  });
}

module.exports = decode_rlsb;
