import mongoose, { Schema, Document } from "mongoose";

interface IVisitorForm extends Document {
  fullName: string;
  numberOfVisitors: number;
  address: string;
  countryCode: string;
  phone: string;
  email: string;
  howHeardAbout: string;
  date: string;
  guide?: string;
  signature: string;
  consent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VisitorFormSchema = new Schema<IVisitorForm>(
  {
    fullName: {
      type: String,
      required: [true, "Please provide a full name"],
      trim: true,
    },
    numberOfVisitors: {
      type: Number,
      required: [true, "Please provide number of visitors"],
      min: 1,
    },
    address: {
      type: String,
      required: [true, "Please provide an address"],
      trim: true,
    },
    countryCode: {
      type: String,
      required: [true, "Please provide a country code"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Please provide a phone number"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      lowercase: true,
    },
    howHeardAbout: {
      type: String,
      required: [true, "Please select how you heard about us"],
      enum: [
        "social-media",
        "word-of-mouth",
        "website",
        "advertisement",
        "friend",
        "other",
      ],
    },
    date: {
      type: String,
      required: [true, "Please provide a preferred date"],
    },
    guide: {
      type: String,
      trim: true,
    },
    signature: {
      type: String,
      required: [true, "Please provide a signature"],
    },
    consent: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.VisitorForm ||
  mongoose.model<IVisitorForm>(
    "VisitorForm",
    VisitorFormSchema,
    "visitor-form-data",
  );
