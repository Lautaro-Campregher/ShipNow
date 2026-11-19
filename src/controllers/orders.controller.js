import ordersService from "../services/orders.service.js";
import AppError from "../utils/errors.js";
import { deleteUploadedFile } from "../utils/fileDelete.js";
import logger from "../utils/logger.js";

class OrdersController {
  async findAll(req, res, next) {
    try {
      const orders = await ordersService.findAll();
      res.json({ status: "success", payload: orders });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const order = await ordersService.findById(req.params.id);
      res.json({ status: "success", payload: order });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const order = await ordersService.create(req.body);
      res.status(201).json({ status: "success", payload: order });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const order = await ordersService.update(req.params.id, req.body);
      res.json({ status: "success", payload: order });
    } catch (error) {
      next(error);
    }
  }

  async addProof(req, res, next) {
    try {
      if (!req.file) {
        throw AppError.fromCode("FILE_REQUIRED");
      }

      const { id } = req.params;

      const updatedOrder = await ordersService.addProof(id, req.file);

      return res.status(201).json({
        status: "success",
        message: "Comprobante del pedido cargado correctamente",
        payload: updatedOrder,
      });
    } catch (error) {
      if (req.file?.path) {
        try {
          await deleteUploadedFile(req.file.path);
        } catch (cleanupError) {
          logger.error(
            `Error al eliminar archivo huérfano: ${cleanupError.message}`,
          );
        }
      }

      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await ordersService.delete(req.params.id);
      res.json({ status: "success", message: "Pedido eliminado" });
    } catch (error) {
      next(error);
    }
  }
}

export default new OrdersController();
