import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/user.model.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

const uploadsPath = path.resolve("uploads/documents");

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

  describe("POST /api/users/:id/documents", function () {
    it("debe cargar un documento correctamente y guardar sus metadatos", async function () {
      const user = await User.create({
        firstName: "Usuario",
        lastName: "Documentos",
        email: "documentos@shipnow.test",
        password: "Password123!",
      });

      const filePath = path.resolve("tests/fixtures/test-image.png");

      const response = await request(app)
        .post(`/api/users/${user._id}/documents`)
        .field("type", "identity")
        .attach("file", filePath);

      expect(response.status).to.equal(201);
      expect(response.body.status).to.equal("success");

      const updatedUser = await User.findById(user._id);

      expect(updatedUser.documents).to.have.lengthOf(1);
      expect(updatedUser.documents[0].originalName).to.equal("test-image.png");
      expect(updatedUser.documents[0].type).to.equal("identity");
      expect(updatedUser.documents[0].mimeType).to.equal("image/png");
      expect(updatedUser.documents[0].size).to.be.greaterThan(0);
      expect(
        fs.existsSync(path.resolve(updatedUser.documents[0].path)),
      ).to.equal(true);
    });

    it("debe rechazar la carga si no se envía un archivo", async function () {
      const user = await User.create({
        firstName: "Usuario",
        lastName: "Documentos",
        email: "sin.archivo@shipnow.test",
        password: "Password123!",
      });

      const response = await request(app)
        .post(`/api/users/${user._id}/documents`)
        .field("type", "identity");

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("FILE_REQUIRED");

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.documents).to.have.lengthOf(0);
    });

    it("debe rechazar un tipo de documento inválido", async function () {
      const user = await User.create({
        firstName: "Usuario",
        lastName: "Documentos",
        email: "tipo.invalido@shipnow.test",
        password: "Password123!",
      });

      const filePath = path.resolve("tests/fixtures/test-image.png");

      const response = await request(app)
        .post(`/api/users/${user._id}/documents`)
        .field("type", "tipo_invalido")
        .attach("file", filePath);

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("INVALID_DOCUMENT_TYPE");

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.documents).to.have.lengthOf(0);
    });

    it("debe rechazar la carga si el usuario no existe", async function () {
      const filePath = path.resolve("tests/fixtures/test-image.png");

      const response = await request(app)
        .post("/api/users/507f1f77bcf86cd799439011/documents")
        .field("type", "identity")
        .attach("file", filePath);

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("USER_NOT_FOUND");
    });

    it("debe rechazar archivos con un MIME type no permitido", async function () {
      const user = await User.create({
        firstName: "Usuario",
        lastName: "ArchivoInvalido",
        email: "archivo.invalido@shipnow.test",
        password: "Password123!",
      });

      const filePath = path.resolve("tests/fixtures/test-invalid.txt");

      const response = await request(app)
        .post(`/api/users/${user._id}/documents`)
        .field("type", "identity")
        .attach("file", filePath);

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("INVALID_FILE_TYPE");

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.documents).to.have.lengthOf(0);
    });

    it("debe rechazar archivos que superen el límite de 5 MB", async function () {
      const user = await User.create({
        firstName: "Usuario",
        lastName: "ArchivoGrande",
        email: "archivo.grande@shipnow.test",
        password: "Password123!",
      });

      const largeFilePath = path.resolve("tests/fixtures/test-large.pdf");

      const response = await request(app)
        .post(`/api/users/${user._id}/documents`)
        .field("type", "identity")
        .attach("file", largeFilePath);

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("FILE_TOO_LARGE");

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.documents).to.have.lengthOf(0);
    });
  });

  describe("POST /api/users/:uid/licenses", function () {
    it("debe cargar una licencia correctamente para un driver", async function () {
      const user = await User.create({
        firstName: "Conductor",
        lastName: "Licencia",
        email: "licencia.driver@shipnow.test",
        password: "Password123!",
        role: "driver",
      });

      const filePath = path.resolve("tests/fixtures/test-image.png");

      const response = await request(app)
        .post(`/api/users/${user._id}/licenses`)
        .attach("file", filePath);

      expect(response.status).to.equal(201);
      expect(response.body.status).to.equal("success");

      const updatedUser = await User.findById(user._id);

      expect(updatedUser.licenses).to.have.lengthOf(1);

      expect(updatedUser.licenses[0].originalName).to.equal("test-image.png");
      expect(updatedUser.licenses[0].type).to.equal("driver_license");
      expect(updatedUser.licenses[0].mimeType).to.equal("image/png");
      expect(updatedUser.licenses[0].size).to.be.greaterThan(0);

      expect(
        fs.existsSync(path.resolve(updatedUser.licenses[0].path)),
      ).to.equal(true);
    });

    it("debe impedir que un customer cargue una licencia", async function () {
      const user = await User.create({
        firstName: "Cliente",
        lastName: "Licencia",
        email: "customer.license@shipnow.test",
        password: "Password123!",
        role: "customer",
      });

      const filePath = path.resolve("tests/fixtures/test-image.png");

      const response = await request(app)
        .post(`/api/users/${user._id}/licenses`)
        .attach("file", filePath);

      expect(response.status).to.equal(403);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("FORBIDDEN");

      const updatedUser = await User.findById(user._id);

      expect(updatedUser.licenses).to.have.lengthOf(0);
    });

    it("debe rechazar la carga si no se envía un archivo", async function () {
      const user = await User.create({
        firstName: "Conductor",
        lastName: "SinLicencia",
        email: "driver.nofile@shipnow.test",
        password: "Password123!",
        role: "driver",
      });

      const response = await request(app).post(
        `/api/users/${user._id}/licenses`,
      );

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("FILE_REQUIRED");

      const updatedUser = await User.findById(user._id);

      expect(updatedUser.licenses).to.have.lengthOf(0);
    });

    it("debe rechazar la carga si el usuario no existe", async function () {
      const fakeUserId = new mongoose.Types.ObjectId();

      const filePath = path.resolve("tests/fixtures/test-image.png");

      const filesBefore = fs.readdirSync("uploads/driver-licenses");

      const response = await request(app)
        .post(`/api/users/${fakeUserId}/licenses`)
        .attach("file", filePath);

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("USER_NOT_FOUND");

      const filesAfter = fs.readdirSync("uploads/driver-licenses");

      const newFiles = filesAfter.filter((file) => !filesBefore.includes(file));

      expect(newFiles).to.have.lengthOf(0);
    });

    it("debe rechazar archivos con MIME no permitido", async function () {
      const user = await User.create({
        firstName: "Conductor",
        lastName: "ArchivoInvalido",
        email: "driver.invalidfile@shipnow.test",
        password: "Password123!",
        role: "driver",
      });

      const filePath = path.resolve("tests/fixtures/test-invalid.txt");

      const response = await request(app)
        .post(`/api/users/${user._id}/licenses`)
        .attach("file", filePath);

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("INVALID_FILE_TYPE");

      const updatedUser = await User.findById(user._id);

      expect(updatedUser.licenses).to.have.lengthOf(0);
    });

    it("debe rechazar archivos que superen los 5 MB", async function () {
      const user = await User.create({
        firstName: "Conductor",
        lastName: "ArchivoGrande",
        email: "driver.largefile@shipnow.test",
        password: "Password123!",
        role: "driver",
      });

      const filePath = path.resolve("tests/fixtures/test-large.pdf");

      const response = await request(app)
        .post(`/api/users/${user._id}/licenses`)
        .attach("file", filePath);

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal("FILE_TOO_LARGE");

      const updatedUser = await User.findById(user._id);

      expect(updatedUser.licenses).to.have.lengthOf(0);
    });
  });
});
