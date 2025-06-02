const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Mahsulot ID majburiy"],
    },
    client_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Mijoz ID majburiy"],
    },
    kv: {
      type: Number,
      required: [true, "Kvadrat maydon majburiy"],
      min: [0.01, "Kvadrat maydon 0.01 dan katta bo‘lishi kerak"],
    },
    price: {
      type: Number,
      required: [true, "Narx majburiy"],
      min: [0, "Narx manfiy bo‘lmasligi kerak"],
    },
    type: {
      type: String,
      enum: {
        values: ["naxt", "karta", "qarz"],
        message: "To‘lov turi faqat 'naxt', 'karta' yoki 'qarz' bo‘lishi kerak",
      },
      required: [true, "To‘lov turi majburiy"],
    },
    width: {
      type: Number,
      required: [true, "Eni majburiy"],
      min: [0.01, "Eni 0.01 dan katta bo‘lishi kerak"],
    },
    height: {
      type: Number,
      required: [true, "Bo‘yi majburiy"],
      min: [0.01, "Bo‘yi 0.01 dan katta bo‘lishi kerak"],
    },
    profit: {
      type: Number,
      default: 0,
      min: [0, "Foyda manfiy bo‘lmasligi kerak"],
    },
    sold_at: {
      type: Date,
      default: Date.now,
    },
    currency: {
      type: String,
      enum: ["usd", "sum"],
      default: "sum",
    },
    paid_amount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual maydon: umumiy summa (kv * price)
saleSchema.virtual("total").get(function () {
  return this.kv * this.price;
});

// Virtual: qolgan qarz
saleSchema.virtual("remaining").get(function () {
  return (this.kv * this.price) - (this.paid_amount || 0);
});

// 🔐 OverwriteModelError'ni oldini olish
module.exports = mongoose.models.Sale || mongoose.model("Sale", saleSchema);
