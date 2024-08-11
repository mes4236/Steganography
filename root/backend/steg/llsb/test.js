// let b = "a".charCodeAt(0).toString(2);

// console.log(b);

// let n = b[1] + b[2];

// console.log(n);

// let ls = 255 >> 2;
// console.log(ls);
// let rs = ls << 2;
// console.log(parseInt(n, 2) | rs);

// const delimiter = "lsb_end";

// let delimiter_bin = "";

// for (let i = 0; i < delimiter.length; i++) {
//   delimiter_bin += "0" + delimiter.charCodeAt(i).toString(2);
// }
// console.log(delimiter_bin);
// console.log(delimiter_bin.length);

// // for (let x = 0; x < 1000; x++) {
// //   for (y = 0; y < 1000; y++) {
// //     let num = x * 1000 + y; //100 represents max of y
// //   }
// // }

// let str = "drunhliuaegliewurlsb_end";
// let str_len = str.length;

// console.log(str.slice(str_len - 7, str_len));
// let r = 204;
// console.log(r.toString(2));
// console.log((3 | ((r >> 2) << 2)).toString(2));
// console.log((245).toString(2));
// let aa = (245 << 2).toString(2);
// console.log(aa);
// // console.log(aa << );

// console.log((245).toString(2));
// console.log((245).toString(2).padStart(8, "0").slice(6, 8));

// console.log(String.fromCharCode(parseInt("11000000", 2)));

const str = "01101000";

console.log(String.fromCharCode(parseInt(str, 2)));
