import { PRODUCT_STATUS } from "../utils/constants.js";
import productRepository from "../repositories/product.repository.js";
import { config } from "../config/index.js";
import AppError from "../utils/errors.js";

const emailProvider = {
  async send(message) {
    console.log(`[EMAIL] ${message}`);
  },
};

class ProductService {
  async findAll(includeOutOfStock = false) {
    return productRepository.findAll({ includeOutOfStock });
  }

  async findById(id) {
    const product = await productRepository.findById(id);

    if (!product) {
      throw new AppError("Producto no encontrado", 404);
    }

    return product;
  }

  async getShippingCost(id) {
    const product = await this.findById(id);
    const isProduction = config.nodeEnv === "production";
    const shippingCost = isProduction ? 50 + product.price * 0.01 : 10;

    return {
      product: product._id,
      declaredValue: product.price,
      shippingCost,
    };
  }

  async create(productData) {
    const { title, code, price } = productData;

    if (!title || !code || price === undefined) {
      throw new AppError("Faltan campos obligatorios", 400);
    }

    if (price < 0) {
      throw new AppError("Precio inválido", 400);
    }

    const existingProduct = await productRepository.findByCode(code);

    if (existingProduct) {
      throw new AppError("Ya existe un producto con ese código", 409);
    }

    const stock = productData.stock ?? 0;
    const product = await productRepository.create({
      ...productData,
      stock,
      status:
        stock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK,
    });

    await emailProvider.send(`Producto creado: ${product.title}`);

    return product;
  }

  async update(id, productData) {
    const updateData = { ...productData };

    if (updateData.stock !== undefined) {
      if (updateData.stock < 0) {
        throw new AppError("El stock no puede ser negativo", 400);
      }

      updateData.status =
        updateData.stock > 0
          ? PRODUCT_STATUS.AVAILABLE
          : PRODUCT_STATUS.OUT_OF_STOCK;
    } else if (
      typeof updateData.status === "string" &&
      updateData.status.toLowerCase() === PRODUCT_STATUS.OUT_OF_STOCK
    ) {
      updateData.status = PRODUCT_STATUS.OUT_OF_STOCK;
    }

    const product = await productRepository.updateById(id, updateData);

    if (!product) {
      throw new AppError("Producto no encontrado", 404);
    }

    return product;
  }

  async delete(id) {
    const product = await productRepository.deleteById(id);

    if (!product) {
      throw new AppError("Producto no encontrado", 404);
    }

    return { message: "Producto eliminado" };
  }
}

export default new ProductService();
