import UserService from "../services/user.service.js";
import userRepository from "../repositories/user.repository.js";
import AppError from "../utils/errors.js";
import { deleteUploadedFile } from "../utils/fileDelete.js";

const userService = new UserService(userRepository);

class UserController {
  async findAll(req, res, next) {
    try {
      const users = await userService.findAll();
      return res.status(200).json({ status: "success", payload: users });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const user = await userService.findById(req.params.id);
      return res.status(200).json({ status: "success", payload: user });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const user = await userService.create(req.body);
      return res.status(201).json({ status: "success", payload: user });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updatedUser = await userService.update(req.params.id, req.body);
      return res.status(200).json({ status: "success", payload: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  async addDocument(req, res, next) {
    try {
      if (!req.file) {
        throw AppError.fromCode("FILE_REQUIRED");
      }

      const { uid } = req.params;
      const { type } = req.body;

      const updatedUser = await userService.addDocument(uid, req.file, type);

      return res.status(201).json({
        status: "success",
        message: "Documento cargado correctamente",
        payload: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  async addLicense(req, res, next) {
    try {
      if (!req.file) {
        throw AppError.fromCode("FILE_REQUIRED");
      }

      const { uid } = req.params;

      const updatedUser = await userService.addLicense(uid, req.file);

      return res.status(201).json({
        status: "success",
        message: "Licencia de conducir cargada correctamente",
        payload: updatedUser,
      });
    } catch (error) {
      if (req.file?.path) {
        await deleteUploadedFile(req.file.path);
      }

      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await userService.delete(req.params.id);
      return res.status(200).json({
        status: "success",
        message: "Usuario eliminado",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
