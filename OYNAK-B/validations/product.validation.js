const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);
require("ajv-formats")(ajv);
const response = require("../utils/response");

const productValidation = (req, res, next) => {
  const schema = {
    type: "object",
    properties: {
      name: { type: "string", minLength: 2 },
      width: { type: "number", minimum: 0.1 },
      height: { type: "number", minimum: 0.1 },
      purchase_price: { type: "number", minimum: 0 },
      selling_price: { type: "number", minimum: 0 },
      from: { type: "string", minLength: 2 },
      currency: { type: "string", enum: ["USD", "SUM"] },
    },
    required: [
      "name",
      "width",
      "height",
      "purchase_price",
      "selling_price",
      "from",
      "currency",
    ],
    additionalProperties: false,
    errorMessage: {
      required: {
        name: "Oynak nomi kiritilishi kerak",
        width: "Eni kiritilishi kerak",
        height: "Bo‘yi kiritilishi kerak",
        purchase_price: "Kirim narxi kiritilishi kerak",
        selling_price: "Sotish narxi kiritilishi kerak",
        from: "Kimdan kelgani kiritilishi kerak",
        currency: "Valyutani tanlash kerak",
      },
      properties: {
        name: "Nomi kamida 2 harfdan iborat bo‘lishi kerak",
        width: "Eni faqat musbat son bo‘lishi kerak",
        height: "Bo‘yi faqat musbat son bo‘lishi kerak",
        purchase_price: "Kirim narxi musbat son bo‘lishi kerak",
        selling_price: "Sotish narxi musbat son bo‘lishi kerak",
        from: "Kimdan kelgani kamida 2ta harf bo‘lishi kerak",
        currency: "Valyuta faqat USD yoki SUM bo‘lishi mumkin",
      },
    },
  };

  const validate = ajv.compile(schema);
  const result = validate(req.body);
  if (!result) {
    const errorField = validate.errors[0].instancePath.replace("/", "");
    const errorMessage = validate.errors[0].message;
    return response.error(res, `${errorField} xato: ${errorMessage}`);
  }

  next();
};

module.exports = productValidation;
