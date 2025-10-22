export interface Place {
    id: string;
    name: string;
    address: string;
    latitude: string;
    longitude: string;
    image: string | null;
    rating: number | null;
    createdAt: string;
    updatedAt: string;
    description: string | null;
    city: string | null;
}