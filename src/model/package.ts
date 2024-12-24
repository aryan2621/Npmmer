export class Package {
    id: string;
    name: string;
    version: string;
    description: string;
    reasonForBeingFavorite: string;
    date: string;
    user?: string;

    constructor(
        id: string,
        name: string,
        version: string,
        description: string,
        reasonForBeingFavorite: string,
        date: string,
        user?: string,
    ) {
        this.id = id;
        this.name = name;
        this.version = version;
        this.description = description;
        this.reasonForBeingFavorite = reasonForBeingFavorite;
        this.date = date;
        this.user = user;
    }
}
