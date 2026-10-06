import Product from "../models/product.model.js";
import { PRODUCT_STATUS } from "../utils/constants.js";

class ProductRepository {
  async findAll({ includeOutOfStock = false } = {}) {
    const filter = includeOutOfStock
      ? {}
      : { stock: { $gt: 0 }, status: PRODUCT_STATUS.AVAILABLE };

    return Product.find(filter).sort({ createdAt: -1 }).lean();
  }

  async findById(id) {
    return Product.findById(id).lean();
  }

  async findByCode(code) {
    return Product.findOne({ code }).lean();
  }

  async create(productData) {
    const product = await Product.create(productData);
    return product.toObject();
  }

  async updateById(id, productData) {
    return Product.findByIdAndUpdate(id, productData, {
      new: true,
      runValidators: true,
    }).lean();
  }

  async deleteById(id) {
    return Product.findByIdAndDelete(id).lean();
  }
}

export default new ProductRepository();
