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
      min: [0.01, "Kvadrat maydon 0.01 dan katta bo'lishi kerak"],
    },
    price: {
      type: Number,
      required: [true, "Narx majburiy"],
      min: [0, "Narx manfiy bo'lmasligi kerak"],
    },
    extra_services: {
      type: [{
        service_amount: {
          type: Number,
          required: [true, "Qo'shimcha xizmat summasi majburiy"],
          min: [1, "Qo'shimcha xizmat summasi manfiy bo'lmasligi kerak"],
        },
        service_amount_in_sale_currency: {
          type: Number,
          required: [true, "Qo'shimcha xizmat summasi majburiy"],
          min: [1, "Qo'shimcha xizmat summasi manfiy bo'lmasligi kerak"],
        },
        service_name: {
          type: String,
          required: [true, "Qo'shimcha xizmat nomi majburiy"],
        },
      }],
      default: [],
    },
    type: {
      type: String,
      enum: {
        values: ["naxt", "karta", "qarz"],
        message: "To'lov turi faqat 'naxt', 'karta' yoki 'qarz' bo'lishi kerak",
      },
      required: [true, "To'lov turi majburiy"],
    },
    width: {
      type: Number,
      required: [true, "Eni majburiy"],
    },
    height: {
      type: Number,
      required: [true, "Bo'yi majburiy"],
    },
    profit: {
      type: Number,
      default: 0,
      min: [0, "Foyda manfiy bo'lmasligi kerak"],
    },
    payment_log: {
      type: [{
        date: {
          type: Date,
          default: Date.now,
        },
        amount: {
          type: Number,
          required: [true, "To'lov summasi majburiy"],
          min: [0, "To'lov summasi manfiy bo'lmasligi kerak"],
        }
      }],
      default: []
    },
    sold_at: {
      type: Date,
      default: Date.now,
    },
    currency: {
      type: String,
      enum: ["USD", "SUM"],
      default: "SUM",
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
  return (this.kv * this.price + Number(this.extra_services.reduce(
    (acc, item) => acc + item.service_amount_in_sale_currency,
    0
  ).toFixed())) - (this.paid_amount || 0);
});

// 🔐 OverwriteModelError'ni oldini olish
module.exports = mongoose.models.Sale || mongoose.model("Sale", saleSchema);
