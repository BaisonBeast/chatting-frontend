export interface Message {
    senderName: string;
    message: string;
    isDeleted: boolean;
    isEdited: boolean;
    like: number;
    id: string;
    createdAt: string;
}

export type Messages = Message[];