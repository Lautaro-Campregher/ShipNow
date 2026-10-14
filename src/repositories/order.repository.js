import Order from "../models/order.model.js";

class OrderRepository {
  async findAll(filter = {}) {
    return Order.find(filter);
  }

  async findById(id) {
    return Order.findById(id);
  }

  async create(orderData) {
    return Order.create(orderData);
  }

  async update(id, orderData) {
    return Order.findByIdAndUpdate(id, orderData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return Order.findByIdAndDelete(id);
  }

  async createMany(orders) {
    return Order.insertMany(orders);
  }

  async setDelivery(orderId, deliveryId) {
    return Order.findByIdAndUpdate(
      orderId,
      { delivery: deliveryId },
      { new: true, runValidators: true },
    );
  }
}

export default new OrderRepository();
