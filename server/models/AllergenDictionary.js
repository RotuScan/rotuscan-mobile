import mongoose from 'mongoose';

const allergenDictionarySchema = new mongoose.Schema(
  {
    categoria: { type: String, required: true, unique: true, trim: true },
    sinonimos: { type: [String], default: [] },
  },
  { timestamps: true, collection: 'allergendictionaries' }
);

const AllergenDictionary =
  mongoose.models.AllergenDictionary ||
  mongoose.model('AllergenDictionary', allergenDictionarySchema);

export default AllergenDictionary;

