import { USER_ROLES } from "../utils/constants.js";
import AppError from "../utils/errors.js";

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
      role: USER_ROLES.USER,
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

  async delete(id) {
    const deletedUser = await this.repository.deleteById(id);

    if (!deletedUser) {
      throw AppError.fromCode("USER_NOT_FOUND");
    }

    return deletedUser;
  }
}

export default UserService;
