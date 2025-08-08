import mongoose from 'mongoose';

let connection: mongoose.Mongoose | null = null;
const mongoURL = process.env.MONGO_URL || process.env.MONGO_URI || "mongodb://localhost:27017/fsd-assignment";

export const connectDB = async (): Promise<void> => {
    try {
        if (connection && mongoose.connection.readyState === 1) return;

        if (!mongoURL) {
            throw new Error(
                'MONGO_URI is not defined in environment variables'
            );
        }

        connection = await mongoose.connect(mongoURL);
    } catch (error: any) {
        throw error;
    }
};
