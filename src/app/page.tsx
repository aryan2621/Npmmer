'use client';

import { Package } from '@/model/package';
import { useEffect, useState } from 'react';
import ky from 'ky';
import Link from 'next/link';
import { Loader2, Pencil, Trash2, Package as PackageIcon, Info, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function Home() {
    const { toast } = useToast();
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleted, setDeleted] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showInfoDialog, setShowInfoDialog] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [editedReason, setEditedReason] = useState('');
    const router = useRouter();
    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setLoading(true);
                const fetchedPackages = await ky.get('/api/packages').json<Package[]>();
                setPackages(fetchedPackages);
            } catch (error) {
                console.error('Failed to fetch packages:', error);
                toast({
                    variant: 'destructive',
                    title: 'Error fetching packages',
                    description: 'Please try again later',
                });
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            setDeleted(true);
            await ky.delete(`/api/package/${id}`);
            setPackages(packages.filter((pkg) => pkg.id !== id));
            toast({
                title: 'Package deleted',
                description: 'Package has been removed from favorites',
            });
        } catch {
            toast({
                variant: 'destructive',
                title: 'Error deleting package',
                description: 'Please try again later',
            });
        } finally {
            setDeleted(false);
        }
    };

    const handleEdit = async () => {
        if (!selectedPackage) return;

        try {
            await ky.put(`/api/package/${selectedPackage.id}`, {
                json: {
                    ...selectedPackage,
                    reasonForBeingFavorite: editedReason,
                },
            });

            setPackages(
                packages.map((pkg) =>
                    pkg.id === selectedPackage.id ? { ...pkg, reasonForBeingFavorite: editedReason } : pkg,
                ),
            );

            setShowEditDialog(false);
            toast({
                title: 'Package updated',
                description: 'Your changes have been saved',
            });
        } catch {
            toast({
                variant: 'destructive',
                title: 'Error updating package',
                description: 'Please try again later',
            });
        }
    };

    const handleLogout = async () => {
        try {
            await ky.get('/api/logout');
            router.push('/login');
        } catch {
            toast({
                variant: 'destructive',
                title: 'Error logging out',
                description: 'Please try again later',
            });
        }
    };

    return (
        <main className="p-6 max-w-7xl mx-auto w-full">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                    <PackageIcon className="w-6 h-6" />
                    <h1 className="text-3xl font-bold">Favorite Packages</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild>
                        <Link href="/add">Add Package</Link>
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleLogout}>
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="w-6 h-6 animate-spin" />
                </div>
            ) : packages.length === 0 ? (
                <Card className="text-center p-6">
                    <CardContent>
                        <p className="text-muted-foreground">No favorite packages yet. Add some to get started!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.map((pkg) => (
                        <Card key={pkg.name} className="relative">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Badge variant="outline" className="mb-2">
                                            {pkg.version}
                                        </Badge>
                                        <h2 className="text-xl font-semibold">{pkg.name}</h2>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setSelectedPackage(pkg);
                                                setShowInfoDialog(true);
                                            }}
                                        >
                                            <Info className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setSelectedPackage(pkg);
                                                setEditedReason(pkg.reasonForBeingFavorite);
                                                setShowEditDialog(true);
                                            }}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setSelectedPackage(pkg);
                                                setShowDeleteDialog(true);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">{pkg.description}</p>
                                <p className="text-sm">
                                    <span className="font-medium">Why it&apos;s favorite: </span>
                                    {pkg.reasonForBeingFavorite}
                                </p>
                            </CardContent>
                            <CardFooter>
                                <p className="text-sm text-muted-foreground">
                                    Added on {new Date(pkg.date).toLocaleDateString()}
                                </p>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Package</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedPackage?.name}? This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (selectedPackage) {
                                    handleDelete(selectedPackage.id);
                                    setShowDeleteDialog(false);
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Package</DialogTitle>
                        <DialogDescription>
                            Update why {selectedPackage?.name} is your favorite package
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={editedReason}
                        onChange={(e) => setEditedReason(e.target.value)}
                        placeholder="Why is this package your favorite?"
                        className="min-h-[100px]"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                            Cancel
                        </Button>
                        <Button disabled={deleted} onClick={handleEdit}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Package Details</DialogTitle>
                    </DialogHeader>
                    {selectedPackage && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium">Package Name</h3>
                                <p className="text-sm text-muted-foreground">{selectedPackage.name}</p>
                            </div>
                            <div>
                                <h3 className="font-medium">Version</h3>
                                <p className="text-sm text-muted-foreground">{selectedPackage.version}</p>
                            </div>
                            <div>
                                <h3 className="font-medium">Description</h3>
                                <p className="text-sm text-muted-foreground">{selectedPackage.description}</p>
                            </div>
                            <div>
                                <h3 className="font-medium">Added On</h3>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(selectedPackage.date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </main>
    );
}
