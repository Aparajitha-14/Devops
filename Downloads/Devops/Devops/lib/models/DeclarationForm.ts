import mongoose, { Schema, Document } from "mongoose";

interface IDeclarationForm extends Document {
  fullName: string;
  address: string;
  countryCode: string;
  phone: string;
  email: string;
  animalType: string;
  animalAge: string;
  animalCondition: string;
  animalNotes?: string;
  declaration: boolean;
  declarationId: number;
  date: string;
  signature: string;
  consent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DeclarationFormSchema = new Schema<IDeclarationForm>(
  {
    fullName: {
      type: String,
      required: [true, "Please provide a full name"],
      trim: true,
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
    animalType: {
      type: String,
      required: [true, "Please select an animal type"],
      enum: ["dog", "cat", "rabbit", "bird", "hamster", "guinea-pig", "other"],
    },
    animalAge: {
      type: String,
      required: [true, "Please provide the animal age"],
      trim: true,
    },
    animalCondition: {
      type: String,
      required: [true, "Please describe the animal condition"],
      trim: true,
    },
    animalNotes: {
      type: String,
      trim: true,
    },
    declaration: {
      type: Boolean,
      required: [true, "You must agree to the declaration"],
    },
    declarationId: {
      type: Number,
      required: [true, "Declaration ID missing"],
      unique: true,
      index: true,
    },
    date: {
      type: String,
      required: [true, "Please provide a date"],
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

/**
 * Auto-increment declarationId on each new document using a counter collection.
 * This keeps a sequential declarationId associated with each saved declaration blob.
 *
 * NOTE: run this before validation so the generated declarationId is present
 * for any schema validation that requires it.
 */
DeclarationFormSchema.pre("validate", async function (next) {
  // Only assign a declarationId for new documents
  if (!this.isNew) {
    return next();
  }

  // Use (or create) a lightweight counter document in collection 'declaration_counters'
  const CounterModel =
    mongoose.models.DeclarationCounter ||
    mongoose.model(
      "DeclarationCounter",
      new mongoose.Schema(
        {
          seq: { type: Number, default: 0 },
        },
        { collection: "declaration_counters" },
      ),
    );

  const updated = await CounterModel.findOneAndUpdate(
    {},
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  // @ts-ignore - assign generated sequence to declarationId
  this.declarationId = updated.seq;

  next();
});

/**
 * Ensure an index exists on declarationId so uniqueness and lookups are enforced.
 * Creating the index on the schema makes Mongoose create it when the model initializes.
 */
DeclarationFormSchema.index({ declarationId: 1 }, { unique: true });

export default mongoose.models.DeclarationForm ||
  mongoose.model<IDeclarationForm>(
    "DeclarationForm",
    DeclarationFormSchema,
    "declaration-form-data",
  );
