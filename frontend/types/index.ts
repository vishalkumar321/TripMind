export interface User {
    id: string;
    email: string;
    name?: string;
}

export interface TripPlan {
    id: string;
    destination: string;
    startDate: string;
    endDate: string;
}
