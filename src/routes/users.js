import { Router } from "express";
import userController from "../controllers/user.controller.js";
import {
  uploadDocuments,
  uploadDriverLicenses,
} from "../middlewares/uploads.middlewares.js";

const router = Router();

router.get("/", userController.findAll);
router.get("/:id", userController.findById);
router.post("/", userController.create);
router.post(
  "/:uid/documents",
  uploadDocuments.single("file"),
  userController.addDocument,
);
router.post(
  "/:uid/licenses",
  uploadDriverLicenses.single("file"),
  userController.addLicense,
);
router.put("/:id", userController.update);
router.delete("/:id", userController.delete);

export default router;
