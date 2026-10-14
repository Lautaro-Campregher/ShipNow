import mocksService from "../services/mocks.service.js";
import seedService from "../services/seed.service.js";

class MocksController {
  async handleGeneration(req, res, generator) {
    try {
      const qty = Number(req.query.qty ?? 2);

      if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
        return res.status(400).json({
          status: "error",
          message: "El parámetro qty debe ser un entero entre 1 y 100",
        });
      }

      const payload = await generator(qty);

      return res.status(200).json({
        status: "success",
        payload,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Error al generar datos ficticios",
      });
    }
  }

  getUsers(req, res) {
    return this.handleGeneration(req, res, (qty) =>
      mocksService.generateUsers(qty),
    );
  }

  getDrivers(req, res) {
    return this.handleGeneration(req, res, (qty) =>
      mocksService.generateDrivers(qty),
    );
  }

  getOrders(req, res) {
    return this.handleGeneration(req, res, (qty) =>
      mocksService.generateOrders(qty),
    );
  }

  getDeliveries(req, res) {
    return this.handleGeneration(req, res, (qty) =>
      mocksService.generateDeliveries(qty),
    );
  }

  async generateSeed(req, res) {
    try {
      const qty = Number(req.query.qty ?? 10);

      if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
        return res.status(400).json({
          status: "error",
          message: "El parámetro qty debe ser un entero entre 1 y 100",
        });
      }

      const payload = await seedService.generateSeed(qty);

      return res.status(201).json({
        status: "success",
        payload,
      });
    } catch (error) {
      console.error("Error al ejecutar el seed:", error.message);

      return res.status(500).json({
        status: "error",
        message: "No fue posible insertar los datos de prueba",
      });
    }
  }

  async getDataset(req, res) {
    return this.handleGeneration(req, res, (qty) =>
      mocksService.generateRelatedData(qty),
    );
  }
}

export default new MocksController();
