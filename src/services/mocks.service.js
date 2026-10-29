import { faker } from "@faker-js/faker";
import {
  USER_ROLES,
  ORDER_STATUS,
  ORDER_PRIORITY,
  DELIVERY_STATUS,
  DELIVERY_PRIORITY,
} from "../utils/constants.js";
import AppError from "../utils/errors.js";
import logger from "../utils/logger.js";

class MocksService {
  validateQuantity(qty) {
    if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
      logger.warning(`Cantidad de mocks inválida recibida: ${qty}`);
      throw AppError.fromCode("INVALID_MOCK_QUANTITY");
    }
  }
  generateUser(role = USER_ROLES.CUSTOMER) {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email().toLowerCase(),
      role,
    };
  }

  async generateUsers(qty = 2) {
    this.validateQuantity(qty);
    return Array.from({ length: qty }, () => this.generateUser());
  }

  async generateDrivers(qty = 2) {
    this.validateQuantity(qty);
    return Array.from({ length: qty }, () =>
      this.generateUser(USER_ROLES.DRIVER),
    );
  }

  async generateRelatedData(qty = 2) {
    this.validateQuantity(qty);
    const users = Array.from({ length: qty }, () => ({
      id: faker.string.uuid(),
      ...this.generateUser(USER_ROLES.CUSTOMER),
    }));

    const drivers = Array.from(
      { length: Math.max(1, Math.ceil(qty / 2)) },
      () => ({
        id: faker.string.uuid(),
        ...this.generateUser(USER_ROLES.DRIVER),
      }),
    );

    const orders = users.map((user, index) => {
      const items = Array.from(
        { length: faker.number.int({ min: 1, max: 3 }) },
        () => ({
          name: faker.commerce.productName(),
          quantity: faker.number.int({ min: 1, max: 4 }),
          price: Number(faker.commerce.price({ min: 1000, max: 50000 })),
        }),
      );

      const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      return {
        id: faker.string.uuid(),
        customer: user.id,
        items,
        deliveryAddress: faker.location.streetAddress(),
        total,
        shippingCost: 1000,
        declaredValue: total,
        status: index % 2 === 0 ? ORDER_STATUS.CREATED : ORDER_STATUS.ASSIGNED,
        priority: faker.helpers.enumValue(ORDER_PRIORITY),
        delivery: null,
      };
    });

    const deliveries = orders.map((order, index) => {
      const isAssigned = index % 2 === 0;
      const deliveryId = faker.string.uuid();

      const delivery = {
        id: deliveryId,
        order: order.id,
        driver: isAssigned ? drivers[index % drivers.length].id : null,
        status: isAssigned ? DELIVERY_STATUS.ASSIGNED : DELIVERY_STATUS.PENDING,
        priority: faker.helpers.enumValue(DELIVERY_PRIORITY),
        assignedAt: isAssigned ? new Date().toISOString() : null,
        deliveredAt: null,
      };

      order.delivery = deliveryId;

      return delivery;
    });

    return { users, drivers, orders, deliveries };
  }

  async generateOrders(qty = 2) {
    this.validateQuantity(qty);
    const data = await this.generateRelatedData(qty);
    return data.orders;
  }

  async generateDeliveries(qty = 2) {
    this.validateQuantity(qty);
    const data = await this.generateRelatedData(qty);
    return data.deliveries;
  }
}

export default new MocksService();
