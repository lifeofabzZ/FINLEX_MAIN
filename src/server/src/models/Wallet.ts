import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    hash: String,
    from: String,
    to: String,
    value: String,
    timestamp: Number
});

const WalletSchema = new mongoose.Schema({
    address: { type: String, required: true, unique: true },
    transactions: [TransactionSchema],
    lastSynced: { type: Date, default: Date.now }
});

export const Wallet = mongoose.model('Wallet', WalletSchema);
