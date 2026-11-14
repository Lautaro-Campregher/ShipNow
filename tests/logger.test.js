import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";

describe("Pruebas funcionales - Logger", () => {
  describe("GET /api/logger/test", () => {
    it("debe ejecutar los logs de prueba y responder correctamente", async () => {
      const response = await request(app).get("/api/logger/test");

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.message).to.equal(
        "Se generaron logs de prueba en todos los niveles",
      );
    });
  });
});
