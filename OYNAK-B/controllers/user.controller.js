const User = require("../models/user.model");

// [POST] - Yangi foydalanuvchi yaratish
const createUser = async (req, res) => {
  try {
    const { first_name, last_name, phone, role } = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Bu telefon raqam allaqachon ro'yxatdan o'tgan.",
      });
    }

    const newUser = await User.create({ first_name, last_name, phone, role });

    res.status(201).json({
      success: true,
      message: "Foydalanuvchi muvaffaqiyatli yaratildi",
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Foydalanuvchi yaratishda xatolik",
      error: error.message,
    });
  }
};

// [GET] - Barcha foydalanuvchilarni olish
const getUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      message: "Foydalanuvchilar ro'yxati",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Ma'lumotlarni olishda xatolik",
      error: error.message,
    });
  }
};

// [PUT] - Foydalanuvchini yangilash
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Foydalanuvchi topilmadi",
      });
    }

    res.status(200).json({
      success: true,
      message: "Foydalanuvchi yangilandi",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Yangilashda xatolik",
      error: error.message,
    });
  }
};

// [DELETE] - Foydalanuvchini o‘chirish
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "Foydalanuvchi topilmadi",
      });
    }

    res.status(200).json({
      success: true,
      message: "Foydalanuvchi o‘chirildi",
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
  createUser,
  getUsers,
  updateUser,
  deleteUser,
};
