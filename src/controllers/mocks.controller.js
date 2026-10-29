import mocksService from "../services/mocks.service.js";
import seedService from "../services/seed.service.js";
import logger from "../utils/logger.js";

class MocksController {
  getUsers = (req, res, next) =>
    this.handleGeneration(
      req,
      res,
      next,
      (qty) => mocksService.generateUsers(qty),
      "usuarios",
    );

  getDrivers = (req, res, next) =>
    this.handleGeneration(
      req,
      res,
      next,
      (qty) => mocksService.generateDrivers(qty),
      "repartidores",
    );

  getOrders = (req, res, next) =>
    this.handleGeneration(
      req,
      res,
      next,
      (qty) => mocksService.generateOrders(qty),
      "pedidos",
    );

  getDeliveries = (req, res, next) =>
    this.handleGeneration(
      req,
      res,
      next,
      (qty) => mocksService.generateDeliveries(qty),
      "entregas",
    );

  getDataset = (req, res, next) =>
    this.handleGeneration(
      req,
      res,
      next,
      (qty) => mocksService.generateRelatedData(qty),
      "dataset completo",
    );

  handleGeneration = async (req, res, next, generator, resource) => {
    try {
      const qty = Number(req.query.qty ?? 2);

      const payload = await generator(qty);
      logger.info(
        `Mocks generados correctamente. Tipo: ${resource}. Cantidad: ${qty}`,
      );

      return res.status(200).json({
        status: "success",
        payload,
      });
    } catch (error) {
      return next(error);
    }
  };

  generateSeed = async (req, res, next) => {
    try {
      const qty = Number(req.query.qty ?? 10);

      const payload = await seedService.generateSeed(qty);

      return res.status(201).json({
        status: "success",
        payload,
      });
    } catch (error) {
      return next(error);
    }
  };

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

export default new MocksController();
