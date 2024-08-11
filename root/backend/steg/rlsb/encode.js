const encrypt = require("../../crypto/encode");
const JIMP = require("jimp");

async function encode_rlsb(
  cover_image_path,
  message,
  stego_key,
  stego_file_path
) {
  function get_random_loc_in_bin_str(loc_arr, MAX_N) {
    let random_number = Math.abs(Math.round(Math.random() * MAX_N) - 7);
    for (let i = 0; i < loc_arr.length; i++) {
      const element = loc_arr[i];
      if (random_number >= element && random_number <= element + 7) {
        return get_random_loc_in_bin_str(loc_arr, MAX_N);
      }
    }
    //console.log(random_number.toString(2).padStart(32, "0"));
    return random_number.toString(2).padStart(32, "0");
  }
  function get_null_in_bin_str() {
    return "".padStart(32, "0");
  }
  function get_head_loc(stego_key, MAX_N) {
    return Math.abs(
      (parseInt(
        require("crypto").createHash("md5").update(stego_key).digest("hex"),
        16
      ) %
        MAX_N) -
        7
    ); // -7 represent leaving 7 pixel gap from end of image 8 bit message + 32 bit next address
  }
  return new Promise(async (resolve, reject) => {
    JIMP.read(cover_image_path, async (err, image) => {
      const IMAGE_HEIGHT = image.getHeight();
      const IMAGE_WIDTH = image.getWidth();
      const MAX_N = IMAGE_HEIGHT * IMAGE_WIDTH;
      const loc_arr = [];

      //get header location
      let head = get_head_loc(stego_key, MAX_N);
      loc_arr.push(head);

      //encrypt tha message
      message = await encrypt(message, stego_key);
      //message to binary string form
      let bin_message = "";
      for (let i = 0; i < message.length; i++) {
        bin_message += message.charCodeAt(i).toString(2).padStart(8, "0");
      }
      for (
        let bin_message_pointer = 0;
        bin_message_pointer < bin_message.length;
        bin_message_pointer += 8
      ) {
        let next_loc =
          bin_message_pointer + 8 < bin_message.length
            ? get_random_loc_in_bin_str(loc_arr, MAX_N)
            : get_null_in_bin_str();
        // console.log(next_loc);
        let message_byte =
          bin_message.slice(bin_message_pointer, bin_message_pointer + 8) +
          next_loc;

        let message_byte_pointer = 0;
        //write data to cover_image
        for (let i = head; i < head + 7; i++) {
          let x = i % IMAGE_WIDTH;
          let y = (i - x) / IMAGE_WIDTH;
          let { r, g, b, a } = JIMP.intToRGBA(image.getPixelColor(x, y));

          //for r
          let message_to_stuff_in_channel = message_byte.slice(
            message_byte_pointer,
            message_byte_pointer + 2
          );
          if (message_to_stuff_in_channel !== "") {
            r = parseInt(message_to_stuff_in_channel, 2) | ((r >> 2) << 2);
            message_byte_pointer = message_byte_pointer + 2;
          }
          //for g
          message_to_stuff_in_channel = message_byte.slice(
            message_byte_pointer,
            message_byte_pointer + 2
          );
          if (message_to_stuff_in_channel !== "") {
            g = parseInt(message_to_stuff_in_channel, 2) | ((g >> 2) << 2);
            message_byte_pointer = message_byte_pointer + 2;
          }
          //for b
          message_to_stuff_in_channel = message_byte.slice(
            message_byte_pointer,
            message_byte_pointer + 2
          );
          if (message_to_stuff_in_channel !== "") {
            b = parseInt(message_to_stuff_in_channel, 2) | ((b >> 2) << 2);
            message_byte_pointer = message_byte_pointer + 2;
          }

          image.setPixelColor(JIMP.rgbaToInt(r, g, b, a), x, y);
        }

        //reassign head to new location
        head = parseInt(next_loc, 2);
        loc_arr.push(head);
      }
      await image.writeAsync(stego_file_path);
      resolve({ success: true });
    });
  });
}

module.exports = encode_rlsb;
