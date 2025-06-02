const Sale = require("../models/sale.model");
const Product = require("../models/product.model");
const Client = require("../models/client.model");

// [POST] Sotuv yaratish
const createSale = async (req, res) => {
  try {
    const { product_id, price, kv, type, width, height, client_id, profit } =
      req.body;

    if (!product_id || !price || !kv || !type) {
      return res.status(400).json({
        success: false,
        message: "Majburiy maydonlar to‘ldirilmagan",
      });
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Mahsulot topilmadi",
      });
    }

    const sale = await Sale.create({
      product_id,
      price,
      kv,
      type,
      width,
      height,
      client_id: client_id || null,
      profit,
      sold_at: new Date(),
    });

    // Agar qarzga sotilsa va mijoz bor bo‘lsa, qarzni Client modelga qo‘shamiz
    if (type === "qarz" && client_id) {
      await Client.findByIdAndUpdate(client_id, {
        $push: {
          debts: {
            product_name: product.name,
            quantity: kv,
            price,
            total: kv * price,
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 kunlik muddat
            status: "active",
          },
        },
      });
    }

    res.status(201).json({
      success: true,
      message: "Sotuv muvaffaqiyatli yaratildi",
      data: sale,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Sotuvni yaratishda xatolik",
      error: err.message,
    });
  }
};

// [GET] Bugungi statistika
const getTodayStats = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const sales = await Sale.find({ sold_at: { $gte: startOfDay } }).populate(
      "product_id"
    );

    let naxt = 0,
      karta = 0,
      qarz = 0,
      total_kv = 0,
      total_profit = 0;

    sales.forEach(({ type, kv, price, product_id }) => {
      const total = kv * price;
      const cost = product_id?.purchase_price || 0;
      const profit = kv * (price - cost);

      total_kv += kv;
      total_profit += profit;

      if (type === "naxt") naxt += total;
      else if (type === "karta") karta += total;
      else if (type === "qarz") qarz += total;
    });

    res.status(200).json({
      success: true,
      date: new Date(),
      naxt_tushum: naxt,
      karta_tushum: karta,
      qarzga_sotilgan: qarz,
      sotilgan_kv: total_kv,
      sotuvlar_soni: sales.length,
      foyda: total_profit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Bugungi statistika xatoligi",
      error: error.message,
    });
  }
};

// [GET] Oylik statistika
const getMonthlyStats = async (req, res) => {
  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

    const sales = await Sale.find({ sold_at: { $gte: firstDay } }).populate(
      "product_id"
    );

    let naxt = 0,
      karta = 0,
      qarz = 0,
      total_kv = 0,
      total_profit = 0;

    sales.forEach(({ type, kv, price, product_id }) => {
      const total = kv * price;
      const cost = product_id?.purchase_price || 0;
      const profit = kv * (price - cost);

      total_kv += kv;
      total_profit += profit;

      if (type === "naxt") naxt += total;
      else if (type === "karta") karta += total;
      else if (type === "qarz") qarz += total;
    });

    res.status(200).json({
      success: true,
      month: now.getMonth() + 1,
      naxt_tushum: naxt,
      karta_tushum: karta,
      qarzga_sotilgan: qarz,
      sotilgan_kv: total_kv,
      sotuvlar_soni: sales.length,
      foyda: total_profit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Oylik statistika xatoligi",
      error: error.message,
    });
  }
};

// [GET] Eng ko‘p sotilgan mahsulotlar
const getTopProducts = async (req, res) => {
  try {
    const sales = await Sale.find().populate("product_id");
    const productSales = {};

    sales.forEach(({ product_id, kv }) => {
      if (!product_id) return;
      if (!productSales[product_id._id]) {
        productSales[product_id._id] = { name: product_id.name, total_kv: 0 };
      }
      productSales[product_id._id].total_kv += kv;
    });

    const sortedProducts = Object.values(productSales).sort(
      (a, b) => b.total_kv - a.total_kv
    );

    res.status(200).json({
      success: true,
      top_products: sortedProducts.slice(0, 10),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Eng ko‘p sotilgan mahsulotlar xatoligi",
      error: error.message,
    });
  }
};

// [GET] Sana oralig‘i bo‘yicha statistika
const getStatsByRange = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "'from' va 'to' sanalari talab qilinadi",
      });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    const sales = await Sale.find({
      sold_at: { $gte: fromDate, $lte: toDate },
    }).populate("product_id");

    let naxt = 0,
      karta = 0,
      qarz = 0,
      total_kv = 0,
      total_profit = 0;

    sales.forEach(({ type, kv, price, product_id }) => {
      const total = kv * price;
      const cost = product_id?.purchase_price || 0;
      const profit = kv * (price - cost);

      total_kv += kv;
      total_profit += profit;

      if (type === "naxt") naxt += total;
      else if (type === "karta") karta += total;
      else if (type === "qarz") qarz += total;
    });

    res.status(200).json({
      success: true,
      from,
      to,
      naxt_tushum: naxt,
      karta_tushum: karta,
      qarzga_sotilgan: qarz,
      sotilgan_kv: total_kv,
      sotuvlar_soni: sales.length,
      foyda: total_profit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Sana oralig‘i bo‘yicha statistika xatoligi",
      error: error.message,
    });
  }
};

module.exports = {
  createSale,
  getTodayStats,
  getMonthlyStats,
  getTopProducts,
  getStatsByRange,
};
