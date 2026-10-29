import orderRepository from "../repositories/order.repository.js";
import userRepository from "../repositories/user.repository.js";
import AppError from "../utils/errors.js";
import { ORDER_STATUS, ORDER_PRIORITY } from "../utils/constants.js";
import logger from "../utils/logger.js";

class OrdersService {
  async findAll(filter = {}) {
    return orderRepository.findAll(filter);
  }

  async findById(id) {
    const order = await orderRepository.findById(id);

    if (!order) {
      logger.warning(`Pedido no encontrado. ID: ${id}`);
      throw AppError.fromCode("ORDER_NOT_FOUND");
    }

    return order;
  }

  async create(orderData) {
    const customer = await userRepository.findById(orderData.customer);

    if (!customer) {
      throw AppError.fromCode("ORDER_CUSTOMER_NOT_FOUND");
    }

    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw AppError.fromCode("ORDER_ITEMS_REQUIRED");
    }

    const itemsTotal = orderData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const shippingCost = orderData.shippingCost ?? 0;
    const declaredValue = orderData.declaredValue ?? itemsTotal;

    const order = await orderRepository.create({
      ...orderData,
      declaredValue,
      shippingCost,
      total: itemsTotal + shippingCost,
      status: ORDER_STATUS.CREATED,
      priority: orderData.priority ?? ORDER_PRIORITY.NORMAL,
    });

    logger.info(`Pedido creado correctamente. ID: ${order._id}`);

    return order;
  }

  async update(id, orderData) {
    const updatedOrder = await orderRepository.update(id, orderData);

    if (!updatedOrder) {
      throw AppError.fromCode("ORDER_NOT_FOUND");
    }

    return updatedOrder;
  }

  async delete(id) {
    const deletedOrder = await orderRepository.delete(id);

    if (!deletedOrder) {
      throw AppError.fromCode("ORDER_NOT_FOUND");
    }

    return deletedOrder;
  }
}

export default new OrdersService();
