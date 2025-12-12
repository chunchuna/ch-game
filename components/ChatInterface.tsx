import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage }) => {
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus on Enter
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (!isTyping) {
          setIsTyping(true);
          setTimeout(() => inputRef.current?.focus(), 10);
        } else {
          // If already typing and empty, maybe close? 
          // keeping it simple: Enter sends or does nothing if empty, remains focused
        }
      }
      if (e.key === 'Escape') {
        setIsTyping(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isTyping]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText("");
    }
    // Optional: Close chat after sending? Let's keep it open for quick chatting
    // setIsTyping(false); 
  };

  return (
    <div className="absolute bottom-4 left-4 z-50 flex flex-col items-start w-[350px] max-w-full">
      
      {/* Chat History */}
      <div 
        ref={scrollRef}
        className="w-full h-48 mb-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 bg-gradient-to-t from-black/80 to-transparent p-2 rounded-lg mask-image-linear-gradient"
        style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%)' }}
      >
        {messages.map((msg) => (
           <div key={msg.id} className="mb-1 text-sm shadow-black drop-shadow-md">
             <span className="font-bold text-yellow-400">{msg.senderName}:</span>
             <span className="text-white ml-1">{msg.text}</span>
           </div>
        ))}
      </div>

      {/* Input Area */}
      <div className={`w-full transition-opacity duration-200 ${isTyping ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>
        {isTyping ? (
          <div className="flex w-full bg-black/70 rounded-full border border-white/30 backdrop-blur">
             <input
               ref={inputRef}
               type="text"
               className="bg-transparent text-white px-4 py-2 w-full focus:outline-none rounded-full"
               placeholder="Type a message..."
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               onKeyDown={(e) => {
                 if (e.key === 'Enter') handleSend();
               }}
               onBlur={() => {
                 // Delay slightly so click on send button works
                 setTimeout(() => {
                   if (!inputText) setIsTyping(false);
                 }, 200);
               }}
             />
             <button 
               onClick={handleSend}
               className="text-yellow-400 font-bold px-4 hover:text-white"
             >
               SEND
             </button>
          </div>
        ) : (
          <div 
            className="text-white/50 text-xs italic bg-black/40 px-3 py-1 rounded-full cursor-pointer hover:bg-black/60 hover:text-white"
            onClick={() => {
               setIsTyping(true);
               setTimeout(() => inputRef.current?.focus(), 10);
            }}
          >
            Press <span className="font-bold border border-white/30 rounded px-1">Enter</span> to chat
          </div>
        )}
      </div>
    </div>
  );
};