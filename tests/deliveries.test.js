import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/user.model.js";
import mocksService from "../src/services/mocks.service.js";
import { USER_ROLES } from "../src/utils/constants.js";
import fs from "fs";
import path from "path";
import Delivery from "../src/models/delivery.model.js";

describe("Pruebas funcionales - Deliveries", function () {
  describe("POST /api/deliveries", function () {
    it("debe crear una entrega correctamente", async function () {
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

      const response = await request(app).post("/api/deliveries").send({
        order: order.body.payload._id,
      });

      expect(response.status).to.equal(201);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload.order.toString()).to.equal(
        order.body.payload._id,
      );
      expect(response.body.payload.status).to.equal("pending");
      expect(response.body.payload.priority).to.equal("normal");
      expect(response.body.payload.driver).to.equal(null);
    });
    it("debe rechazar la creación de una entrega con un pedido inexistente", async function () {
      const response = await request(app).post("/api/deliveries").send({
        order: "507f1f77bcf86cd799439011",
      });

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("ORDER_NOT_FOUND");
    });
    it("debe rechazar la creación de una entrega con un repartidor inválido", async function () {
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

      const response = await request(app).post("/api/deliveries").send({
        order: order.body.payload._id,
        driver: "507f1f77bcf86cd799439011",
      });

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("DELIVERY_DRIVER_INVALID");
    });
    it("debe rechazar la creación de una entrega si el usuario no tiene rol de repartidor", async function () {
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

      const response = await request(app).post("/api/deliveries").send({
        order: order.body.payload._id,
        driver: customer._id,
      });

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("DELIVERY_DRIVER_INVALID");
    });
    it("debe crear una entrega asignando un repartidor válido", async function () {
      const mockCustomer = mocksService.generateUser();

      const customer = await User.create({
        ...mockCustomer,
        password: "Password123!",
      });

      const mockDriver = mocksService.generateUser(USER_ROLES.DRIVER);

      const driver = await User.create({
        ...mockDriver,
        password: "Password123!",
      });

      const order = await request(app)
        .post("/api/orders")
        .send({
          customer: customer._id,
          items: [{ name: "Producto de prueba", quantity: 1, price: 100 }],
          deliveryAddress: "Av. Testing 123",
        });

      const response = await request(app).post("/api/deliveries").send({
        order: order.body.payload._id,
        driver: driver._id,
      });

      expect(response.status).to.equal(201);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload.order).to.equal(order.body.payload._id);
      expect(response.body.payload.driver).to.equal(driver._id.toString());
    });
  });

  describe("POST /api/deliveries/:id/proofs", function () {
    it("debe cargar un comprobante correctamente", async function () {
      const mockUser = mocksService.generateUser();

      const customer = await User.create({
        ...mockUser,
        password: "Password123!",
      });

      const order = await request(app)
        .post("/api/orders")
        .send({
          customer: customer._id,
          items: [{ name: "Producto de prueba", quantity: 1, price: 100 }],
          deliveryAddress: "Av. Testing 123",
        });

      const delivery = await request(app).post("/api/deliveries").send({
        order: order.body.payload._id,
      });

      const deliveryId = delivery.body.payload._id;

      const filePath = path.resolve("tests/fixtures/test-image.png");

      const response = await request(app)
        .post(`/api/deliveries/${deliveryId}/proofs`)
        .attach("file", filePath);

      expect(response.status).to.equal(201);
      expect(response.body.status).to.equal("success");

      const updatedDelivery = await Delivery.findById(deliveryId);

      expect(updatedDelivery.proofs).to.have.lengthOf(1);
      expect(updatedDelivery.proofs[0].originalName).to.equal("test-image.png");
      expect(updatedDelivery.proofs[0].type).to.equal("delivery_proof");
      expect(updatedDelivery.proofs[0].mimeType).to.equal("image/png");
      expect(updatedDelivery.proofs[0].size).to.be.greaterThan(0);

      expect(
        fs.existsSync(path.resolve(updatedDelivery.proofs[0].path)),
      ).to.equal(true);
    });

    it("debe rechazar la carga si no se adjunta un archivo", async function () {
      const mockUser = mocksService.generateUser();

      const customer = await User.create({
        ...mockUser,
        password: "Password123!",
      });

      const order = await request(app)
        .post("/api/orders")
        .send({
          customer: customer._id,
          items: [{ name: "Producto de prueba", quantity: 1, price: 100 }],
          deliveryAddress: "Av. Testing 123",
        });

      const delivery = await request(app).post("/api/deliveries").send({
        order: order.body.payload._id,
      });

      const deliveryId = delivery.body.payload._id;

      const response = await request(app).post(
        `/api/deliveries/${deliveryId}/proofs`,
      );

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("FILE_REQUIRED");

      const updatedDelivery = await Delivery.findById(deliveryId);

      expect(updatedDelivery.proofs).to.have.lengthOf(0);
    });

    it("debe rechazar la carga si la entrega no existe y eliminar el archivo", async function () {
      const filesBefore = fs.readdirSync("uploads/proof/deliveries");

      const response = await request(app)
        .post("/api/deliveries/507f1f77bcf86cd799439011/proofs")
        .attach("file", path.resolve("tests/fixtures/test-image.png"));

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("DELIVERY_NOT_FOUND");

      const filesAfter = fs.readdirSync("uploads/proof/deliveries");

      const newFiles = filesAfter.filter((file) => !filesBefore.includes(file));

      expect(newFiles).to.have.lengthOf(0);
    });

    it("debe rechazar un archivo con formato no permitido", async function () {
      const mockUser = mocksService.generateUser();

      const customer = await User.create({
        ...mockUser,
        password: "Password123!",
      });

      const order = await request(app)
        .post("/api/orders")
        .send({
          customer: customer._id,
          items: [{ name: "Producto de prueba", quantity: 1, price: 100 }],
          deliveryAddress: "Av. Testing 123",
        });

      const delivery = await request(app).post("/api/deliveries").send({
        order: order.body.payload._id,
      });

      const deliveryId = delivery.body.payload._id;

      const response = await request(app)
        .post(`/api/deliveries/${deliveryId}/proofs`)
        .attach("file", path.resolve("tests/fixtures/test-invalid.txt"));

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("INVALID_FILE_TYPE");

      const updatedDelivery = await Delivery.findById(deliveryId);

      expect(updatedDelivery.proofs).to.have.lengthOf(0);
    });

    it("debe rechazar un archivo que supere los 5 MB", async function () {
      const mockUser = mocksService.generateUser();

      const customer = await User.create({
        ...mockUser,
        password: "Password123!",
      });

      const order = await request(app)
        .post("/api/orders")
        .send({
          customer: customer._id,
          items: [{ name: "Producto de prueba", quantity: 1, price: 100 }],
          deliveryAddress: "Av. Testing 123",
        });

      const delivery = await request(app).post("/api/deliveries").send({
        order: order.body.payload._id,
      });

      const deliveryId = delivery.body.payload._id;

      const filesBefore = fs.readdirSync("uploads/proof/deliveries");

      const response = await request(app)
        .post(`/api/deliveries/${deliveryId}/proofs`)
        .attach("file", path.resolve("tests/fixtures/test-large.pdf"));

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("FILE_TOO_LARGE");

      const updatedDelivery = await Delivery.findById(deliveryId);

      expect(updatedDelivery.proofs).to.have.lengthOf(0);

      const filesAfter = fs.readdirSync("uploads/proof/deliveries");

      const newFiles = filesAfter.filter((file) => !filesBefore.includes(file));

      expect(newFiles).to.have.lengthOf(0);
    });
  });

  describe("GET /api/deliveries", function () {
    it("debe devolver la lista de entregas", async function () {
      const response = await request(app).get("/api/deliveries");

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload).to.be.an("array");
    });
    it("debe devolver las entregas existentes", async function () {
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

      await request(app).post("/api/deliveries").send({
        order: order.body.payload._id,
      });

      const response = await request(app).get("/api/deliveries");

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload).to.be.an("array").with.lengthOf(1);
      expect(response.body.payload[0].order.toString()).to.equal(
        order.body.payload._id,
      );
    });
  });
  describe("GET /api/deliveries/:id", function () {
    it("debe devolver 404 si la entrega no existe", async function () {
      const response = await request(app).get(
        "/api/deliveries/507f1f77bcf86cd799439011",
      );

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("DELIVERY_NOT_FOUND");
    });
    it("debe devolver una entrega existente", async function () {
      const mockUser = mocksService.generateUser();
      const customer = await User.create({
        ...mockUser,
        password: "Password123!",
      });

      const order = await request(app)
        .post("/api/orders")
        .send({
          customer: customer._id,
          items: [{ name: "Producto de prueba", quantity: 1, price: 100 }],
          deliveryAddress: "Av. Testing 123",
        });

      const delivery = await request(app).post("/api/deliveries").send({
        order: order.body.payload._id,
      });

      const response = await request(app).get(
        `/api/deliveries/${delivery.body.payload._id}`,
      );

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload._id).to.equal(delivery.body.payload._id);
      expect(response.body.payload.order).to.equal(order.body.payload._id);
    });
  });
  describe("PUT /api/deliveries/:id", function () {
    it("debe actualizar una entrega existente", async function () {
      const mockUser = mocksService.generateUser();

      const customer = await User.create({
        ...mockUser,
        password: "Password123!",
      });

      const order = await request(app)
        .post("/api/orders")
        .send({
          customer: customer._id,
          items: [{ name: "Producto de prueba", quantity: 1, price: 100 }],
          deliveryAddress: "Av. Testing 123",
        });

      const delivery = await request(app).post("/api/deliveries").send({
        order: order.body.payload._id,
      });

      const response = await request(app)
        .put(`/api/deliveries/${delivery.body.payload._id}`)
        .send({
          status: "in_transit",
        });

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload.status).to.equal("in_transit");
    });
    it("debe devolver 404 si la entrega no existe", async function () {
      const response = await request(app)
        .put("/api/deliveries/507f1f77bcf86cd799439011")
        .send({
          status: "in_transit",
        });

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("DELIVERY_NOT_FOUND");
    });
    it("debe rechazar la actualización si el pedido no existe", async function () {
      const mockUser = mocksService.generateUser();

      const customer = await User.create({
        ...mockUser,
        password: "Password123!",
      });

      const order = await request(app)
        .post("/api/orders")
        .send({
          customer: customer._id,
          items: [{ name: "Producto de prueba", quantity: 1, price: 100 }],
          deliveryAddress: "Av. Testing 123",
        });

      const delivery = await request(app).post("/api/deliveries").send({
        order: order.body.payload._id,
      });

      const response = await request(app)
        .put(`/api/deliveries/${delivery.body.payload._id}`)
        .send({
          order: "507f1f77bcf86cd799439011",
        });

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("DELIVERY_ORDER_NOT_FOUND");
    });
    it("debe rechazar la actualización si el repartidor no es válido", async function () {
      const mockUser = mocksService.generateUser();

      const customer = await User.create({
        ...mockUser,
        password: "Password123!",
      });

      const order = await request(app)
        .post("/api/orders")
        .send({
          customer: customer._id,
          items: [{ name: "Producto de prueba", quantity: 1, price: 100 }],
          deliveryAddress: "Av. Testing 123",
        });

      const delivery = await request(app).post("/api/deliveries").send({
        order: order.body.payload._id,
      });

      const response = await request(app)
        .put(`/api/deliveries/${delivery.body.payload._id}`)
        .send({
          driver: "507f1f77bcf86cd799439011",
        });

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("DELIVERY_DRIVER_INVALID");
    });
  });
  describe("DELETE /api/deliveries/:id", function () {
    it("debe eliminar una entrega existente", async function () {
      const mockUser = mocksService.generateUser();

      const customer = await User.create({
        ...mockUser,
        password: "Password123!",
      });

      const order = await request(app)
        .post("/api/orders")
        .send({
          customer: customer._id,
          items: [{ name: "Producto de prueba", quantity: 1, price: 100 }],
          deliveryAddress: "Av. Testing 123",
        });

      const delivery = await request(app).post("/api/deliveries").send({
        order: order.body.payload._id,
      });

      const response = await request(app).delete(
        `/api/deliveries/${delivery.body.payload._id}`,
      );

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.message).to.equal("Entrega eliminada");

      const searchResponse = await request(app).get(
        `/api/deliveries/${delivery.body.payload._id}`,
      );

      expect(searchResponse.status).to.equal(404);
      expect(searchResponse.body.code).to.equal("DELIVERY_NOT_FOUND");
    });
    it("debe devolver 404 si la entrega no existe", async function () {
      const response = await request(app).delete(
        "/api/deliveries/507f1f77bcf86cd799439011",
      );

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("DELIVERY_NOT_FOUND");
    });
  });
});
