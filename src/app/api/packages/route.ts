import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db';
import { fetchPackagesByUser } from '@/server/package';

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        const token = req.cookies.get('token');
        if (!token) {
            throw new Error('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.JWT_SECRET!) as { id: string };
        const packages = await fetchPackagesByUser(user.id);
        return NextResponse.json(packages, { status: 200 });
    } catch (error) {
        console.error('Error fetching packages', error);
        return NextResponse.json({ message: 'Error fetching packages' }, { status: 500 });
    }
}
