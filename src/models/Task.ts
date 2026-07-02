import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  userId: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  tags: string[];
  subtasks: { title: string; completed: boolean }[]; 
  dueDate?: Date; // NAYA: Due Date interface mein add kiya
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['TODO', 'IN_PROGRESS', 'DONE'], default: 'TODO' },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    tags: { type: [String], default: [] },
    subtasks: [
      {
        title: { type: String, required: true },
        completed: { type: Boolean, default: false }
      }
    ],
    dueDate: { type: Date } // NAYA: Due Date mongoose schema mein add kiya
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);