const mongoose = require("mongoose");

const productIncomeSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 }, // 1 dona narxi
  from: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ProductIncome", productIncomeSchema);
