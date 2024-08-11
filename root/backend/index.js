const cluster = require("cluster");
const os = require("os");
const cpuNUms = os.cpus().length;

const process = require("process");
const path = require("path");
const cors = require("cors");
const express = require("express");
const mime = require("mime");
const multer = require("multer");

if (cluster.isPrimary) {
  for (let i = 0; i < cpuNUms; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, os.tmpdir());
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });
  const upload = multer({ storage: storage, limits: { fileSize: 10000000 } });

  const app = express();

  const imageFilesRouter = express.Router();
  imageFilesRouter.use(express.static(os.tmpdir()));
  app.use("/api", imageFilesRouter);
  //cors
  app.use(cors());

  //llsb steg
  const encode_llsb = require("./steg/llsb/encode");
  const decode_llsb = require("./steg/llsb/decode");
  //rlsb
  const encode_rlsb = require("./steg/rlsb/encode");
  const decode_rlsb = require("./steg/rlsb/decode");

  //api to encode message in image using LSB
  app.post(
    "/api/steg/llsb/encode",
    upload.single("coverFile"),
    async function (req, res) {
      try {
        const supported_file_type = ["jpg", "jpeg", "png"];
        const file_extension = mime.getExtension(
          mime.getType(`${os.tmpdir()}/${req.file.originalname}`)
        );
        if (!supported_file_type.includes(file_extension)) {
          console.log("wrong file type");
          res.send(
            JSON.stringify({ success: false, error: "Wrong file type!" })
          );
          return;
        }

        const em = await encode_llsb(
          `${os.tmpdir()}/${req.file.originalname}`,
          req.body.message,
          req.body.stegoKey,
          `${os.tmpdir()}/${path.basename(
            req.file.originalname,
            path.extname(req.file.originalname)
          )}.png`
        );
        if (em.success) {
          res.end(
            JSON.stringify({
              success: true,
              coverFilePath: `/api/${req.file.originalname}`,
              stegoFilePath: `/api/${path.basename(
                req.file.originalname,
                path.extname(req.file.originalname)
              )}.png`,
            })
          );
        } else {
          res.end(JSON.stringify({ success: false }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  );

  //api to extract message from image using LSB
  app.post(
    "/api/steg/llsb/decode",
    upload.single("stegoFile"),
    async function (req, res) {
      try {
        const dm = await decode_llsb(
          `${os.tmpdir()}/${req.file.originalname}`,
          req.body.stegoKey
        );
        res.end(JSON.stringify(dm));
      } catch (error) {
        console.log(error);
      }
    }
  );

  //dhi steg
  //api to embed message in image using dhi version
  app.post(
    "/api/steg/rlsb/encode",
    upload.single("coverFile"),
    async function (req, res) {
      try {
        const em = await encode_rlsb(
          `${os.tmpdir()}/${req.file.originalname}`,
          req.body.message,
          req.body.stegoKey,
          `${os.tmpdir()}/${path.basename(
            req.file.originalname,
            path.extname(req.file.originalname)
          )}.png`
        );
        if (em.success) {
          res.end(
            JSON.stringify({
              success: true,
              coverFilePath: `/api/${req.file.originalname}`,
              stegoFilePath: `/api/${path.basename(
                req.file.originalname,
                path.extname(req.file.originalname)
              )}.png`,
            })
          );
        } else {
          res.end(JSON.stringify({ success: false }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  );

  //api to extract message from image using dhi_version
  app.post(
    "/api/steg/rlsb/decode",
    upload.single("stegoFile"),
    async function (req, res) {
      try {
        const dm = await decode_rlsb(
          `${os.tmpdir()}/${req.file.originalname}`,
          req.body.stegoKey
        );
        res.end(JSON.stringify(dm));
      } catch (error) {
        console.log(error);
      }
    }
  );

  //serving static files
  app.use(express.static("./public"));
  app.get("*", (req, res) => {
    res.sendFile(resolve("public", "index.html"));
  });

  app.get("/healthz", (req, res) => {
    res.end(JSON.stringify({ success: true }));
  });

  app.listen(process.env.PORT || 5000, () => {
    console.log(
      new Date() + ": server listning at port " + (process.env.PORT || 5000)
    );
  });
}
