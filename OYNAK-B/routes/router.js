const express = require("express");
const router = express.Router();

// ================= CONTROLLERS =================
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
const productController = require("../controllers/product.controller");
const statsController = require("../controllers/stats.controller");
const productIncomeController = require("../controllers/productincome.controller");
const clientController = require("../controllers/client.controller");
const saleController = require("../controllers/sale.controller");
const expenseController = require("../controllers/expense.controller");

// ================= VALIDATIONS =================
const productValidation = require("../validations/product.validation");
const productIncomeValidation = require("../validations/productincome.validation");
const clientValidation = require("../validations/client.validation");
const saleValidation = require("../validations/sale.validation");
const expenseValidation = require("../validations/expenseValidation");

// ======================= AUTH ROUTES =======================
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);

// ======================= USER ROUTES =======================
router.post("/users", userController.createUser);
router.get("/users", userController.getUsers);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);

// ======================= PRODUCT ROUTES =======================
router.post("/products", productValidation, productController.createProduct);
router.get("/products", productController.getProducts);
router.put("/products/:id", productValidation, productController.updateProduct);
router.delete("/products/:id", productController.deleteProduct);

// ======================= STATISTICS ROUTES =======================
router.get("/stats/today", statsController.getTodayStats);
router.get("/stats/month", statsController.getMonthlyStats);
router.get("/stats/top-products", statsController.getTopProducts);
router.get("/stats", statsController.getStatsByRange);

// ======================= PRODUCT INCOME ROUTES =======================
router.post(
  "/product-incomes",
  productIncomeValidation,
  productIncomeController.createIncome
);
router.get("/product-incomes/:id", productIncomeController.getIncomesByProduct);

// ======================= CLIENT ROUTES =======================
router.post("/clients", clientValidation, clientController.createClient);
router.get("/clients", clientController.getClients);
router.put("/clients/:id", clientValidation, clientController.updateClient);
router.delete("/clients/:id", clientController.deleteClient);

// ✅ Yangi qo‘shilgan marshrut — qarzdor mijozlar ro‘yxati
router.get("/clients/debtors", clientController.getDebtorClients);

// ✅ QARZLAR bilan bog‘liq qo‘shimcha marshrutlar
router.post("/clients/:id/add-debt", clientController.addDebt); // qo‘lda qarz qo‘shish
router.put(
  "/clients/:debtId/pay",
  clientController.markDebtAsPaid
); // qarzni to‘langan deb belgilash
router.put(
  "/clients/:debtId/pay-partial",
  clientController.addPartialPayment
); // qisman to‘lov

// ======================= SALE ROUTES =======================
router.post("/sales", saleValidation, saleController.createSale);
router.get("/sales", saleController.getSales);
router.put("/sales/:id", saleValidation, saleController.updateSale);
router.delete("/sales/:id", saleController.deleteSale);

// ======================= EXPENSE ROUTES =======================
router.post("/expenses", expenseValidation, expenseController.createExpense);
router.get("/expenses", expenseController.getExpenses);
router.put("/expenses/:id", expenseValidation, expenseController.updateExpense);
router.delete("/expenses/:id", expenseController.deleteExpense);

module.exports = router;
