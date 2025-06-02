const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);
require("ajv-formats")(ajv);
const response = require("../utils/response");

const productIncomeValidation = (req, res, next) => {
  const schema = {
    type: "object",
    properties: {
      product_id: { type: "string", minLength: 10 },
      quantity: { type: "number", minimum: 1 },
      price: { type: "number", minimum: 0 },
      from: { type: "string", minLength: 2 },
    },
    required: ["product_id", "quantity", "price", "from"],
    additionalProperties: false,
    errorMessage: {
      required: {
        product_id: "Mahsulot ID majburiy",
        quantity: "Miqdor kiritilishi kerak",
        price: "Narx majburiy",
        from: "Kimdan kelgani majburiy",
      },
      properties: {
        quantity: "Miqdor musbat son bo‘lishi kerak",
        price: "Narx musbat son bo‘lishi kerak",
        from: "Ism kamida 2 harf bo‘lishi kerak",
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

module.exports = productIncomeValidation;
