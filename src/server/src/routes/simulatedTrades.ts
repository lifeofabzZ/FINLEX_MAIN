import express from 'express';
import { SimulatedTrade } from '../models/SimulatedTrade';
import { User } from '../models/User';

const router = express.Router();

// GET all simulated trades for a specific wallet
router.get('/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const lowerAddress = walletAddress.toLowerCase();
        const trades = await SimulatedTrade.find({ walletAddress: lowerAddress }).sort({ timestamp: -1 });
        res.json(trades);
    } catch (error) {
        console.error('Error fetching simulated trades:', error);
        res.status(500).json({ error: 'Server error fetching trades' });
    }
});

// POST a new simulated trade
router.post('/', async (req, res) => {
    try {
        const { walletAddress, id, type, crypto, amount, price, timestamp, quantity } = req.body;

        if (!walletAddress) {
            return res.status(400).json({ error: 'walletAddress is required' });
        }

        const lowerAddress = walletAddress.toLowerCase();

        // Verify user exists just to be safe
        const user = await User.findOne({ walletAddress: lowerAddress });
        if (!user) {
            console.warn(`Attempting to save trade for non-existent user wallet ${lowerAddress}, but proceeding...`);
        }

        const trade = new SimulatedTrade({
            walletAddress: lowerAddress,
            id,
            type,
            crypto,
            amount,
            price,
            timestamp,
            quantity
        });

        await trade.save();

        // Calculate current demo balance by finding all trades
        const allTrades = await SimulatedTrade.find({ walletAddress: lowerAddress });

        // Initial balance is 100000
        let currentDemoBalance = 100000;

        for (const t of allTrades) {
            if (t.type === 'buy') {
                currentDemoBalance -= (t.amount || 0);
            } else if (t.type === 'sell') {
                currentDemoBalance += (t.amount || 0);
            }
        }

        // Update user's demo balance explicitly if we added logic to store it on User Model (Optional refinement)
        if (user) {
            user.demoBalance = currentDemoBalance;
            await user.save();
        }

        res.status(201).json({ success: true, trade, currentDemoBalance });
    } catch (error) {
        console.error('Error saving simulated trade:', error);
        res.status(500).json({ error: 'Server error saving trade' });
    }
});

export default router;
