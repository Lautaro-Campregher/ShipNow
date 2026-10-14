import { faker } from "@faker-js/faker";
import {
  USER_ROLES,
  ORDER_STATUS,
  ORDER_PRIORITY,
  DELIVERY_STATUS,
  DELIVERY_PRIORITY,
} from "../utils/constants.js";

import userRepository from "../repositories/user.repository.js";
import orderRepository from "../repositories/order.repository.js";
import deliveryRepository from "../repositories/delivery.repository.js";

class SeedService {
  async generateSeed(qty = 10) {
    const driverQty = Math.max(1, Math.ceil(qty / 2));

    const usersToCreate = Array.from(
      { length: qty + driverQty },
      (_, index) => ({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: `mock.${faker.string.uuid()}@shipnow.test`,
        password: "MockPassword123!",
        role: index < qty ? USER_ROLES.CUSTOMER : USER_ROLES.DRIVER,
      }),
    );

    const insertedUsers = await userRepository.createMany(usersToCreate);

    const customers = insertedUsers.filter(
      (user) => user.role === USER_ROLES.CUSTOMER,
    );

    const drivers = insertedUsers.filter(
      (user) => user.role === USER_ROLES.DRIVER,
    );

    const ordersToCreate = customers.map((customer, index) => {
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
        customer: customer._id,
        items,
        deliveryAddress: faker.location.streetAddress(),
        total,
        shippingCost: 1000,
        declaredValue: total,
        status: index % 2 === 0 ? ORDER_STATUS.CREATED : ORDER_STATUS.ASSIGNED,
        priority: faker.helpers.enumValue(ORDER_PRIORITY),
      };
    });

    const insertedOrders = await orderRepository.createMany(ordersToCreate);

    const deliveriesToCreate = insertedOrders.map((order, index) => {
      const isAssigned = index % 2 === 0;

      return {
        order: order._id,
        driver: isAssigned ? drivers[index % drivers.length]._id : null,
        status: isAssigned ? DELIVERY_STATUS.ASSIGNED : DELIVERY_STATUS.PENDING,
        priority: faker.helpers.enumValue(DELIVERY_PRIORITY),
        assignedAt: isAssigned ? new Date() : null,
        deliveredAt: null,
      };
    });

    const insertedDeliveries =
      await deliveryRepository.createMany(deliveriesToCreate);

    await Promise.all(
      insertedDeliveries.map((delivery) =>
        orderRepository.setDelivery(delivery.order, delivery._id),
      ),
    );

    return {
      insertados: {
        usuarios: insertedUsers.length,
        clientes: customers.length,
        repartidores: drivers.length,
        pedidos: insertedOrders.length,
        entregas: insertedDeliveries.length,
      },
    };
  }
}

export default new SeedService();
