import UserService from '../service/userService';
import UserHandler from '../handlers/userHandler';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express-serve-static-core';

type UserServiceMockType = {
    getUser: jest.Mock,
    createUser: jest.Mock,
};


jest.mock('express-validator', () => ({
    matchedData: jest.fn(() => ({
        email: 'test@example.com',
        password: 'password123'
    }))
}));

jest.mock('../service/userService', () => {
    return jest.fn().mockImplementation(() => ({
        getUser: jest.fn(),
        createUser: jest.fn()
    }));
});

jest.mock('bcrypt', () => ({
    hash: jest.fn((password) => `hashed_${password}`),
    compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn()
}));
const req = {
    body: {
        email: 'test@example.com',
        password: 'password123',
    },
} as Request;

const findUser = { _id: 'user_id', email: 'test@example.com', password: 'hashed_Password' };

const res = {
    status: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
} as unknown as Response;

describe('User handler', () => {
    let userHandler: UserHandler;
    let userServiceMock: UserServiceMockType;

    beforeEach(() => {
        userServiceMock = new UserService() as unknown as UserServiceMockType;
        userHandler = new UserHandler(userServiceMock as unknown as UserService);

        process.env.ACCESS_KEY = 'test_access_key';
    })

    afterEach(() => {
        jest.clearAllMocks();

        delete process.env.ACCESS_KEY;
    })

    describe('Register user', () => {
        it('Should return 409 when there is a conflict', async () => {
            userServiceMock.getUser.mockResolvedValueOnce({ email: 'test@example.com' });

            await userHandler.registerNewUser(req, res);

            expect(res.status).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ 'message': 'Email already in use' });
        });

        it('Should create user and respond with status 201', async () => {
            userServiceMock.getUser.mockResolvedValueOnce(null);
            userServiceMock.createUser.mockResolvedValueOnce({
                email: 'test@example.com',
                password: 'hashed_password'
            });

            await userHandler.registerNewUser(req, res);

            expect(res.status).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ "message": "User created successfully" });
        });

        it('should return 500 if an error occurs during user creation', async () => {
            userServiceMock.getUser.mockResolvedValueOnce(null);
            userServiceMock.createUser.mockRejectedValueOnce(new Error('Intenal server error'));

            await userHandler.registerNewUser(req, res);

            expect(res.status).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ 'message': 'Internal server error' });
        });
    });

    describe.only('Login user', () => {
        it('Should respond with 400 when user is not found', async () => {
            userServiceMock.getUser.mockResolvedValueOnce(null);

            await userHandler.loginUser(req, res);

            expect(res.status).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 'message': 'User does not exist' });
        });

        it('Should respond with 400 when password is incorrect', async () => {
            userServiceMock.getUser.mockResolvedValueOnce({ email: 'test@example.com', password: 'hashed_password' });

            jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false as never);

            const mockReq = {
                body: {
                    email: 'test@example.com',
                    password: 'wrongPwd'
                }
            } as Request

            await userHandler.loginUser(mockReq, res);

            expect(res.status).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 'message': 'Incorrect password' });
        });

        // Fix and refactor
        it('Should respond with 200 when login is successful and token created and sent', async () => {
            userServiceMock.getUser.mockResolvedValueOnce(findUser);
            (jwt.sign as jest.Mock).mockReturnValueOnce('test_token');

            await userHandler.loginUser(req, res);

            expect(jwt.sign).toHaveBeenCalledWith({ id: findUser._id }, 'test_access_key', { expiresIn: '1h' });
            expect(res.cookie).toHaveBeenCalledWith('access_token', 'test_token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({'message': 'Logged in successfully'});
        });

        // Fix and refactor
        it('Should respond with 500 when error occurs during user login', async () => {
            userServiceMock.getUser.mockResolvedValueOnce(findUser);
            jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true as never);
            (jwt.sign as jest.Mock).mockImplementationOnce(() => {
                throw new Error('Internal server error')
            });

            await userHandler.loginUser(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ 'message': 'Internal server error' });
        });
    });

    describe('Logout user', () => {
        it('Should respond with 200 when user is logged out', async () => {
            await userHandler.logoutUser(req, res);

            expect(res.clearCookie).toHaveBeenCalledWith('access_token');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({'message': 'Logged out successfully'});
        });
    });
});