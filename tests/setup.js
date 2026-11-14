import mongoose from "mongoose";
import { before, beforeEach, after } from "mocha";
import { config } from "../src/config/index.js";

before(async function () {
  const databaseName = new URL(config.mongoUri).pathname.replace("/", "");

  if (databaseName !== "ShipNow_testing") {
    throw new Error(`Base de datos incorrecta para testing: ${databaseName}`);
  }

  await mongoose.connect(config.mongoUri);
  console.log("Conectado a MongoDB Testing");
});

beforeEach(async function () {
  const collections = mongoose.connection.collections;

  for (const collection of Object.values(collections)) {
    await collection.deleteMany({});
  }
});

after(async function () {
  await mongoose.disconnect();
  console.log("Desconectado de MongoDB Testing");
});
