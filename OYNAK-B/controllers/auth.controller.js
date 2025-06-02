const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// [POST] - Ro‘yxatdan o‘tish
const register = async (req, res) => {
  try {
    const { first_name, last_name, phone, password, role } = req.body;

    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ message: "Bu raqam allaqachon mavjud" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      first_name,
      last_name,
      phone,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      success: true,
      message: "Foydalanuvchi ro‘yxatdan o‘tdi",
      data: newUser,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Xatolik", error: err.message });
  }
};

// [POST] - Login qilish
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: "User topilmadi" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Parol noto‘g‘ri" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Kirish muvaffaqiyatli",
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        role: user.role,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Login xatoligi", error: err.message });
  }
};

module.exports = { register, login };
