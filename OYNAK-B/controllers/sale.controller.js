const Sale = require("../models/sale.model");
const Product = require("../models/product.model");
const { getUsdRate } = require("../utils/rate");
// [POST] sotuv qilish
const createSale = async (req, res) => {
  try {
    const {
      type,
      client_id,
      product_id,
      price,
      kv,
      width,
      height,
      extra_services,
    } = req.body;
    const rate = await getUsdRate();
    // 🔐 Har qanday holatda client_id bo‘lishi kerak
    if (!client_id) {
      return res.status(400).json({
        success: false,
        message: "Klient tanlanmagan",
      });
    }

    // ✅ Mahsulotdan xarid narxini olib foyda hisoblaymiz
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Mahsulot topilmadi",
      });
    }

    const purchase_price = product.purchase_price || 0;
    const profit = (price - purchase_price) * kv;

    const convertedExtraServices = (extra_services || []).map((service) => {
      const amountInCurrency =
        product.currency === "USD"
          ? service.service_amount / rate
          : service.service_amount;

      return {
        ...service,
        service_amount_in_sale_currency: amountInCurrency,
      };
    });

    // Faqat sxemada ko‘zda tutilgan maydonlarni yuboramiz
    const sale = await Sale.create({
      type,
      client_id,
      product_id,
      price,
      kv,
      width,
      height,
      profit,
      currency: product.currency,
      extra_services: convertedExtraServices,
    });
    product.area -= kv;
    await product.save();

    res.status(201).json({
      success: true,
      message: "Sotuv muvaffaqiyatli qo‘shildi",
      data: sale,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Sotuv yaratishda xatolik",
      error: error.message,
    });
  }
};

// Qolgan funksiyalar o‘zgarmagan holda qoladi
const getSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("product_id")
      .populate("client_id")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Sotuvlar ro‘yxati",
      data: sales,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Xatolik",
      error: error.message,
    });
  }
};

const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Sale.findByIdAndUpdate(id, req.body, { new: true });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Sotuv topilmadi",
      });
    }

    res.status(200).json({
      success: true,
      message: "Sotuv yangilandi",
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

const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Sale.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Sotuv topilmadi",
      });
    }

    res.status(200).json({
      success: true,
      message: "Sotuv o‘chirildi",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "O‘chirishda xatolik",
      error: error.message,
    });
  }
};

const getSalesHistory = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("product_id")
      .populate("client_id")
      .sort({ sold_at: -1 });

    const formatted = sales.map((sale) => {
      const {
        _id,
        product_id,
        kv,
        width,
        height,
        price,
        type,
        sold_at,
        profit,
        client_id,
      } = sale;
      const total = kv * price;

      return {
        _id,
        product_name: product_id?.name || "Noma'lum",
        width,
        height,
        kv,
        price,
        total,
        type,
        profit,
        sold_at,
        client_name: client_id?.name || "Noma'lum",
        client_phone: client_id?.phone || "",
      };
    });

    res.status(200).json({
      success: true,
      message: "Sotuv tarixi ro‘yxati",
      data: formatted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Sotuv tarixini olishda xatolik",
      error: error.message,
    });
  }
};

module.exports = {
  createSale,
  getSales,
  updateSale,
  deleteSale,
  getSalesHistory,
};
