export interface Place {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    image: string | null;
    rating: number | null;
    createdAt: string;
    updatedAt: string;
    description: string | null;
    city: string | null;
}