export interface SingleChat {
    id: string;
    createdAt: string;
    participant: Participient;
    updatedAt: string;
}

interface Participient {
    username: string;
    profilePic: string;
}