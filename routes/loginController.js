'use strict';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');

class LoginController {

async loginJWT(req, res, next) {
    try {
      // recoger credenciales de la petición
      const email = req.body.email;
      const password = req.body.password;

      // buscar el usuario en BD
      const usuario = await Usuario.findOne({ email: email });

      // si no lo encontramos le decimos que no
      
      if (!usuario || !await bcrypt.compare(password, usuario.password)) {
        res.json({ success: false, error: 'Invalid credentials' });
        return;
      }
      

      // creamos un JWT
      // no meter una instancia de mongoose en el Payload!!!!!!!!
      const token = jwt.sign({ _id: usuario._id }, process.env.JWT_SECRET, {
        expiresIn: '2d'
      });

      // respondemos
      res.json({ success: true, token: token });

    } catch(err) {
      next(err);
    }
  }
}

module.exports = new LoginController();