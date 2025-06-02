const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);
require("ajv-formats")(ajv);
const response = require("../utils/response");

const userValidation = (req, res, next) => {
  const schema = {
    type: "object",
    properties: {
      first_name: { type: "string", minLength: 2 },
      last_name: { type: "string", minLength: 2 },
      phone: { type: "string", pattern: "^[0-9]{7,15}$" },
      role: { type: "string", enum: ["admin", "user"] },
    },
    required: ["first_name", "last_name", "phone"],
    additionalProperties: false,
    errorMessage: {
      required: {
        first_name: "Ism kiritish majburiy",
        last_name: "Familiya kiritish majburiy",
        phone: "Telefon raqam kiritish majburiy",
      },
      properties: {
        first_name: "Ism kamida 2 ta belgidan iborat bo‘lishi kerak",
        last_name: "Familiya kamida 2 ta belgidan iborat bo‘lishi kerak",
        phone:
          "Telefon faqat raqamlardan iborat va 7-15 ta belgidan iborat bo‘lishi kerak",
        role: "Roli faqat 'admin' yoki 'user' bo‘lishi mumkin",
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

module.exports = userValidation;
