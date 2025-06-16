// models/Details.Model.ts

import { model, models, Schema } from "mongoose";

export type Details = {
    id: string;
    userId: string;
    ipAddress: string;
    browser: string;
    os: string;
    device: string;
    location: string;
    longitude: number;
    latitude: number;
    createdAt: Date;
    updatedAt: Date;
};

const DetailsSchema = new Schema({
    userId: {
        type: String,
        required: true,
        ref: "User",
    },
    ipAddress: {
        type: String,
        required: true,
    },
    browser: {
        type: String,
        required: true,
    },
    os: {
        type: String,
        required: true,
    },
    device: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    latitude: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const DetailsModel = models.Details || model<Details>("Details", DetailsSchema);
export default DetailsModel;