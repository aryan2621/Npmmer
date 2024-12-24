import { User } from '@/model/user';
import { UserModel } from '@/server/db';

export const fetchUserByEmail = async (email: string) => {
    const user = await UserModel.findOne({ email });
    return user;
};

export const createUser = async (user: User) => {
    const userByEmail = await fetchUserByEmail(user.email);
    if (userByEmail) {
        throw new Error('User already exists');
    }
    const newUser = await UserModel.create(user);
    return newUser;
};
