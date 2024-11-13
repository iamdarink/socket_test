export interface ChatMessage {
    id: string;
    text: string;
    timestamp: Date;
    sender: 'user' | 'server';
}