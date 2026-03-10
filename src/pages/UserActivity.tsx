// src/pages/UserActivity.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Activity,
  CreditCard,
  Wallet,
  Receipt,
} from 'lucide-react';
import { getExpenses } from '../lib/localStorage';
import axios from 'axios';
import Navbar from '../components/Navbar';

interface Trade {
  _id?: string;
  id: string;
  walletAddress: string;
  type: 'buy' | 'sell';
  crypto: string;
  amount: number;
  price: number;
  timestamp: number;
  quantity: number;
}

interface UserData {
  user: {
    id: string;
    walletAddress: string;
    demoBalance: number;
    createdAt: string;
    lastLogin: string;
  };
  trades: Trade[];
  totalTrades: number;
  buyTrades: number;
  sellTrades: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const UserActivity: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [trackedExpensesTotal, setTrackedExpensesTotal] = useState(0);

  useEffect(() => {
    const fetchUserActivity = async () => {
      try {
        const walletAddress = localStorage.getItem('walletAddress');
        if (!walletAddress) {
          setError('No wallet address found. Please login first.');
          setLoading(false);
          return;
        }

        const response = await axios.get<UserData>(
          `${API_BASE_URL}/api/auth/user/${walletAddress}`
        );

        setUserData(response.data);

        // Calculate totals
        let spent = 0;
        let earned = 0;
        response.data.trades.forEach((trade) => {
          if (trade.type === 'buy') {
            spent += trade.amount;
          } else {
            earned += trade.amount;
          }
        });
        setTotalSpent(spent);
        setTotalEarned(earned);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching user activity:', err);
        setError('Failed to load user activity. Please try again.');
        setLoading(false);
      }
    };

    fetchUserActivity();
  }, []);

  useEffect(() => {
    const walletAddress = localStorage.getItem('walletAddress');
    if (walletAddress) {
      const allExpenses = getExpenses();
      const userExpenses = allExpenses.filter(e => e.walletAddress === walletAddress);
      const total = userExpenses.reduce((sum, e) => sum + e.amount, 0);
      setTrackedExpensesTotal(total);
    }
  }, []);

  const filteredTrades = userData?.trades.filter((trade) => {
    if (filterType === 'all') return true;
    return trade.type === filterType;
  }) || [];

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-20">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-black text-white pt-20">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error || 'Failed to load user data'}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto mb-8"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">User Activity</h1>
              <p className="text-gray-400">
                {userData.user.walletAddress.slice(0, 6)}...
                {userData.user.walletAddress.slice(-4)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Joined</p>
              <p className="text-lg">
                {new Date(userData.user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        >
          {/* Demo Balance */}
          <motion.div
            className="bg-gradient-to-br from-blue-900/30 to-blue-700/20 p-6 rounded-lg border border-blue-700/50"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-300">Demo Balance</h3>
              <CreditCard className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold">
              ${userData.user.demoBalance.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">Available for trading</p>
          </motion.div>

          {/* Total Trades */}
          <motion.div
            className="bg-gradient-to-br from-purple-900/30 to-purple-700/20 p-6 rounded-lg border border-purple-700/50"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-300">Total Trades</h3>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold">{userData.totalTrades}</p>
            <p className="text-xs text-gray-400 mt-1">
              {userData.buyTrades} buy, {userData.sellTrades} sell
            </p>
          </motion.div>

          {/* Total Spent */}
          <motion.div
            className="bg-gradient-to-br from-red-900/30 to-red-700/20 p-6 rounded-lg border border-red-700/50"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-300">Total Spent</h3>
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">On purchases</p>
          </motion.div>

          {/* Total Earned */}
          <motion.div
            className="bg-gradient-to-br from-green-900/30 to-green-700/20 p-6 rounded-lg border border-green-700/50"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-300">Total Earned</h3>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold">${totalEarned.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">From sales</p>
          </motion.div>

          {/* Net Change */}
          <motion.div
            className={`bg-gradient-to-br p-6 rounded-lg border ${totalEarned - totalSpent >= 0
                ? 'from-green-900/30 to-green-700/20 border-green-700/50'
                : 'from-red-900/30 to-red-700/20 border-red-700/50'
              }`}
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-300">Net Change</h3>
              <DollarSign className="w-4 h-4 text-yellow-400" />
            </div>
            <p
              className={`text-2xl font-bold ${totalEarned - totalSpent >= 0
                  ? 'text-green-400'
                  : 'text-red-400'
                }`}
            >
              ${Math.abs(totalEarned - totalSpent).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {totalEarned - totalSpent >= 0 ? 'Profit' : 'Loss'}
            </p>
          </motion.div>
        </motion.div>

        {/* Expense Tracker Link Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="max-w-7xl mx-auto mb-8 flex justify-end"
        >
          <button
            onClick={() => navigate('/expenses')}
            className="flex items-center gap-4 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-4 rounded-xl font-medium transition-all shadow-lg shadow-indigo-900/50 border border-indigo-500/50"
          >
            <div className="bg-white/20 p-2.5 rounded-lg">
              <Receipt className="w-6 h-6" />
            </div>
            <div className="text-left pr-2">
              <div className="text-sm text-indigo-200 font-medium tracking-wide">Tracked Expenses</div>
              <div className="text-2xl font-bold">₹{trackedExpensesTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
            </div>
          </button>
        </motion.div>

        {/* Trades Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-7xl mx-auto"
        >
          <div className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
            {/* Filter Buttons */}
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">Trade History</h2>
              <div className="flex gap-2">
                {['all', 'buy', 'sell'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type as 'all' | 'buy' | 'sell')}
                    className={`px-4 py-2 rounded-lg transition ${filterType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)} (
                    {type === 'all'
                      ? userData.totalTrades
                      : type === 'buy'
                        ? userData.buyTrades
                        : userData.sellTrades}
                    )
                  </button>
                ))}
              </div>
            </div>

            {/* Trades List */}
            <div className="overflow-x-auto">
              {filteredTrades.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Cryptocurrency
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Quantity
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Date & Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrades.map((trade, index) => (
                      <motion.tr
                        key={trade.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-700 hover:bg-gray-800/30 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {trade.type === 'buy' ? (
                              <>
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span className="text-green-400 font-medium">
                                  BUY
                                </span>
                              </>
                            ) : (
                              <>
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                                <span className="text-red-400 font-medium">
                                  SELL
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-blue-300">
                            {trade.crypto.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {trade.quantity.toFixed(6)}
                        </td>
                        <td className="px-6 py-4">
                          ${trade.price.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={
                              trade.type === 'buy'
                                ? 'text-red-400'
                                : 'text-green-400'
                            }
                          >
                            {trade.type === 'buy' ? '-' : '+'}$
                            {trade.amount.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {formatDate(trade.timestamp)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-gray-400">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No {filterType !== 'all' ? filterType : ''} trades found.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-7xl mx-auto mt-8 pb-8 text-center text-gray-600 text-sm"
        >
          <p>Last login: {new Date(userData.user.lastLogin).toLocaleString()}</p>
        </motion.div>
      </div>
    </div>
  );
};

export default UserActivity;
