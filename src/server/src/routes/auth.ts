import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { SimulatedTrade } from '../models/SimulatedTrade';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production';

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { walletAddress } = req.body;

        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address required' });
        }

        const lowerAddress = walletAddress.toLowerCase();

        // Find or create the user based on Ethereum wallet address in MongoDB
        let user = await User.findOne({ walletAddress: lowerAddress });

        if (!user) {
            // Create new user
            user = new User({
                walletAddress: lowerAddress,
                demoBalance: 100000
            });
        } else {
            // Update last login
            user.lastLogin = new Date();
        }

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                walletAddress: user.walletAddress
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Send token in response (frontend should store in memory/cookies)
        return res.json({
            success: true,
            token,
            user: {
                id: user._id,
                walletAddress: user.walletAddress,
                demoBalance: user.demoBalance
            }
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Server error during login/registration' });
    }
});

// Endpoint to get current user info
router.get('/me', async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.json({
            user: {
                id: user._id,
                walletAddress: user.walletAddress,
                demoBalance: user.demoBalance,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Get user details with all their trades and activities
router.get('/user/:walletAddress', async (req: Request, res: Response) => {
    try {
        const { walletAddress } = req.params;
        const lowerAddress = walletAddress.toLowerCase();

        const user = await User.findOne({ walletAddress: lowerAddress });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch all trades for this user
        const trades = await SimulatedTrade.find({ walletAddress: lowerAddress }).sort({ timestamp: -1 });

        // Calculate current demo balance based on trades
        let currentDemoBalance = 100000;
        for (const trade of trades) {
            if (trade.type === 'buy') {
                currentDemoBalance -= (trade.amount || 0);
            } else if (trade.type === 'sell') {
                currentDemoBalance += (trade.amount || 0);
            }
        }

        return res.json({
            user: {
                id: user._id,
                walletAddress: user.walletAddress,
                demoBalance: currentDemoBalance,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            },
            trades: trades,
            totalTrades: trades.length,
            buyTrades: trades.filter(t => t.type === 'buy').length,
            sellTrades: trades.filter(t => t.type === 'sell').length
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ error: 'Server error fetching user details' });
    }
});

export default router;
