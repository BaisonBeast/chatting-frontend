export interface Message {
    senderEmail: string;
    message: string;
    messageType: string;
    isDeleted: boolean;
    isEdited: boolean;
    like: [string];
    _id: string;
    createdAt: string;
    updatedAt: string;
}

export type Messages = Message[];