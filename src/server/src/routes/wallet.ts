import express from 'express';
import { Wallet } from '../models/Wallet';

const router = express.Router();

router.post('/sync', async (req, res) => {
    try {
        const { address, transactions } = req.body;
        if (!address) {
            return res.status(400).json({ error: 'Address is required' });
        }

        let wallet = await Wallet.findOne({ address });
        if (!wallet) {
            wallet = new Wallet({ address, transactions: [] });
        }

        const existingHashSet = new Set(wallet.transactions.map((t: any) => t.hash));
        const newTxs = (transactions || []).filter((t: any) => !existingHashSet.has(t.hash));

        if (newTxs.length > 0) {
            wallet.transactions.push(...newTxs);
        }

        wallet.lastSynced = new Date();
        await wallet.save();

        res.json({ success: true, wallet });
    } catch (error) {
        console.error('Error syncing wallet:', error);
        res.status(500).json({ error: 'Server error while syncing wallet data' });
    }
});

export default router;
