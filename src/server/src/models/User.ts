import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    walletAddress: { type: String, required: true, unique: true },
    demoBalance: { type: Number, default: 100000 },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', UserSchema);
