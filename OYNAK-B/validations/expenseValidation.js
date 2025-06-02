const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);
const response = require("../utils/response");

const schema = {
  type: "object",
  properties: {
    amount: { type: "number", minimum: 1 },
    reason: { type: "string", minLength: 3 },
  },
  required: ["amount", "reason"],
  additionalProperties: false,
  errorMessage: {
    required: {
      amount: "Xarajat summasi kerak",
      reason: "Xarajat sababi kerak",
    },
    properties: {
      amount: "Xarajat summasi musbat raqam bo‘lishi kerak",
      reason: "Sababi kamida 3 harf bo‘lishi kerak",
    },
  },
};

const validateExpense = ajv.compile(schema);

module.exports = (req, res, next) => {
  const valid = validateExpense(req.body);
  if (!valid) {
    return response.error(res, validateExpense.errors[0].message);
  }
  next();
};
