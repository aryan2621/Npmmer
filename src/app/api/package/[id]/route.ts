import { NextResponse, NextRequest } from 'next/server';
import { Package } from '@/model/package';
import { connectToDatabase } from '@/server/db';
import { deletePackage, updatePackage } from '@/server/package';
import jwt from 'jsonwebtoken';

export async function PUT(req: NextRequest) {
    try {
        await connectToDatabase();
        const token = req?.cookies?.get('token');
        if (!token) {
            throw new Error('You are not authorized to perform this action');
        }
        const user = jwt.verify(token.value, process.env.JWT_SECRET!) as { id: string };
        const id = req.nextUrl.pathname.split('/').pop();
        if (!id) {
            throw new Error('Package ID is required');
        }
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
        await updatePackage(id, npmPackage.reasonForBeingFavorite);
        return NextResponse.json({ message: 'Package updated' });
    } catch (error) {
        console.error('Error updating package:', error);
        return NextResponse.json({ error: 'Error updating package' }, { status: 500 });
    }
}
export async function DELETE(req: NextRequest) {
    try {
        await connectToDatabase();
        const token = req.cookies.get('token');
        if (!token) {
            throw new Error('You are not authorized to perform this action');
        }
        const id = req.nextUrl.pathname.split('/').pop();
        if (!id) {
            throw new Error('Package ID is required');
        }
        await deletePackage(id);
        return NextResponse.json({ message: 'Package deleted' });
    } catch (error) {
        console.error('Error deleting package:', error);
        return NextResponse.json({ error: 'Error deleting package' }, { status: 500 });
    }
}
