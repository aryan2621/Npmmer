import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { Package } from '@/model/package';
import { connectToDatabase } from '@/server/db';
import { createPackage } from '@/server/package';

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const token = req.cookies.get('token');
        if (!token) {
            throw new Error('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.JWT_SECRET!) as { id: string };
        const body = await req.json();
        const npmPackage = new Package(
            body.id,
            body.name,
            body.version,
            body.description,
            body.reasonForBeingFavorite,
            body.date,
            user.id,
        );
        await createPackage(npmPackage);
        return NextResponse.json({ message: 'Package saved' });
    } catch (error) {
        console.error('Error saving package:', error);
        return NextResponse.json({ error: 'Error saving package' }, { status: 500 });
    }
}
