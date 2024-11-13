'use client';

import { useState, useEffect } from 'react';
import io from 'socket.io-client';

export default function Home() {
  const [socket, setSocket] = useState<any>(null);
  const [messages, setMessages] = useState<Array<{text: string, type: 'sent' | 'received'}>>([]);
  const [input, setInput] = useState<string>("");

  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }

    const socketConnection = io("http://192.168.1.177:3000");
    setSocket(socketConnection);

    socketConnection.on('receiveMessage', (msg: string) => {
      const actualMessage = msg.replace('Server received your message: ', '').replace(/^"|"$/g, '');
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages, { text: actualMessage, type: 'received' as const }];
        localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
        return updatedMessages;
      });
    });

    socketConnection.on('broadcastMessage', (msg: { sender: string, message: string, room: string }) => {
      console.log("msg: ", msg.message);
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages, { text: msg.message, type: 'received' as const }];
        localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
        return updatedMessages;
      });
    });

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (input.trim() && socket?.connected) {
      socket.emit('sendMessage', input);
      setMessages(prevMessages => {

        const updatedMessages = [...prevMessages, { text: input, type: 'sent' as const }];
        localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
        return updatedMessages;
      });
      setInput("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-teal-600">
      <h2 className="text-2xl mb-4 text-white">Chat App</h2>
      <div className="w-80 h-96 bg-white rounded-lg p-4 overflow-y-scroll mb-4">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`
              p-2 rounded-lg my-1 
              ${msg.type === 'sent' 
                ? 'bg-blue-500 text-white ml-auto' 
                : 'bg-gray-200 text-gray-800'
              }
              max-w-[80%]
            `}
          >
            <div>{msg.text}</div>
          </div>
        ))}
      </div>
      <div className="flex w-80">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Send your message..."
          className="flex-1 p-2 rounded-l-lg border border-gray-300"
        />
        <button
          onClick={sendMessage}
          className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}
