import User from '../models/user.model.js';

class UserRepository {
  async findAll() {
    return User.find({}, { password: 0 }).sort({ createdAt: -1 }).lean();
  }

  async findById(id) {
    return User.findById(id, { password: 0 }).lean();
  }

  async findByEmail(email) {
    return User.findOne({ email }).lean();
  }

  async create(userData) {
    const user = await User.create(userData);
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
  }

  async updateById(id, updatedUser) {
    return User.findByIdAndUpdate(id, updatedUser, {
      new: true,
      runValidators: true,
      projection: { password: 0 }
    }).lean();
  }

  async deleteById(id) {
    return User.findByIdAndDelete(id, { projection: { password: 0 } }).lean();
  }
}

export default new UserRepository();
