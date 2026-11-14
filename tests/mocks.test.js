import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/user.model.js";
import Order from "../src/models/order.model.js";
import Delivery from "../src/models/delivery.model.js";

describe("Pruebas funcionales - Mocks", function () {
  describe("GET /api/mocks/users", function () {
    it("debe generar la cantidad solicitada de usuarios", async function () {
      const response = await request(app)
        .get("/api/mocks/users")
        .query({ qty: 3 });

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload).to.be.an("array").with.lengthOf(3);

      expect(response.body.payload[0]).to.have.property("firstName");
      expect(response.body.payload[0]).to.have.property("lastName");
      expect(response.body.payload[0]).to.have.property("email");
      expect(response.body.payload[0]).to.have.property("role");
    });
    it("debe rechazar una cantidad inválida de usuarios", async function () {
      const response = await request(app)
        .get("/api/mocks/users")
        .query({ qty: 0 });

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("INVALID_MOCK_QUANTITY");
    });
  });
  describe("GET /api/mocks/drivers", function () {
    it("debe generar la cantidad solicitada de repartidores", async function () {
      const response = await request(app)
        .get("/api/mocks/drivers")
        .query({ qty: 3 });

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload).to.be.an("array").with.lengthOf(3);

      expect(response.body.payload[0]).to.have.property("firstName");
      expect(response.body.payload[0]).to.have.property("lastName");
      expect(response.body.payload[0]).to.have.property("email");
      expect(response.body.payload[0].role).to.equal("driver");
    });
  });
  describe("GET /api/mocks/orders", function () {
    it("debe generar la cantidad solicitada de pedidos", async function () {
      const response = await request(app)
        .get("/api/mocks/orders")
        .query({ qty: 3 });

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload).to.be.an("array").with.lengthOf(3);

      expect(response.body.payload[0]).to.have.property("customer");
      expect(response.body.payload[0]).to.have.property("items");
      expect(response.body.payload[0]).to.have.property("total");
      expect(response.body.payload[0]).to.have.property("status");
    });
  });
  describe("GET /api/mocks/deliveries", function () {
    it("debe generar la cantidad solicitada de entregas", async function () {
      const response = await request(app)
        .get("/api/mocks/deliveries")
        .query({ qty: 3 });

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload).to.be.an("array").with.lengthOf(3);

      expect(response.body.payload[0]).to.have.property("order");
      expect(response.body.payload[0]).to.have.property("driver");
      expect(response.body.payload[0]).to.have.property("status");
      expect(response.body.payload[0]).to.have.property("priority");
    });
  });
  describe("GET /api/mocks/dataset - genera datos relacionados correctamente", async () => {
    const response = await request(app)
      .get("/api/mocks/dataset")
      .query({ qty: 4 });

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");

    const { users, drivers, orders, deliveries } = response.body.payload;

    expect(users).to.have.lengthOf(4);
    expect(drivers).to.have.lengthOf(2);
    expect(orders).to.have.lengthOf(4);
    expect(deliveries).to.have.lengthOf(4);

    orders.forEach((order) => {
      expect(users.some((user) => user.id === order.customer)).to.equal(true);
      expect(
        deliveries.some((delivery) => delivery.id === order.delivery),
      ).to.equal(true);
    });

    deliveries.forEach((delivery) => {
      expect(orders.some((order) => order.id === delivery.order)).to.equal(
        true,
      );

      if (delivery.driver !== null) {
        expect(
          drivers.some((driver) => driver.id === delivery.driver),
        ).to.equal(true);
      }
    });
  });

  describe("POST /api/mocks/seed", () => {
    it("debe generar y persistir correctamente usuarios, pedidos y entregas relacionadas", async () => {
      const response = await request(app)
        .post("/api/mocks/seed")
        .query({ qty: 4 });

      expect(response.status).to.equal(201);
      expect(response.body.status).to.equal("success");

      expect(response.body.payload.insertados).to.deep.equal({
        usuarios: 6,
        clientes: 4,
        repartidores: 2,
        pedidos: 4,
        entregas: 4,
      });

      const usersInDatabase = await User.find();
      const ordersInDatabase = await Order.find();
      const deliveriesInDatabase = await Delivery.find();

      expect(usersInDatabase).to.have.lengthOf(6);
      expect(ordersInDatabase).to.have.lengthOf(4);
      expect(deliveriesInDatabase).to.have.lengthOf(4);

      const customers = usersInDatabase.filter(
        (user) => user.role === "customer",
      );

      const drivers = usersInDatabase.filter((user) => user.role === "driver");

      expect(customers).to.have.lengthOf(4);
      expect(drivers).to.have.lengthOf(2);

      for (const order of ordersInDatabase) {
        const customerExists = await User.exists({
          _id: order.customer,
          role: "customer",
        });

        expect(customerExists).to.not.equal(null);
        expect(order.delivery).to.not.equal(null);

        const deliveryExists = await Delivery.exists({
          _id: order.delivery,
          order: order._id,
        });

        expect(deliveryExists).to.not.equal(null);
      }

      for (const delivery of deliveriesInDatabase) {
        const orderExists = await Order.exists({
          _id: delivery.order,
        });

        expect(orderExists).to.not.equal(null);

        if (delivery.driver !== null) {
          const driverExists = await User.exists({
            _id: delivery.driver,
            role: "driver",
          });

          expect(driverExists).to.not.equal(null);
        }
      }
    });

    it("debe rechazar una cantidad inválida", async () => {
      const response = await request(app)
        .post("/api/mocks/seed")
        .query({ qty: 0 });

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("INVALID_MOCK_QUANTITY");
    });
  });
});
