import mongoose, { Schema, Document } from 'mongoose';

// TypeScript interface for better type checking
export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String 
    },
    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'DONE'],
      default: 'TODO',
    },
    // AI is priority ko decide karega task ke description ke hisaab se
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    // AI auto-generate karega relevant tags (e.g., 'bug', 'frontend')
    tags: { 
      type: [String], 
      default: [] 
    },
  },
  { timestamps: true } // Ye automatically createdAt aur updatedAt add kar dega
);

// Next.js hot-reload ke time error se bachne ke liye ye check zaroori hai
export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);