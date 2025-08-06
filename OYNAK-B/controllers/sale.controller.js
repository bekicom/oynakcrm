const Sale = require("../models/sale.model");
const Product = require("../models/product.model");
const createSale = async (req, res) => {
  try {
    const { client_id, products, total_price, extra_services, payment_log } =
      req.body;

    for (const item of products) {
      const kvToDeduct = item.width * item.height * item.quantity;

      const product = await Product.findById(item.product_id);
      if (!product) {
        return res
          .status(404)
          .json({ error: `Product not found: ${item.product_id}` });
      }

      await Product.updateOne(
        { _id: item.product_id },
        { $inc: { kv: -kvToDeduct } }
      );
    }

    const newSale = new Sale({
      client_id,
      products,
      total_price,
      extra_services,
      payment_log,
    });

    await newSale.save();

    res.status(201).json({ message: "Sotuv amalga oshirildi", sale: newSale });
  } catch (error) {
    console.error("Sotuvni yaratishda xatolik:", error);
    res.status(500).json({ error: "Server xatosi" });
  }
};
const getSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("products.product_id")
      .populate("client_id")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Sotuvlar ro'yxati",
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

// const getSalesHistory = async (req, res) => {
//   try {
//     const sales = await Sale.find()
//       .populate("products.product_id")
//       .populate("client_id")
//       .sort({ createdAt: -1 });

//     const formatted = sales.map((sale) => {
//       const {
//         _id,
//         product_id,
//         kv,
//         width,
//         height,
//         price,
//         type,
//         sold_at,
//         profit,
//         client_id,
//       } = sale;
//       const total = kv * price;

//       return {
//         _id,
//         product_name: product_id?.name || "Noma'lum",
//         width,
//         height,
//         kv,
//         price,
//         total,
//         type,
//         profit,
//         sold_at,
//         client_name: client_id?.name || "Noma'lum",
//         client_phone: client_id?.phone || "",
//       };
//     });

//     res.status(200).json({
//       success: true,
//       message: "Sotuv tarixi ro‘yxati",
//       data: formatted,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Sotuv tarixini olishda xatolik",
//       error: error.message,
//     });
//   }
// };

module.exports = {
  createSale,
  getSales,
  updateSale,
  deleteSale,
};
