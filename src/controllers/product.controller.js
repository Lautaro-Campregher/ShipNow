import productService from '../services/product.service.js';

class ProductController {
  async findAll(req, res) {
    try {
      const includeOutOfStock = req.query.all === 'true';
      const products = await productService.findAll(includeOutOfStock);
      return res.status(200).json(products);
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async findById(req, res) {
    try {
      const product = await productService.findById(req.params.id);
      return res.status(200).json(product);
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async getShippingCost(req, res) {
    try {
      const shipping = await productService.getShippingCost(req.params.id);
      return res.status(200).json(shipping);
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async create(req, res) {
    try {
      const product = await productService.create(req.body);
      return res.status(201).json(product);
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async update(req, res) {
    try {
      const product = await productService.update(req.params.id, req.body);
      return res.status(200).json(product);
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async delete(req, res) {
    try {
      const result = await productService.delete(req.params.id);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

export default new ProductController();
