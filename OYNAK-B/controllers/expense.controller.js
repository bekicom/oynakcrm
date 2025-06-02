const Expense = require("../models/expense.model");
const response = require("../utils/response");

// [POST] Xarajat qo‘shish
exports.createExpense = async (req, res) => {
  try {
    const newExpense = await Expense.create(req.body);
    res.status(201).json({
      success: true,
      message: "Xarajat qo‘shildi",
      data: newExpense,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Xarajat yaratishda xatolik",
      error: err.message,
    });
  }
};


// [GET] Barcha xarajatlar
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    response.success(res, "Xarajatlar ro‘yxati", expenses);
  } catch (err) {
    response.error(res, "Xarajatlarni olishda xatolik", err.message);
  }
};

// [PUT] Xarajatni tahrirlash
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Expense.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updated) return response.notFound(res, "Xarajat topilmadi");
    response.success(res, "Xarajat yangilandi", updated);
  } catch (err) {
    response.error(res, "Tahrirlashda xatolik", err.message);
  }
};

// [DELETE] Xarajatni o‘chirish
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Expense.findByIdAndDelete(id);
    if (!deleted) return response.notFound(res, "Xarajat topilmadi");
    response.success(res, "Xarajat o‘chirildi");
  } catch (err) {
    response.error(res, "O‘chirishda xatolik", err.message);
  }
};
