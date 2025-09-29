import mongoose from 'mongoose';

interface ITransaction extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  type: 'send' | 'receive' | 'recharge' | 'bill' | 'loan' | 'other';  // Based on PDF services
  amount: number;
  description: string;  // e.g., "Mobile recharge to 123456"
  date: Date;
  transactionId?: string;  // Unique transaction identifier
  recipientId?: mongoose.Types.ObjectId;  // For send transactions
  senderId?: mongoose.Types.ObjectId;  // For receive transactions
  status: 'pending' | 'completed' | 'failed';  // Transaction status
}

const transactionSchema = new mongoose.Schema<ITransaction>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['send', 'receive', 'recharge', 'bill', 'loan', 'other'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  transactionId: { type: String, unique: true, sparse: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
});

export default mongoose.model<ITransaction>('Transaction', transactionSchema);