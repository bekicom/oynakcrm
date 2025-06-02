const ProductIncome = require("../models/productincome.model");

const createIncome = async (req, res) => {
  try {
    const { product_id, quantity, price, from } = req.body;

    const income = await ProductIncome.create({
      product_id,
      quantity,
      price,
      from,
    });

    res.status(201).json({
      success: true,
      message: "Mahsulot kirimi qo‘shildi",
      data: income,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Xatolik",
      error: error.message,
    });
  }
};

const getIncomesByProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const incomes = await ProductIncome.find({ product_id: id }).sort({
      date: -1,
    });

    res.status(200).json({
      success: true,
      message: "Mahsulot kirimlari",
      data: incomes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Xatolik",
      error: error.message,
    });
  }
};

module.exports = {
  createIncome,
  getIncomesByProduct,
};
