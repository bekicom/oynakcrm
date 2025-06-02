const Client = require("../models/client.model");

// 🟢 Yangi mijoz yaratish
exports.createClient = async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json({ success: true, message: "Yaratildi", client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔵 Barcha mijozlarni olish (qarzlari bilan birga)
exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, clients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟠 Faqat qarzdor mijozlarni olish
exports.getDebtorClients = async (req, res) => {
  try {
    const debtors = await Client.find({ "debts.status": "active" }).sort({
      createdAt: -1,
    });
    res
      .status(200)
      .json({ success: true, message: "Qarzdor mijozlar", data: debtors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟡 Mijozni yangilash
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedClient = await Client.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedClient) {
      return res
        .status(404)
        .json({ success: false, message: "Mijoz topilmadi" });
    }
    res
      .status(200)
      .json({ success: true, message: "Yangilandi", client: updatedClient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔴 Mijozni o‘chirish
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedClient = await Client.findByIdAndDelete(id);
    if (!deletedClient) {
      return res
        .status(404)
        .json({ success: false, message: "Mijoz topilmadi" });
    }
    res.status(200).json({ success: true, message: "O‘chirildi" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Bitta qarzni to‘langan deb belgilash
exports.markDebtAsPaid = async (req, res) => {
  try {
    const { clientId, debtIndex } = req.params;

    const client = await Client.findById(clientId);
    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Mijoz topilmadi" });
    }

    if (!client.debts[debtIndex]) {
      return res
        .status(404)
        .json({ success: false, message: "Qarz topilmadi" });
    }

    client.debts[debtIndex].status = "paid";
    await client.save();

    res.status(200).json({ success: true, message: "Qarz to‘landi", client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ➕ Yangi qarz qo‘shish (qo‘lda)
exports.addDebt = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, quantity, price, due_date } = req.body;

    const client = await Client.findById(id);
    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Mijoz topilmadi" });
    }

    const total = quantity * price;

    client.debts.push({
      product_name,
      quantity,
      price,
      total,
      due_date: due_date ? new Date(due_date) : undefined,
      status: "active",
    });

    await client.save();

    res.status(200).json({ success: true, message: "Qarz qo‘shildi", client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 💵 Qisman to‘lov qo‘shish
exports.addPartialPayment = async (req, res) => {
  try {
    const { clientId, debtIndex } = req.params;
    const { amount } = req.body;

    const client = await Client.findById(clientId);
    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Mijoz topilmadi" });
    }

    const debt = client.debts[debtIndex];
    if (!debt) {
      return res
        .status(404)
        .json({ success: false, message: "Qarz topilmadi" });
    }

    // `paid_amount`ni yangilaymiz
    debt.paid_amount = (debt.paid_amount || 0) + amount;

    // To‘liq to‘langanmi tekshiramiz
    if (debt.paid_amount >= debt.total) {
      debt.status = "paid";
    }

    await client.save();

    res
      .status(200)
      .json({ success: true, message: "Qisman to‘lov qo‘shildi", client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
