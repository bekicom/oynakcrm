const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true }); // Barcha xatolarni ko‘rsatish
require("ajv-errors")(ajv); // Custom xatolik xabarlari uchun
require("ajv-formats")(ajv); // Formatlar (masalan, email) uchun

const response = require("../utils/response");

const saleValidation = (req, res, next) => {
  const schema = {
    type: "object",
    properties: {
      product_id: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
      width: { type: "number", minimum: 0.01 },
      height: { type: "number", minimum: 0.01 },
      kv: { type: "number", minimum: 0.01 },
      price: { type: "number", minimum: 0 },
      profit: { type: "number", minimum: 0 }, // Foyda manfiy bo‘lmasligi kerak
      type: { type: "string", enum: ["naxt", "karta", "qarz"] },
      client_id: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
    },
    required: [
      "product_id",
      "width",
      "height",
      "kv",
      "price",
      "profit",
      "type",
      "client_id",
    ],
    additionalProperties: false, // Qo‘shimcha maydonlarga ruxsat berilmaydi
    errorMessage: {
      required: {
        product_id: "Mahsulot ID majburiy",
        width: "Eni majburiy",
        height: "Bo‘yi majburiy",
        kv: "Kvadrat maydon majburiy",
        price: "Narx majburiy",
        profit: "Foyda majburiy",
        type: "To‘lov turi majburiy",
        client_id: "Mijoz ID majburiy",
      },
      properties: {
        product_id: "Mahsulot ID noto‘g‘ri formatda",
        width: "Eni musbat bo‘lishi kerak",
        height: "Bo‘yi musbat bo‘lishi kerak",
        kv: "Kvadrat maydon musbat son bo‘lishi kerak",
        price: "Narx musbat bo‘lishi kerak",
        profit: "Foyda manfiy bo‘lmasligi kerak",
        type: "To‘lov turi faqat 'naxt', 'karta' yoki 'qarz' bo‘lishi kerak",
        client_id: "Mijoz ID noto‘g‘ri formatda",
      },
      additionalProperties: "Qo‘shimcha noma'lum maydon yuborilgan",
    },
  };

  const validate = ajv.compile(schema);
  const valid = validate(req.body);

  if (!valid) {
    const err = validate.errors[0];
    const field =
      err.instancePath.replace("/", "") ||
      err.params.missingProperty ||
      "ma'lumot";
    const message = err.message;
    return response.error(res, `${field} xato: ${message}`);
  }

  next(); // Hammasi to‘g‘ri bo‘lsa davom etadi
};

module.exports = saleValidation;
