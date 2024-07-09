import User, { UserInterface } from "../model/User";

// TODO: why does it work?
interface UserData {
    email: string,
    password: string
}

class UserService {
    private user: typeof User;
    constructor() {
        this.user = User;
    }

    public getUser = async (email: string): Promise<UserInterface | null> => {
        const findUser = await this.user.findOne({ email: email });
        return findUser;
    }

    public createUser = async (userInfo: UserData): Promise<void> => {
        const result = await this.user.create(userInfo);
        await result.save();
    }
}

export default UserService;