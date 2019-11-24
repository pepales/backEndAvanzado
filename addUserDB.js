"use strict";
const readLine = require("readline");
const db = require("./lib/connectMongoose");
const Users = require("./models/Usuario");

db.once("open", async function() {
  try {
    const answer = await askUser(
      "Are you sure you want to empty DB? (yes)/(no) "
    );
    if (answer.toLowerCase() === "yes") {
      // Inicializar nuestros modelos
      await initUsuarios();
    } else {
      console.log("DB install aborted!");
    }
    return process.exit(0);
  } catch (err) {
    console.log("Error!", err);
    return process.exit(1);
  }
});

function askUser(question) {
  return new Promise((resolve, reject) => {
    const rl = readLine.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function initUsuarios() {
  await Users.remove({});
  console.log("Usuarios borrados.");

  // Cargar anuncios.json
  await Users.insertMany([
    {
      email: "user@example.com",
      password: await Users.hashPassword("1234")
    }
  ]);
  console.log("Usuarios añadidos");
}
