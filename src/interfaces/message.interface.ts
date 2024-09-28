export interface Message {
    senderName: string;
    message: string;
    time: Date;
}

export interface Messages {
    name: string;
    messages: Message[]
}