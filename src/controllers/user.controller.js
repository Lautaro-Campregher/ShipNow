import userService from '../services/user.service.js';

class UserController {
  async findAll(req, res) {
    try {
      const users = await userService.findAll();
      return res.status(200).json({ status: 'success', payload: users });
    } catch (error) {
      return res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
    }
  }

  async findById(req, res) {
    try {
      const user = await userService.findById(req.params.id);
      return res.status(200).json({ status: 'success', payload: user });
    } catch (error) {
      return res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
    }
  }

  async create(req, res) {
    try {
      const user = await userService.create(req.body);
      return res.status(201).json({ status: 'success', payload: user });
    } catch (error) {
      return res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updatedUser = await userService.update(req.params.id, req.body);
      return res.status(200).json({ status: 'success', payload: updatedUser });
    } catch (error) {
      return res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deletedUser = await userService.delete(req.params.id);
      return res.status(200).json({ status: 'success', payload: deletedUser });
    } catch (error) {
      return res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
    }
  }
}

export default new UserController();
