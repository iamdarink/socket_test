'use client';

import { useState, useEffect } from 'react';
import io from 'socket.io-client';

export default function Home() {
  const [socket, setSocket] = useState<any>(null);
  const [messages, setMessages] = useState<Array<{ text: string, type: 'sent' | 'received' | 'broadcast', isComplete: boolean }>>([]);
  const [input, setInput] = useState<string>("");
  const [isComplete, setisComplete] = useState(false);

  useEffect(() => {
    console.log('Updated messages:', messages);
  }, [messages]);


  useEffect(() => {
    // const savedMessages = localStorage.getItem('chatMessages');
    // if (savedMessages) {
    //   setMessages(JSON.parse(savedMessages));
    // }
    console.log('messages:', messages);

    const socketConnection = io("http://192.168.1.177:3000");
    setSocket(socketConnection);


    socketConnection.on('receiveMessage', (msg: string) => {
      const receiveMessage = msg.replace('Server received your message: ', '').replace(/^"|"$/g, '');



      setMessages(prevMessages => {
        const lastSentMessage = prevMessages.filter(message => message.type === 'sent').pop();

        console.log('receiveMessage:', receiveMessage);
        console.log('lastSentMessage:', lastSentMessage);

        if (receiveMessage === lastSentMessage?.text) {
          const updatedMessages = prevMessages.map(message =>
            message === lastSentMessage
              ? { ...message, isComplete: true }
              : message
          );
          return updatedMessages;
        }

        return prevMessages;
      });
    });

    socketConnection.on('broadcastMessage', (msg: string) => {
      const broadcastMessage = msg.replace('New message from Website: ', '').replace(/^"|"$/g, '');
      console.log("broadcastMessage: ", msg);
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages, { text: broadcastMessage, type: 'broadcast' as const, isComplete: true }];
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

        const updatedMessages = [...prevMessages, { text: input, type: 'sent' as const, isComplete: false }];
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
          className="flex-1 p-2 rounded-l-lg border border-gray-300 text-black"
        />
        <button
          onClick={sendMessage}
          className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
        >
          Send
        </button>
      </div>
      <div>
        {messages.length > 0 && (
          <span>{messages[messages.length - 1].isComplete ? "Complete" : "Not Complete"}</span>
        )}
      </div>

    </div>
  );
}
