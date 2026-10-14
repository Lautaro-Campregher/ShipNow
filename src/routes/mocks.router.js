import { Router } from "express";
import mocksController from "../controllers/mocks.controller.js";

const router = Router();

router.get("/users", (req, res) => mocksController.getUsers(req, res));

router.get("/drivers", (req, res) => mocksController.getDrivers(req, res));

router.get("/orders", (req, res) => mocksController.getOrders(req, res));

router.get("/deliveries", (req, res) =>
  mocksController.getDeliveries(req, res),
);

router.get("/dataset", (req, res) => mocksController.getDataset(req, res));

router.post("/seed", (req, res) => mocksController.generateSeed(req, res));

export default router;
