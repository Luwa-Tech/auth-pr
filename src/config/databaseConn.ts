import { DataSource } from "typeorm";
import { User } from "../entity/User";

const ServerDataSource = new DataSource({
    type: "postgres",
    url: process.env.PG_EXTERNAL_URI,
    entities: [User],
    synchronize: true,
    logging: true,
})

export default ServerDataSource;