// 'use client';

// import React, { useRef, useEffect, useState } from 'react';
// import {
//   Paperclip,
//   Mic,
//   AudioLines,
//   ChevronDown,
//   RotateCcw,
//   Volume2,
//   MessageSquare,
//   Copy,
//   Share2,
//   ThumbsUp,
//   ThumbsDown,
//   MoreHorizontal,
//   SendHorizontal,
// } from 'lucide-react';
// import { motion } from 'motion/react';
// import ReactMarkdown from 'react-markdown';
// import { useChat } from '@ai-sdk/react';

// function cn(...classes: Array<string | false | null | undefined>) {
//   return classes.filter(Boolean).join(' ');
// }

// export default function Page() {
//   const [inputValue, setInputValue] = useState('');
//   const [isRecording, setIsRecording] = useState(false);
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);

//   const { messages, sendMessage, status } = useChat();
//   const isThinking = status === 'submitted' || status === 'streaming';

//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = 'auto';
//       textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
//     }
//   }, [inputValue]);

//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//     }
//   }, [messages, isThinking]);

//   const handleSendMessage = async () => {
//     if (!inputValue.trim() || isThinking) return;

//     const text = inputValue.trim();
//     setInputValue('');

//     await sendMessage({
//       text,
//     });
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   const copyToClipboard = async (text: string) => {
//     try {
//       await navigator.clipboard.writeText(text);
//     } catch (error) {
//       console.error('Copy failed:', error);
//     }
//   };

//   const getMessageText = (message: any) => {
//     if (!message.parts) return '';
//     return message.parts
//       .filter((part: any) => part.type === 'text')
//       .map((part: any) => part.text)
//       .join('');
//   };

//   return (
//     <div className="flex flex-col h-screen bg-black text-white font-sans selection:bg-white/20 overflow-hidden">
//       <div
//         className="flex-1 overflow-y-auto px-4 md:px-0 scroll-smooth relative"
//         ref={scrollRef}
//         style={{
//           backgroundImage: 'url(/bg.png)',
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//           backgroundRepeat: 'no-repeat',
//           backgroundAttachment: 'fixed',
//         }}
//       >
//         <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]" />

//         <div className="relative max-w-3xl mx-auto py-12 space-y-12">
//           {messages.length === 0 && (
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4"
//             >
//               <h1 className="text-4xl font-semibold tracking-tight text-white/90">
//                 How can I help you today?
//               </h1>
//               <p className="text-white/40 max-w-md">
//                 Ask anything, from complex analysis to creative writing.
//               </p>
//             </motion.div>
//           )}

//           {messages.map((message) => {
//             const content = getMessageText(message);

//             return (
//               <div key={message.id} className="space-y-4">
//                 {message.role === 'user' ? (
//                   <div className="flex justify-end items-start gap-3">
//                     <div className="bg-[#1a1a1a]/90 backdrop-blur-md px-6 py-4 rounded-[28px] max-w-[80%] text-[15px] leading-relaxed text-white/90 shadow-sm border border-white/5">
//                       {content}
//                     </div>
//                     <div className="flex-shrink-0">
//                       <img
//                         src="/user.png"
//                         alt="User"
//                         className="w-10 h-10 rounded-full border border-white/10 bg-[#1a1a1a] object-cover"
//                       />
//                       <div className="text-[10px] text-center mt-1 text-white/40 font-medium">
//                         You
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="flex items-start gap-3">
//                     <div className="flex-shrink-0">
//                       <img
//                         src="/bot.png"
//                         alt="Bot"
//                         className="w-10 h-10 rounded-full border border-white/10 bg-[#1a1a1a] object-cover"
//                       />
//                       <div className="text-[10px] text-center mt-1 text-white/40 font-medium">
//                         Bot
//                       </div>
//                     </div>
//                     <div className="space-y-4 flex-1">
//                       <div className="text-[16px] leading-relaxed text-white/90 prose prose-invert max-w-none bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
//                         <ReactMarkdown>{content}</ReactMarkdown>
//                       </div>

//                       <div className="flex items-center gap-4 text-white/30">
//                         <button className="hover:text-white transition-colors">
//                           <RotateCcw size={16} />
//                         </button>
//                         <button className="hover:text-white transition-colors">
//                           <Volume2 size={16} />
//                         </button>
//                         <button className="hover:text-white transition-colors">
//                           <MessageSquare size={16} />
//                         </button>
//                         <button
//                           onClick={() => copyToClipboard(content)}
//                           className="hover:text-white transition-colors"
//                         >
//                           <Copy size={16} />
//                         </button>
//                         <button className="hover:text-white transition-colors">
//                           <Share2 size={16} />
//                         </button>
//                         <button className="hover:text-white transition-colors">
//                           <ThumbsUp size={16} />
//                         </button>
//                         <button className="hover:text-white transition-colors">
//                           <ThumbsDown size={16} />
//                         </button>
//                         <button className="hover:text-white transition-colors">
//                           <MoreHorizontal size={16} />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             );
//           })}

//           {isThinking && (
//             <div className="flex items-center gap-3">
//               <img
//                 src="/bot.png"
//                 alt="Bot"
//                 className="w-10 h-10 rounded-full border border-white/10 bg-[#1a1a1a] object-cover"
//               />
//               <div className="flex items-center gap-2 text-white/40 text-sm animate-pulse">
//                 <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
//                 <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
//                 <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
//                 <span className="ml-2">Thinking...</span>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="p-4 md:pb-8 bg-black/40 backdrop-blur-md border-t border-white/5">
//         <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
//           <div className="w-full bg-[#121212] rounded-[32px] p-2 flex items-center gap-2 border border-white/5 shadow-2xl">
//             <button className="p-3 text-white/40 hover:text-white transition-colors">
//               <Paperclip size={20} />
//             </button>

//             <textarea
//               ref={textareaRef}
//               value={inputValue}
//               onChange={(e) => setInputValue(e.target.value)}
//               onKeyDown={handleKeyDown}
//               placeholder="Ask anything"
//               rows={1}
//               className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] py-3 resize-none max-h-32 placeholder:text-white/20 outline-none"
//             />

//             <div className="flex items-center gap-1 pr-2">
//               <button className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-white/40 hover:bg-white/5 transition-colors">
//                 Auto <ChevronDown size={14} />
//               </button>

//               <button
//                 onClick={() => setIsRecording(!isRecording)}
//                 className={cn(
//                   'p-2.5 rounded-full transition-all',
//                   isRecording ? 'bg-red-500/20 text-red-500' : 'text-white/40 hover:text-white'
//                 )}
//               >
//                 <Mic size={20} />
//               </button>

//               <button
//                 onClick={handleSendMessage}
//                 disabled={isThinking}
//                 className="p-2.5 bg-white text-black rounded-full hover:bg-white/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
//               >
//                 {inputValue.trim() ? <SendHorizontal size={20} /> : <AudioLines size={20} />}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Paperclip,
  Mic,
  AudioLines,
  ChevronDown,
  RotateCcw,
  Volume2,
  MessageSquare,
  Copy,
  Share2,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  SendHorizontal,
} from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isThinking) return;

    const text = inputValue.trim();

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!res.ok) {
        throw new Error('API request failed');
      }

      const data = await res.json();

      const botMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content || 'Mock bot did not return content.',
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Send message failed:', error);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Có lỗi khi gọi mock API.',
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans selection:bg-white/20 overflow-hidden">
      <div
        className="flex-1 overflow-y-auto px-4 md:px-0 scroll-smooth relative"
        ref={scrollRef}
        style={{
          backgroundImage: 'url(/bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]" />

        <div className="relative max-w-3xl mx-auto py-12 space-y-12">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4"
            >
              <h1 className="text-4xl font-semibold tracking-tight text-white/90">
                How can I help you today?
              </h1>
              <p className="text-white/40 max-w-md">
                Ask anything, from complex analysis to creative writing.
              </p>
            </motion.div>
          )}

          {messages.map((message) => (
            <div key={message.id} className="space-y-4">
              {message.role === 'user' ? (
                <div className="flex justify-end items-start gap-3">
                  <div className="bg-[#1a1a1a]/90 backdrop-blur-md px-6 py-4 rounded-[28px] max-w-[80%] text-[15px] leading-relaxed text-white/90 shadow-sm border border-white/5">
                    {message.content}
                  </div>
                  <div className="flex-shrink-0">
                    <img
                      src="/user.png"
                      alt="User"
                      className="w-10 h-10 rounded-full border border-white/10 bg-[#1a1a1a] object-cover"
                    />
                    <div className="text-[10px] text-center mt-1 text-white/40 font-medium">
                      You
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <img
                      src="/bot.png"
                      alt="Bot"
                      className="w-10 h-10 rounded-full border border-white/10 bg-[#1a1a1a] object-cover"
                    />
                    <div className="text-[10px] text-center mt-1 text-white/40 font-medium">
                      Bot
                    </div>
                  </div>
                  <div className="space-y-4 flex-1">
                    <div className="text-[16px] leading-relaxed text-white/90 prose prose-invert max-w-none bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>

                    <div className="flex items-center gap-4 text-white/30">
                      <button className="hover:text-white transition-colors">
                        <RotateCcw size={16} />
                      </button>
                      <button className="hover:text-white transition-colors">
                        <Volume2 size={16} />
                      </button>
                      <button className="hover:text-white transition-colors">
                        <MessageSquare size={16} />
                      </button>
                      <button
                        onClick={() => copyToClipboard(message.content)}
                        className="hover:text-white transition-colors"
                      >
                        <Copy size={16} />
                      </button>
                      <button className="hover:text-white transition-colors">
                        <Share2 size={16} />
                      </button>
                      <button className="hover:text-white transition-colors">
                        <ThumbsUp size={16} />
                      </button>
                      <button className="hover:text-white transition-colors">
                        <ThumbsDown size={16} />
                      </button>
                      <button className="hover:text-white transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-3">
              <img
                src="/bot.png"
                alt="Bot"
                className="w-10 h-10 rounded-full border border-white/10 bg-[#1a1a1a] object-cover"
              />
              <div className="flex items-center gap-2 text-white/40 text-sm animate-pulse">
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="ml-2">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 md:pb-8 bg-black/40 backdrop-blur-md border-t border-white/5">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
          <div className="w-full bg-[#121212] rounded-[32px] p-2 flex items-center gap-2 border border-white/5 shadow-2xl">
            <button className="p-3 text-white/40 hover:text-white transition-colors">
              <Paperclip size={20} />
            </button>

            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything"
              rows={1}
              className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] py-3 resize-none max-h-32 placeholder:text-white/20 outline-none"
            />

            <div className="flex items-center gap-1 pr-2">
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-white/40 hover:bg-white/5 transition-colors">
                Auto <ChevronDown size={14} />
              </button>

              <button
                onClick={() => setIsRecording(!isRecording)}
                className={cn(
                  'p-2.5 rounded-full transition-all',
                  isRecording ? 'bg-red-500/20 text-red-500' : 'text-white/40 hover:text-white'
                )}
              >
                <Mic size={20} />
              </button>

              <button
                onClick={handleSendMessage}
                disabled={isThinking}
                className="p-2.5 bg-white text-black rounded-full hover:bg-white/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {inputValue.trim() ? <SendHorizontal size={20} /> : <AudioLines size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}