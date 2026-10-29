import mongoose from "mongoose";
import app from "./app.js";
import { config } from "./config/index.js";
import logger from "./utils/logger.js";

try {
  await mongoose.connect(config.mongoUri);
  logger.info("Conexión a MongoDB establecida");

  app.listen(config.port, () => {
    logger.info(`Servidor corriendo en puerto ${config.port}`);
  });
} catch (error) {
  logger.fatal(`No fue posible conectar con MongoDB:, ${error.message}`);
  process.exit(1);
}
