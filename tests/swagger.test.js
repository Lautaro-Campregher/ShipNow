import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";

describe("Pruebas funcionales - Swagger", () => {
  describe("GET /api/docs", () => {
    it("debe mostrar la documentación Swagger", async () => {
      const response = await request(app).get("/api/docs/");

      expect(response.status).to.equal(200);
      expect(response.text).to.include("Swagger UI");
      expect(response.text).to.include("swagger-ui");
    });
  });
});
