import mongoose, { Schema, Document, models } from "mongoose";

export interface IGroupNote extends Document {
  name: string;
  description?: string;
  notes: mongoose.Types.ObjectId[]; // Array of Note IDs
  createdBy: mongoose.Types.ObjectId; // User ID who created the group
  createdAt: Date;
  updatedAt: Date;
  is_deleted: boolean;
}

const GroupNoteSchema = new Schema<IGroupNote>(
  {
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String,
        required: false
    },
    notes: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Note" }        
    ] , // Referencing Note model
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const GroupNote = models?.GroupNote || mongoose.model<IGroupNote>("GroupNote", GroupNoteSchema);

export default GroupNote;