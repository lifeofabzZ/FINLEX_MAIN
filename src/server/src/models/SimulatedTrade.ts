import mongoose from 'mongoose';

const SimulatedTradeSchema = new mongoose.Schema({
    walletAddress: { type: String, required: true },
    id: String,
    type: { type: String, enum: ['buy', 'sell'] },
    crypto: String,
    amount: Number,
    price: Number,
    timestamp: Number,
    quantity: Number
});

export const SimulatedTrade = mongoose.model('SimulatedTrade', SimulatedTradeSchema);
