// src/server/src/routes/expenses.ts
import { Router } from "express";
import { Expense } from "../models/Expense";

const router = Router();

// GET /api/expenses/:walletAddress
router.get("/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const expressions = await Expense.find({ walletAddress: walletAddress.toLowerCase() }).sort({ date: -1, _id: -1 });
    res.json(expressions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load expenses" });
  }
});

// POST /api/expenses
router.post("/", async (req, res) => {
  const { walletAddress, amount, description, category, date, type } = req.body;

  if (
    !walletAddress ||
    amount === undefined ||
    !description ||
    !category ||
    !date
  ) {
    return res
      .status(400)
      .json({ message: "Missing required fields" });
  }

  try {
    const newExpense = new Expense({
      walletAddress: walletAddress.toLowerCase(),
      amount,
      description,
      category,
      date,
      type: type || "manual"
    });
    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save expense" });
  }
});

// DELETE /api/expenses/:id
router.delete("/:id", async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete expense" });
  }
});

export default router;
