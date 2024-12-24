import { Package } from '@/model/package';
import { PackageModel } from '@/server/db';

export const fetchPackagesByUser = async (user: string) => {
    const packages = await PackageModel.find({ user });
    return packages;
};

export const createPackage = async (npmPackage: Package) => {
    const newPackage = await PackageModel.create(npmPackage);
    return newPackage;
};

export const deletePackage = async (id: string) => {
    await PackageModel.findOneAndDelete({ id });
};

export const updatePackage = async (id: string, reasonForBeingFavorite: string) => {
    const npmPackage = await PackageModel.findOne({ id });
    npmPackage.reasonForBeingFavorite = reasonForBeingFavorite;
    await npmPackage.save();
};
