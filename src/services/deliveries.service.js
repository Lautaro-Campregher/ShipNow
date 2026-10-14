import deliveryRepository from "../repositories/delivery.repository.js";
import orderRepository from "../repositories/order.repository.js";
import userRepository from "../repositories/user.repository.js";
import AppError from "../utils/errors.js";
import {
  USER_ROLES,
  DELIVERY_STATUS,
  DELIVERY_PRIORITY,
} from "../utils/constants.js";

class DeliveriesService {
  async findAll() {
    return deliveryRepository.findAll();
  }

  async findById(id) {
    const delivery = await deliveryRepository.findById(id);

    if (!delivery) {
      throw new AppError("Entrega no encontrada", 404);
    }

    return delivery;
  }

  async create(deliveryData) {
    const order = await orderRepository.findById(deliveryData.order);

    if (!order) {
      throw new AppError("El pedido especificado no existe", 400);
    }

    if (deliveryData.driver) {
      const driver = await userRepository.findById(deliveryData.driver);

      if (!driver || driver.role !== USER_ROLES.DRIVER) {
        throw new AppError(
          "El repartidor especificado no existe o no tiene el rol correcto",
          400,
        );
      }
    }

    const newDelivery = await deliveryRepository.create({
      ...deliveryData,
      status: deliveryData.status ?? DELIVERY_STATUS.PENDING,
      priority: deliveryData.priority ?? DELIVERY_PRIORITY.NORMAL,
    });

    await orderRepository.setDelivery(order._id, newDelivery._id);

    return newDelivery;
  }

  async update(id, deliveryData) {
    if (deliveryData.order) {
      const order = await orderRepository.findById(deliveryData.order);

      if (!order) {
        throw new AppError("El pedido especificado no existe", 400);
      }
    }

    if (deliveryData.driver) {
      const driver = await userRepository.findById(deliveryData.driver);

      if (!driver || driver.role !== USER_ROLES.DRIVER) {
        throw new AppError(
          "El repartidor especificado no existe o no tiene el rol correcto",
          400,
        );
      }
    }

    const updatedDelivery = await deliveryRepository.update(id, deliveryData);

    if (!updatedDelivery) {
      throw new AppError("Entrega no encontrada", 404);
    }

    return updatedDelivery;
  }

  async delete(id) {
    const deletedDelivery = await deliveryRepository.delete(id);

    if (!deletedDelivery) {
      throw new AppError("Entrega no encontrada", 404);
    }

    return deletedDelivery;
  }
}

export default new DeliveriesService();
