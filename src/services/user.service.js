import { USER_ROLES, DOCUMENT_TYPES } from "../utils/constants.js";
import AppError from "../utils/errors.js";
import path from "path";

class UserService {
  constructor(repository) {
    this.repository = repository;
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id) {
    const user = await this.repository.findById(id);

    if (!user) {
      throw AppError.fromCode("USER_NOT_FOUND");
    }

    return user;
  }

  async create(userData) {
    if (userData.role === USER_ROLES.ADMIN) {
      throw AppError.fromCode("USER_ADMIN_CREATION_FORBIDDEN");
    }

    const existingUser = await this.repository.findByEmail(userData.email);

    if (existingUser) {
      throw AppError.fromCode("USER_EMAIL_ALREADY_EXISTS");
    }

    return this.repository.create({
      ...userData,
      role: USER_ROLES.CUSTOMER,
    });
  }

  async update(id, userData) {
    if (userData.role === USER_ROLES.ADMIN) {
      throw AppError.fromCode("USER_ADMIN_ROLE_ASSIGNMENT_FORBIDDEN");
    }

    const updatedUser = await this.repository.updateById(id, userData);

    if (!updatedUser) {
      throw AppError.fromCode("USER_NOT_FOUND");
    }

    return updatedUser;
  }

  async addDocument(userId, file, type) {
    const user = await this.findById(userId);

    const allowedTypes = Object.values(DOCUMENT_TYPES);

    if (!allowedTypes.includes(type)) {
      throw AppError.fromCode("INVALID_DOCUMENT_TYPE");
    }

    const documentMetadata = {
      originalName: file.originalname,
      fileName: file.filename,
      path: path.relative(process.cwd(), file.path).replace(/\\/g, "/"),
      mimeType: file.mimetype,
      size: file.size,
      type,
    };

    return this.repository.addDocument(userId, documentMetadata);
  }

  async addLicense(userId, file) {
    const user = await this.findById(userId);

    if (!userId) {
      throw AppError.fromCode("USER_NOT_FOUND");
    }

    if (user.role !== USER_ROLES.DRIVER) {
      throw AppError.fromCode("FORBIDDEN");
    }

    const licenseMetadata = {
      originalName: file.originalname,
      fileName: file.filename,
      path: path.relative(process.cwd(), file.path).replace(/\\/g, "/"),
      mimeType: file.mimetype,
      size: file.size,
      type: "driver_license",
    };

    return this.repository.addLicense(userId, licenseMetadata);
  }

  async delete(id) {
    const deletedUser = await this.repository.deleteById(id);

    if (!deletedUser) {
      throw AppError.fromCode("USER_NOT_FOUND");
    }

    return deletedUser;
  }
}

export default UserService;
