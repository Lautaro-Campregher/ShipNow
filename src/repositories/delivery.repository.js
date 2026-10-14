import Delivery from "../models/delivery.model.js";

class DeliveryRepository {
  async findAll(filter = {}) {
    return Delivery.find(filter);
  }

  async findById(id) {
    return Delivery.findById(id);
  }

  async create(deliveryData) {
    return Delivery.create(deliveryData);
  }

  async update(id, deliveryData) {
    return Delivery.findByIdAndUpdate(id, deliveryData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return Delivery.findByIdAndDelete(id);
  }

  async createMany(deliveries) {
    return Delivery.insertMany(deliveries);
  }
}

export default new DeliveryRepository();
