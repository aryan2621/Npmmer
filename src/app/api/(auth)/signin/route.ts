import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fetchUserByEmail } from '@/server/user';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db';

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();
        const body = await request.json();
        const { email, password } = body;
        const user = await fetchUserByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }
        const isPasswordValid = bcryptjs.compareSync(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
            expiresIn: '1d',
        });
        const response = NextResponse.json(user, { status: 200 });
        response.cookies.set('token', token, {
            httpOnly: true,
            maxAge: 86400,
            expires: new Date(Date.now() + 86400),
        });
        return response;
    } catch (error) {
        console.error('Error while signing in', error);
        return NextResponse.json({ message: 'Error while signing in, please try again later' }, { status: 500 });
    }
}
