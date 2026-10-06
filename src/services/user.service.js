import { USER_ROLES } from "../utils/constants.js";
import userRepository from "../repositories/user.repository.js";
import AppError from "../utils/errors.js";

class UserService {
  async findAll() {
    return userRepository.findAll();
  }

  async findById(id) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new AppError("Usuario no encontrado", 404);
    }

    return user;
  }

  async create(userData) {
    if (userData.role === USER_ROLES.ADMIN) {
      throw new AppError("No es posible crear admins desde este endpoint", 400);
    }

    const existingUser = await userRepository.findByEmail(userData.email);

    if (existingUser) {
      throw new AppError("Este email ya se encuentra registrado", 409);
    }

    return userRepository.create({
      ...userData,
      role: USER_ROLES.USER,
    });
  }

  async update(id, userData) {
    if (userData.role === USER_ROLES.ADMIN) {
      throw new AppError(
        "No es posible asignar el rol admin desde este endpoint",
        400,
      );
    }

    const updatedUser = await userRepository.updateById(id, userData);

    if (!updatedUser) {
      throw new AppError("Usuario no encontrado", 404);
    }

    return updatedUser;
  }

  async delete(id) {
    const deletedUser = await userRepository.deleteById(id);

    if (!deletedUser) {
      throw new AppError("Usuario no encontrado", 404);
    }

    return deletedUser;
  }
}

export default new UserService();
