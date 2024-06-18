import mongoose from "mongoose";

const connectToDB = async () => {
    try {
        const db_uri = process.env.DB_URI;
        if (db_uri) {
            await mongoose.connect(db_uri);
        }
    } catch (err) {
        console.error(err);
    }
}

export default connectToDB;