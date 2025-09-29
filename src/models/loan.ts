import mongoose from 'mongoose';

interface ILoan extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  type: 'personal' | 'gold' | 'emi';
  amount: number;
  status: 'pending' | 'approved' | 'repaid';
  emiAmount?: number;
  dueDate: Date;
}

const loanSchema = new mongoose.Schema<ILoan>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['personal', 'gold', 'emi'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'repaid'], default: 'pending' },
  emiAmount: { type: Number },
  dueDate: { type: Date, required: true },
});

export default mongoose.model<ILoan>('Loan', loanSchema);