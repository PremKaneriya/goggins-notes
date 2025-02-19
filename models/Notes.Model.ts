import mongoose, { model, models, Types } from "mongoose";

export type MyNote = {
    _id: mongoose.Types.ObjectId;
    userId: Types.ObjectId;
    title: string;
    content: string;
    is_deleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const noteSchema = new mongoose.Schema<MyNote>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    is_deleted: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});

const Note = models?.Note || model<MyNote>("Note", noteSchema);

export default Note