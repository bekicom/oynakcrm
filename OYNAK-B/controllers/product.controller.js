const Product = require("../models/product.model");

// [POST] Yangi oynak mahsulot qo‘shish
const createProduct = async (req, res) => {
  try {
    const {
      name,
      width,
      height,
      purchase_price,
      selling_price,
      from,
      currency,
      quantity
    } = req.body;

    const newProduct = new Product({
      name,
      width,
      height,
      purchase_price,
      selling_price,
      from,
      currency,
      quantity,
      area: width * height * quantity,
      unit_area: width * height,
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Oynak mahsulot qo‘shildi",
      data: newProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Yaratishda xatolik",
      error: error.message,
    });
  }
};
// [GET] Barcha mahsulotlarni olish
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      success: true,
      message: "Mahsulotlar ro‘yxati",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Olishda xatolik",
      error: error.message,
    });
  }
};

// [PUT] Mahsulotni yangilash
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Mahsulot topilmadi",
      });
    }

    res.status(200).json({
      success: true,
      message: "Mahsulot yangilandi",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Yangilashda xatolik",
      error: error.message,
    });
  }
};

// [DELETE] Mahsulotni o‘chirish
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Mahsulot topilmadi",
      });
    }

    res.status(200).json({
      success: true,
      message: "Mahsulot o‘chirildi",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "O‘chirishda xatolik",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
};
