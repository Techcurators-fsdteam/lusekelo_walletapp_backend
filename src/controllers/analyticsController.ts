import { Request, Response } from 'express';
import Transaction from '../models/transaction';
import User from '../models/user';
import mongoose from 'mongoose';

// Get Analytics Summary
export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { period = 'month' } = req.query; // day, week, month, year

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Get user balance
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Get all transactions for the period
    const transactions = await Transaction.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startDate },
      status: 'completed'
    }).sort({ date: -1 });

    // Calculate income and expenses
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown: { [key: string]: number } = {};

    transactions.forEach(transaction => {
      if (transaction.amount > 0) {
        totalIncome += transaction.amount;
      } else {
        totalExpense += Math.abs(transaction.amount);
      }

      // Categorize transactions
      const category = getCategoryFromType(transaction.type, transaction.description);
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = 0;
      }
      categoryBreakdown[category] += Math.abs(transaction.amount);
    });

    // Get recent transactions (last 10)
    const recentTransactions = transactions.slice(0, 10).map(t => ({
      id: t._id,
      type: t.type,
      amount: t.amount,
      description: t.description,
      date: t.date,
      category: getCategoryFromType(t.type, t.description),
      status: t.status
    }));

    res.json({
      balance: user.balance,
      totalIncome,
      totalExpense,
      categoryBreakdown,
      recentTransactions,
      period,
      startDate,
      endDate: now
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get Category-wise breakdown
export const getCategoryBreakdown = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { period = 'month', type = 'expense' } = req.query; // income or expense

    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    const amountFilter = type === 'income' ? { $gt: 0 } : { $lt: 0 };

    const transactions = await Transaction.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startDate },
      amount: amountFilter,
      status: 'completed'
    });

    const categoryBreakdown: { [key: string]: { amount: number; count: number; color: string } } = {};

    transactions.forEach(transaction => {
      const category = getCategoryFromType(transaction.type, transaction.description);
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = {
          amount: 0,
          count: 0,
          color: getCategoryColor(category)
        };
      }
      categoryBreakdown[category].amount += Math.abs(transaction.amount);
      categoryBreakdown[category].count += 1;
    });

    // Convert to array and sort by amount
    const categories = Object.entries(categoryBreakdown).map(([name, data]) => ({
      name,
      ...data
    })).sort((a, b) => b.amount - a.amount);

    res.json({
      categories,
      type,
      period,
      total: categories.reduce((sum, cat) => sum + cat.amount, 0)
    });
  } catch (err) {
    console.error('Category breakdown error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get Transaction Trends
export const getTransactionTrends = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { period = 'month' } = req.query;

    const now = new Date();
    let startDate = new Date();
    let groupBy = '$dayOfMonth';
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        groupBy = '$dayOfWeek';
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        groupBy = '$dayOfMonth';
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        groupBy = '$month';
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    const trends = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          income: {
            $sum: {
              $cond: [{ $gt: ['$amount', 0] }, '$amount', 0]
            }
          },
          expense: {
            $sum: {
              $cond: [{ $lt: ['$amount', 0] }, { $abs: '$amount' }, 0]
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      trends,
      period
    });
  } catch (err) {
    console.error('Transaction trends error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Helper function to categorize transactions
function getCategoryFromType(type: string, description: string): string {
  const descLower = description.toLowerCase();
  
  // Check description for keywords
  if (descLower.includes('salary') || descLower.includes('income')) return 'Salary';
  if (descLower.includes('food') || descLower.includes('restaurant') || descLower.includes('drink')) return 'Food & Drink';
  if (descLower.includes('shopping') || descLower.includes('purchase')) return 'Shopping';
  if (descLower.includes('internet') || descLower.includes('wifi') || descLower.includes('data')) return 'Internet';
  if (descLower.includes('wallet') || descLower.includes('deposit')) return 'E-Wallet';
  if (descLower.includes('transport') || descLower.includes('taxi') || descLower.includes('bus')) return 'Transport';
  if (descLower.includes('bill') || descLower.includes('utility')) return 'Bills';
  if (descLower.includes('entertainment') || descLower.includes('movie')) return 'Entertainment';
  
  // Fallback to transaction type
  switch (type) {
    case 'receive':
      return 'Deposit';
    case 'send':
      return 'Transfer';
    case 'recharge':
      return 'Recharge';
    case 'bill':
      return 'Bills';
    case 'loan':
      return 'Loan';
    default:
      return 'Other';
  }
}

// Helper function to get category colors
function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    'Salary': '#10B981',
    'Food & Drink': '#0E7490',
    'E-Wallet': '#22C55E',
    'Internet': '#F59E0B',
    'Shopping': '#EF4444',
    'Transport': '#8B5CF6',
    'Bills': '#F97316',
    'Entertainment': '#EC4899',
    'Deposit': '#10B981',
    'Transfer': '#3B82F6',
    'Recharge': '#14B8A6',
    'Loan': '#F59E0B',
    'Other': '#6B7280'
  };
  
  return colors[category] || '#6B7280';
}
