import mocksService from "../services/mocks.service.js";
import seedService from "../services/seed.service.js";
import AppError from "../utils/errors.js";

class MocksController {
  getUsers = (req, res, next) =>
    this.handleGeneration(req, res, next, (qty) =>
      mocksService.generateUsers(qty),
    );

  getDrivers = (req, res, next) =>
    this.handleGeneration(req, res, next, (qty) =>
      mocksService.generateDrivers(qty),
    );

  getOrders = (req, res, next) =>
    this.handleGeneration(req, res, next, (qty) =>
      mocksService.generateOrders(qty),
    );

  getDeliveries = (req, res, next) =>
    this.handleGeneration(req, res, next, (qty) =>
      mocksService.generateDeliveries(qty),
    );

  getDataset = (req, res, next) =>
    this.handleGeneration(req, res, next, (qty) =>
      mocksService.generateRelatedData(qty),
    );

  handleGeneration = async (req, res, next, generator) => {
    try {
      const qty = Number(req.query.qty ?? 2);

      if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
        throw AppError.fromCode("INVALID_MOCK_QUANTITY");
      }

      const payload = await generator(qty);

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

      if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
        throw AppError.fromCode("INVALID_MOCK_QUANTITY");
      }

      const payload = await seedService.generateSeed(qty);

      return res.status(201).json({
        status: "success",
        payload,
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new MocksController();
