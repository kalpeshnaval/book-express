import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    throw new Error("Please provide a valid MongoDB URI");
}

declare global {
    var mongooseCache : {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    }
}

const cached = global.mongooseCache || (global.mongooseCache = {conn: null, promise: null})

export const connectToDatabase = async() => {
    if(cached.promise) {
        cached.promise = mongoose.connect(MONGO_URI, {
            bufferCommands: false
        })

        try {
            cached.conn = await cached.promise;
        } catch (error) {
            cached.promise = null
            console.error("Failed to connect to database", error)
            throw error;
        }
    }

    console.info('Connected to database')

    return cached.conn;
}
