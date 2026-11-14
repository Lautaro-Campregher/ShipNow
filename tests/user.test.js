import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/user.model.js";

describe("Pruebas funcionales - Users", function () {
  describe("GET /api/users", function () {
    it("debe devolver una lista de usuarios sin exponer contraseñas", async function () {
      await User.create({
        firstName: "Usuario",
        lastName: "Testing",
        email: "usuario.testing@shipnow.test",
        password: "Password123!",
      });

      const response = await request(app).get("/api/users");

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload).to.be.an("array");
      expect(response.body.payload).to.have.lengthOf(1);
      expect(response.body.payload[0]).to.not.have.property("password");
      expect(response.body.payload[0].email).to.equal(
        "usuario.testing@shipnow.test",
      );
    });
  });

  describe("GET /api/users/:id", function () {
    it("debe rechazar la consulta de un usuario inexistente", async function () {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app).get(`/api/users/${fakeId}`);

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("USER_NOT_FOUND");
    });
  });

  describe("POST /api/users", function () {
    it("debe crear un usuario correctamente", async function () {
      const newUser = {
        firstName: "Lautaro",
        lastName: "Testing",
        email: "lautaro.testing@shipnow.test",
        password: "Password123!",
      };

      const response = await request(app).post("/api/users").send(newUser);

      expect(response.status).to.equal(201);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload).to.be.an("object");
      expect(response.body.payload.email).to.equal(newUser.email);
      expect(response.body.payload.role).to.equal("customer");
      expect(response.body.payload).to.not.have.property("password");
    });

    it("debe rechazar la creación de un usuario con datos incompletos", async function () {
      const response = await request(app).post("/api/users").send({
        firstName: "Usuario",
        email: "incompleto@shipnow.test",
      });

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body).to.have.property("message");
      expect(response.body).to.have.property("code");
    });

    it("debe rechazar la creación de un usuario con email duplicado", async function () {
      const newUser = {
        firstName: "Usuario",
        lastName: "Duplicado",
        email: "duplicado@shipnow.test",
        password: "Password123!",
      };

      // Primer registro: debe crearse correctamente.
      const firstResponse = await request(app).post("/api/users").send(newUser);

      expect(firstResponse.status).to.equal(201);

      // Segundo registro con el mismo email: debe rechazarse.
      const secondResponse = await request(app)
        .post("/api/users")
        .send(newUser);

      expect(secondResponse.status).to.equal(409);
      expect(secondResponse.body.status).to.equal("error");
      expect(secondResponse.body.code).to.equal("USER_EMAIL_ALREADY_EXISTS");
    });
  });

  describe("PUT /api/users/:id", function () {
    it("debe rechazar la actualización de un usuario inexistente", async function () {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .put(`/api/users/${fakeId}`)
        .send({ firstName: "Nuevo nombre" });

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("USER_NOT_FOUND");
    });

    it("debe impedir asignar el rol admin a un usuario", async function () {
      const user = await User.create({
        firstName: "Usuario",
        lastName: "Testing",
        email: "rol.testing@shipnow.test",
        password: "Password123!",
      });

      const response = await request(app)
        .put(`/api/users/${user._id}`)
        .send({ role: "admin" });

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal(
        "USER_ADMIN_ROLE_ASSIGNMENT_FORBIDDEN",
      );
    });
  });

  describe("DELETE /api/users/:id", function () {
    it("debe rechazar la eliminación de un usuario inexistente", async function () {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app).delete(`/api/users/${fakeId}`);

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("USER_NOT_FOUND");
    });

    it("debe eliminar un usuario existente correctamente", async function () {
      const user = await User.create({
        firstName: "Usuario",
        lastName: "Para eliminar",
        email: "eliminar@shipnow.test",
        password: "Password123!",
      });

      const response = await request(app).delete(`/api/users/${user._id}`);

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.message).to.equal("Usuario eliminado");

      const deletedUser = await User.findById(user._id);
      expect(deletedUser).to.equal(null);
    });
  });
});
