"use strict";

const cote = require("cote");
const jimp = require("jimp");

const responder = new cote.Responder({ name: "thumbnail service" });

responder.on("thumbnail", (req, cb) => {
  
  cb(jimp.read(req.imgPath + req.nameImg)
  .then(thumbResize => {
    console.log("Creando thumbnail --> " + req.nameImg);
    return thumbResize
      .resize(100, 100) // resize
      .quality(60) // set JPEG quality
      .write(req.imgPath + req.nameImg); // save
  })
  .catch(err => {
    console.error(err);
  })
  );
});
