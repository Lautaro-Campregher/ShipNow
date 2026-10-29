import { Router } from "express";
import mocksController from "../controllers/mocks.controller.js";

const router = Router();

router.get("/users", mocksController.getUsers);
router.get("/drivers", mocksController.getDrivers);
router.get("/orders", mocksController.getOrders);
router.get("/deliveries", mocksController.getDeliveries);
router.get("/dataset", mocksController.getDataset);
router.post("/seed", mocksController.generateSeed);
router.get("/logger-test", mocksController.testLogger);

export default router;
