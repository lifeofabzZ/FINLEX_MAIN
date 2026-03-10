import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    type: { type: String, default: 'manual', enum: ['manual', 'uploaded'] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const Expense = mongoose.model('Expense', ExpenseSchema);
