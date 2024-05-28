import React, { useState, ChangeEvent, KeyboardEvent } from 'react';

interface ChatPdf {
  documentId: string;
}

interface ChatMessage {
  user: string;
  bot: string;
}

const Chat: React.FC<ChatPdf> = ({ documentId }) => {
  const [message, setMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setIsSending(true);
    const userMessage = message;
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          message: userMessage,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let botMessage = '';

      if (reader) {
        const processStream = async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            botMessage += decoder.decode(value, { stream: true });
            setChatHistory((prev) => {
              const updatedHistory = [...prev];
              const lastIndex = updatedHistory.length - 1;
              if (lastIndex >= 0 && updatedHistory[lastIndex].user === userMessage) {
                updatedHistory[lastIndex].bot = botMessage;
              } else {
                updatedHistory.push({ user: userMessage, bot: botMessage });
              }
              return updatedHistory;
            });
          }
          setIsSending(false);
        };

        processStream();
      }
    } catch (error) {
      console.error('Error during sending message:', error);
      setIsSending(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col items-center pt-6 min-h-screen bg-gray-950 text-white">
      <div className="w-full max-w-5xl px-6">
        <div className="h-96 bg-gray-800 pt-2 p-4 rounded-lg overflow-y-auto mb-4">
          <div className='mb-4'>
            <p className="text-green-400 mb-1">Assistant:</p>
            <p className="bg-gray-700 p-2 rounded-md whitespace-pre-wrap">Your document has been scanned and I'm ready to assist you.</p>
          </div>
          {chatHistory.map((chat, index) => (
            <div key={index} className="mb-4">
              <p className="text-blue-400 mb-1">You:</p>
              <p className="bg-gray-700 p-2 rounded-md mb-2">{chat.user}</p>
              
                <p className="text-green-400 mb-1">Assistant:</p>
                <p className="bg-gray-700 p-2 rounded-md whitespace-pre-wrap">{chat.bot}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center">
          <input
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            className="flex-1 p-2 rounded-l-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            onClick={handleSendMessage}
            disabled={isSending}
            className="p-2 rounded-r-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 ml-2"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;

