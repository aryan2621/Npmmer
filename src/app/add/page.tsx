'use client';

import React, { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Package as PackageIcon, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ky from 'ky';
import { Package } from '@/model/package';
import { nanoid } from 'nanoid';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface NpmPackage {
    downloads: { monthly: number; weekly: number };
    dependents: number;
    updated: string;
    searchScore: number;
    package: {
        name: string;
        keywords: string[];
        version: string;
        description: string;
        publisher: { email: string; username: string };
        maintainers: Array<{ email: string; username: string }>;
        license: string;
        date: string;
        links: { homepage: string; repository: string; bugs: string; npm: string };
    };
}

interface SearchResponse {
    objects: Array<NpmPackage>;
    total: number;
    time: string;
}

export default function Add() {
    const [searchTerm, setSearchTerm] = useState('');
    const [packages, setPackages] = useState<NpmPackage[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<NpmPackage | null>(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);

    const { toast } = useToast();

    const debouncedSearch = useCallback(
        debounce(async (term: string) => {
            if (!term) {
                setPackages([]);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`https://registry.npmjs.org/-/v1/search?text=${term}`);
                const data: SearchResponse = await response.json();
                setPackages(data.objects);
            } catch {
                toast({
                    variant: 'destructive',
                    title: 'Search failed',
                    description: 'Unable to fetch packages. Please try again.',
                });
                setPackages([]);
            } finally {
                setLoading(false);
            }
        }, 500),
        [],
    );

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const term = event.target.value;
        setSearchTerm(term);
        debouncedSearch(term);
    };

    const handlePackageSelect = (pkg: NpmPackage) => {
        setSelectedPackage(pkg);
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedPackage) return;

        try {
            setPosting(true);
            const npmPackage = new Package(
                nanoid(),
                selectedPackage.package.name,
                selectedPackage.package.version,
                selectedPackage.package.description,
                notes,
                selectedPackage.package.date,
            );

            await ky.post('/api/package', { json: npmPackage });
            toast({ title: 'Success', description: 'Package added to favorites' });
        } catch {
            toast({
                variant: 'destructive',
                title: 'Save failed',
                description: 'Unable to save package. Please try again.',
            });
        } finally {
            setPosting(false);
        }
    };

    return (
        <main className="container mx-auto p-6 max-w-7xl">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <PackageIcon className="w-6 h-6" />
                    <h1 className="text-3xl font-bold">Add Package</h1>
                </div>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search NPM packages..."
                    className="pl-10"
                />
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="w-6 h-6 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Search Results</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                                {packages.map((pkg) => (
                                    <div
                                        key={pkg.package.name}
                                        onClick={() => handlePackageSelect(pkg)}
                                        className={`p-4 hover:bg-muted cursor-pointer border-b last:border-b-0 transition-colors ${
                                            selectedPackage?.package.name === pkg.package.name ? 'bg-muted' : ''
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{pkg.package.name}</h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {pkg.package.description}
                                                </p>
                                            </div>
                                            <Badge variant="outline">v{pkg.package.version}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {selectedPackage && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{selectedPackage.package.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <p className="text-muted-foreground">{selectedPackage.package.description}</p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium">Version</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedPackage.package.version}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">License</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedPackage.package.license}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Weekly Downloads</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedPackage.downloads.weekly.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Last Updated</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(selectedPackage.package.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {selectedPackage.package.links.homepage && (
                                        <Button variant="outline" className="w-full" asChild>
                                            <a
                                                href={selectedPackage.package.links.homepage}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                View Homepage
                                            </a>
                                        </Button>
                                    )}
                                    <Button variant="outline" className="w-full" asChild>
                                        <a
                                            href={selectedPackage.package.links.npm}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View on NPM
                                        </a>
                                    </Button>
                                </div>

                                <form onSubmit={handleSave} className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium mb-2">Why do you like this package?</h3>
                                        <Textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Share your thoughts about this package..."
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                    <Button
                                        className="w-full"
                                        type="submit"
                                        disabled={posting || !notes || notes.length < 10}
                                    >
                                        {posting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                Saving...
                                            </>
                                        ) : (
                                            'Add to Favorites'
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </main>
    );
}
