import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";

describe("Pruebas funcionales - Rutas inexistentes", () => {
  describe("GET /api/ruta-inexistente", () => {
    it("debe responder con error 404", async () => {
      const response = await request(app).get("/api/ruta-inexistente");

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal("error");
    });
  });
});
