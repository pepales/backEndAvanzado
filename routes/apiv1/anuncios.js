"use strict";

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Anuncio = mongoose.model("Anuncio");
const cote = require("cote");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./public/images/thumbnails/");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

router.get("/", (req, res, next) => {
  const start = parseInt(req.query.start) || 0;
  const limit = parseInt(req.query.limit) || 1000; // nuestro api devuelve max 1000 registros
  const sort = req.query.sort || "_id";
  const includeTotal = req.query.includeTotal === "true";
  const filters = {};
  if (typeof req.query.tag !== "undefined") {
    filters.tags = req.query.tag;
  }

  if (typeof req.query.venta !== "undefined") {
    filters.venta = req.query.venta;
  }

  if (typeof req.query.precio !== "undefined" && req.query.precio !== "-") {
    if (req.query.precio.indexOf("-") !== -1) {
      filters.precio = {};
      let rango = req.query.precio.split("-");
      if (rango[0] !== "") {
        filters.precio.$gte = rango[0];
      }

      if (rango[1] !== "") {
        filters.precio.$lte = rango[1];
      }
    } else {
      filters.precio = req.query.precio;
    }
  }

  if (typeof req.query.nombre !== "undefined") {
    filters.nombre = new RegExp("^" + req.query.nombre, "i");
  }

  Anuncio.list(filters, start, limit, sort, includeTotal, function(
    err,
    anuncios
  ) {
    if (err) return next(err);
    res.json({ ok: true, result: anuncios });
  });
});

// Return the list of available tags
router.get("/tags", function(req, res) {
  res.json({ ok: true, allowedTags: Anuncio.allowedTags() });
});

router.post("/", upload.single("foto"), async (req, res, next) => {
  try {
    const data = req.body;
    const anuncio = new Anuncio(data);
    anuncio.foto = req.file.filename;
    const anuncioGuardado = await anuncio.save();

    res.json({ success: true, result: anuncioGuardado });

    // Microservicio cliente

    const requester = new cote.Requester({ name: "thumbnail client" });
    const request = {
      type: "thumbnail",
      nameImg: req.file.filename,
      imgPath: req.file.destination,
    };

    requester.send(request, (response) => {
      console.log(`Enviando imagen --> ${request.nameImg}`);
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
