import mongoose from "mongoose";
import logger from "../log/logger";

const connectToDB = async () => {
    try {
        const db_uri = process.env.DB_URI;
        if (db_uri) {
            await mongoose.connect(db_uri);
        }
    } catch (err) {
        logger.error(err);
    }
}

export default connectToDB;