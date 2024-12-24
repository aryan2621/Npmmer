import bcryptjs from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/server/user';
import { User } from '@/model/user';
import { connectToDatabase } from '@/server/db';
export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const body = await req.json();
        const { id, name, email, password } = body;
        const salt = bcryptjs.genSaltSync(10);
        const hashedPassword = bcryptjs.hashSync(password, salt);
        const user = new User(id, name, email, hashedPassword);
        await createUser(user);
        return NextResponse.json({ message: 'User created' }, { status: 201 });
    } catch (error) {
        console.error('Error while creating user', error);
        return NextResponse.json({ message: 'Error while creating user' }, { status: 500 });
    }
}
