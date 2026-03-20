import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI;

declare global {
    var mongooseCache : {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    }
}

const cached = global.mongooseCache || (global.mongooseCache = {conn: null, promise: null})

export const connectToDatabase = async() => {
    if (!MONGO_URI) {
        throw new Error("MONGODB_URI is not configured");
    }

    if(cached.conn) {
        return cached.conn;
    }

    if(!cached.promise) {
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

    cached.conn = await cached.promise;

    console.info('Connected to database')

    return cached.conn;
}
