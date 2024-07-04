const checkVariables = () => {
    const db = process.env.DATABASE;
    const dbUsername = process.env.USERNAME;
    const dbPassword = process.env.PASSWORD;

    if (db && dbUsername && dbPassword) {
        return {
            db,
            dbUsername,
            dbPassword
        }
    } else {
        throw Error("There seems to be a missing Environment variable")
    }
}

export default checkVariables;