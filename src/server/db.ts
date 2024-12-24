import { Package } from '@/model/package';
import { User } from '@/model/user';
import mongoose, { model, Schema } from 'mongoose';

export const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
    } catch (error) {
        console.error('Error connecting to database', error);
        throw error;
    }
};

export const PackageSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    version: { type: String, required: true },
    description: { type: String, required: true, default: 'No description available' },
    reasonForBeingFavorite: { type: String, required: true, default: 'No reason provided' },
    date: { type: String, default: new Date().toISOString() },
    user: { type: String, required: true },
});

export const PackageModel = mongoose.models.Package || model<Package>('Package', PackageSchema);

export const UserSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

export const UserModel = mongoose.models.User || model<User>('User', UserSchema);
