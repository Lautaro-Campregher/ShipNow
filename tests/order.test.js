import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/user.model.js";
import Order from "../src/models/order.model.js";
import mocksService from "../src/services/mocks.service.js";

describe("Pruebas funcionales - Orders", function () {
  describe("POST /api/orders", function () {
    it("debe crear un pedido y calcular correctamente su total", async function () {
      // Creamos primero un cliente para asociarlo al pedido.
      const mockUser = mocksService.generateUser();

      const customer = await User.create({
        ...mockUser,
        password: "Password123!",
      });

      const newOrder = {
        customer: customer._id,
        items: [
          {
            name: "Producto A",
            quantity: 2,
            price: 100,
          },
          {
            name: "Producto B",
            quantity: 1,
            price: 50,
          },
        ],
        deliveryAddress: "Av. Testing 123",
        shippingCost: 30,
      };

      const response = await request(app).post("/api/orders").send(newOrder);

      expect(response.status).to.equal(201);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload).to.be.an("object");

      expect(response.body.payload.total).to.equal(280);
      expect(response.body.payload.status).to.equal("created");
      expect(response.body.payload.priority).to.equal("normal");
      expect(response.body.payload.customer.toString()).to.equal(
        customer._id.toString(),
      );
    });

    it("debe rechazar la creación de un pedido con un cliente inexistente", async function () {
      const response = await request(app)
        .post("/api/orders")
        .send({
          customer: "507f1f77bcf86cd799439011",
          items: [
            {
              name: "Producto A",
              quantity: 1,
              price: 100,
            },
          ],
          deliveryAddress: "Av. Testing 123",
        });

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("ORDER_CUSTOMER_NOT_FOUND");
    });

    it("debe rechazar la creación de un pedido sin productos", async function () {
      const customer = await User.create({
        firstName: "Cliente",
        lastName: "Testing",
        email: "cliente.sinproductos@shipnow.test",
        password: "Password123!",
      });

      const response = await request(app).post("/api/orders").send({
        customer: customer._id,
        items: [],
        deliveryAddress: "Av. Testing 123",
      });

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("ORDER_ITEMS_REQUIRED");
    });
  });
  describe("GET /api/orders", function () {
    it("debe devolver la lista de pedidos", async function () {
      const response = await request(app).get("/api/orders");

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload).to.be.an("array");
    });
  });
  describe("GET /api/orders/:id", function () {
    it("debe devolver un error 404 si el pedido no existe", async function () {
      const response = await request(app).get(
        "/api/orders/507f1f77bcf86cd799439011",
      );

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("ORDER_NOT_FOUND");
    });
    it("debe devolver un pedido cuando existe", async function () {
      const mockUser = mocksService.generateUser();

      const customer = await User.create({
        ...mockUser,
        password: "Password123!",
      });

      const order = await request(app)
        .post("/api/orders")
        .send({
          customer: customer._id,
          items: [
            {
              name: "Producto de prueba",
              quantity: 2,
              price: 100,
            },
          ],
          deliveryAddress: "Av. Testing 123",
        });

      const response = await request(app).get(
        `/api/orders/${order.body.payload._id}`,
      );

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload._id).to.equal(order.body.payload._id);
      expect(response.body.payload.total).to.equal(200);
    });
  });
  describe("PUT /api/orders/:id", function () {
    it("debe actualizar un pedido existente", async function () {
      const mockUser = mocksService.generateUser();

      const customer = await User.create({
        ...mockUser,
        password: "Password123!",
      });

      const order = await request(app)
        .post("/api/orders")
        .send({
          customer: customer._id,
          items: [
            {
              name: "Producto original",
              quantity: 1,
              price: 100,
            },
          ],
          deliveryAddress: "Av. Testing 123",
        });

      const response = await request(app)
        .put(`/api/orders/${order.body.payload._id}`)
        .send({
          deliveryAddress: "Av. Nueva 456",
        });

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload.deliveryAddress).to.equal("Av. Nueva 456");
      expect(response.body.payload.total).to.equal(100);
    });
    it("debe devolver un error 404 si el pedido no existe", async function () {
      const response = await request(app)
        .put("/api/orders/507f1f77bcf86cd799439011")
        .send({
          deliveryAddress: "Av. Nueva 456",
        });

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("ORDER_NOT_FOUND");
    });
    it("debe rechazar un estado inválido", async () => {
      const customer = await User.create({
        firstName: "Test",
        lastName: "Customer",
        email: "test.invalid.status@shipnow.test",
        password: "TestPassword123!",
        role: "customer",
      });

      const order = await Order.create({
        customer: customer._id,
        items: [
          {
            name: "Producto de prueba",
            quantity: 1,
            price: 5000,
          },
        ],
        deliveryAddress: "Dirección de prueba",
        total: 5000,
        status: "created",
      });

      const response = await request(app)
        .put(`/api/orders/${order._id}`)
        .send({ status: "invalid_status" });

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
    });
  });
  describe("DELETE /api/orders/:id", function () {
    it("debe eliminar un pedido existente", async function () {
      const mockUser = mocksService.generateUser();

      const customer = await User.create({
        ...mockUser,
        password: "Password123!",
      });

      const order = await request(app)
        .post("/api/orders")
        .send({
          customer: customer._id,
          items: [
            {
              name: "Producto de prueba",
              quantity: 1,
              price: 100,
            },
          ],
          deliveryAddress: "Av. Testing 123",
        });

      const orderId = order.body.payload._id;

      const response = await request(app).delete(`/api/orders/${orderId}`);

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");

      // Comprobamos que realmente se haya eliminado de MongoDB.
      const deletedOrder = await request(app).get(`/api/orders/${orderId}`);

      expect(deletedOrder.status).to.equal(404);
      expect(deletedOrder.body.code).to.equal("ORDER_NOT_FOUND");
    });
    it("debe devolver un error 404 si el pedido no existe", async function () {
      const response = await request(app).delete(
        "/api/orders/507f1f77bcf86cd799439011",
      );

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("ORDER_NOT_FOUND");
    });
  });
});
