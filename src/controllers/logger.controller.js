import logger from "../utils/logger.js";

class LoggerController {
  testLogger = (req, res) => {
    logger.debug("Prueba del logger: nivel debug");
    logger.http("Prueba del logger: nivel http");
    logger.info("Prueba del logger: nivel info");
    logger.warning("Prueba del logger: nivel warning");
    logger.error("Prueba del logger: nivel error");
    logger.fatal("Prueba del logger: nivel fatal");

    return res.status(200).json({
      status: "success",
      message: "Se generaron logs de prueba en todos los niveles",
    });
  };
}

export default new LoggerController();
