import mongoose from "mongoose";
import app from "./app.js";
import { config } from "./config/index.js";

try {
  await mongoose.connect(config.mongoUri);
  console.log("Conexión a MongoDB establecida");

  app.listen(config.port, () => {
    console.log(`Servidor corriendo en puerto ${config.port}`);
  });
} catch (error) {
  console.error("No fue posible conectar con MongoDB:", error.message);
  process.exit(1);
}
