// 📁 middlewares/clientValidation.js

const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);
require("ajv-formats")(ajv);
const response = require("../utils/response");

const clientValidation = (req, res, next) => {
  const schema = {
    type: "object",
    properties: {
      name: { type: "string", minLength: 2 },
      phone: { type: "string", pattern: "^\\d{7,15}$" },
      address: { type: "string", minLength: 3 },
    },
    required: ["name", "phone"],
    additionalProperties: false,
    errorMessage: {
      required: {
        name: "Ism majburiy",
        phone: "Telefon raqam majburiy",
      },
      properties: {
        name: "Ism kamida 2 harf bo‘lishi kerak",
        phone: "Telefon raqam noto‘g‘ri (7-15 raqam bo‘lishi kerak)",
        address: "Manzil kamida 3 harf bo‘lishi kerak",
      },
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

  next();
};

module.exports = clientValidation;
