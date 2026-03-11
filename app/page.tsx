'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Mic,
  AudioLines,
  RotateCcw,
  Copy,
  Share2,
  MoreHorizontal,
  SendHorizontal,
  Volume2,
  VolumeX,
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

type SpeechRecognitionType = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function BackgroundParticles({ count = 22 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => {
    const left = (i * 4.7) % 100;
    const size = 4 + (i % 3) * 2;
    const duration = 10 + (i % 5) * 2.5;
    const delay = (i % 7) * 1.3;
    const drift = 12 + (i % 4) * 6;
    const opacity = 0.16 + (i % 4) * 0.05;

    return {
      id: i,
      left,
      size,
      duration,
      delay,
      drift,
      opacity,
    };
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute bottom-[-30px] rounded-full animate-firefly-float"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            ['--drift' as string]: `${p.drift}px`,
            background: 'rgba(255,255,255,0.95)',
            boxShadow: `
              0 0 6px rgba(255,255,255,0.95),
              0 0 14px rgba(134,239,172,0.85),
              0 0 28px rgba(74,222,128,0.45),
              0 0 42px rgba(34,197,94,0.20)
            `,
          }}
        />
      ))}
    </div>
  );
}

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognitionType;
    SpeechRecognition?: new () => SpeechRecognitionType;
  }
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Browser does not support Speech Recognition');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      let transcript = '';

      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setInputValue(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.01;
    audio.loop = true;

    const startMusic = async () => {
      try {
        await audio.play();
        setIsMusicPlaying(true);
        cleanup();
      } catch (error) {
        console.warn('Autoplay bị chặn, chờ tương tác đầu tiên:', error);
      }
    };

    const startMusicOnce = async () => {
      try {
        await audio.play();
        setIsMusicPlaying(true);
      } catch (error) {
        console.warn('Không thể phát nhạc sau tương tác:', error);
      }
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener('click', startMusicOnce);
      window.removeEventListener('keydown', startMusicOnce);
      window.removeEventListener('touchstart', startMusicOnce);
    };

    startMusic();

    window.addEventListener('click', startMusicOnce, { once: true });
    window.addEventListener('keydown', startMusicOnce, { once: true });
    window.addEventListener('touchstart', startMusicOnce, { once: true });

    return cleanup;
  }, []);

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isMusicPlaying) {
        audio.pause();
        setIsMusicPlaying(false);
      } else {
        await audio.play();
        setIsMusicPlaying(true);
      }
    } catch (error) {
      console.error('Cannot play audio:', error);
      alert('Trình duyệt đang chặn tự phát nhạc. Hãy bấm lại nút nhạc.');
    }
  };

  const handleMicClick = () => {
    const recognition = recognitionRef.current;

    if (!recognition) {
      alert('Trình duyệt của bạn chưa hỗ trợ voice input.');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
      return;
    }

    try {
      setIsRecording(true);
      recognition.start();
    } catch (error) {
      console.error('Cannot start microphone:', error);
      setIsRecording(false);
    }
  };

  const fetchAssistantReply = async (requestMessages: Message[]) => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: requestMessages,
      }),
    });

    const rawText = await res.text();

    console.log('API status:', res.status);
    console.log('API raw response:', rawText);

    if (!res.ok) {
      throw new Error(rawText || 'API request failed');
    }

    const data = JSON.parse(rawText);

    const cleaned = (data.content || '')
      .replace(/\[\[\d+\]\]\[doc_\d+\]/g, '')
      .replace(/\[\[\d+\]\]/g, '')
      .replace(/\[doc_\d+\]/g, '')
      .replace(/##\s*📚?\s*References[\s\S]*/i, '')
      .replace(/References[\s\S]*/i, '')
      .trim();

    return cleaned;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isThinking) return;

    const text = inputValue.trim();

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInputValue('');
    setIsThinking(true);

    try {
      const cleaned = await fetchAssistantReply(nextMessages);

      const botMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: cleaned,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: error instanceof Error ? error.message : 'Request failed',
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleRegenerate = async () => {
    if (isThinking || messages.length === 0) return;

    const lastUserIndex = [...messages]
      .map((m, i) => ({ ...m, index: i }))
      .reverse()
      .find((m) => m.role === 'user')?.index;

    if (lastUserIndex === undefined) return;

    const requestMessages = messages.slice(0, lastUserIndex + 1);

    setMessages(requestMessages);
    setIsThinking(true);

    try {
      const cleaned = await fetchAssistantReply(requestMessages);

      const botMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: cleaned,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: error instanceof Error ? error.message : 'Regenerate failed',
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

  const lastAssistantIndex = [...messages]
    .map((m, i) => ({ ...m, index: i }))
    .reverse()
    .find((m) => m.role === 'assistant')?.index;

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans selection:bg-white/20 overflow-hidden">
      <audio ref={audioRef} src="/bg-music.mp3" preload="auto" />

      <div className="relative flex-1 overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          }}
        >
          <BackgroundParticles count={30} />
          <div className="absolute inset-0 z-[1] bg-black/10 backdrop-blur-[1px]" />
        </div>

        <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md text-sm text-white/40 border border-white/10">
          Created by Tiadler
        </div>

        <button
          onClick={toggleMusic}
          className="absolute top-4 right-4 z-20 p-3 rounded-full bg-black/30 backdrop-blur-md text-white/70 border border-white/10 hover:text-white hover:bg-black/40 transition-colors"
          title={isMusicPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
        >
          {isMusicPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        <div
          className="relative z-10 h-full overflow-y-auto px-4 md:px-0 scroll-smooth"
          ref={scrollRef}
        >
          <div className="max-w-3xl mx-auto py-12 space-y-12">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4"
              >
                <h1 className="text-4xl font-semibold tracking-tight text-white/90">
                  Let the Ritual begin 🔮
                </h1>
                <p className="text-white/40 max-w-md">
                  Meow, mortal! Siggy here - what foolish query disturbs my zoomies?
                </p>
              </motion.div>
            )}

            {messages.map((message, index) => (
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
                        Siggy
                      </div>
                    </div>

                    <div className="space-y-4 flex-1">
                      <div className="text-[16px] leading-relaxed text-white/90 prose prose-invert max-w-none bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                        <ReactMarkdown
                          components={{
                            em: ({ children }) => (
                              <span className="block text-xs text-white/50 italic my-2">
                                {children}
                              </span>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>

                      <div className="flex items-center gap-4 text-white/30">
                        <button
                          onClick={handleRegenerate}
                          disabled={isThinking || index !== lastAssistantIndex}
                          className="hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Regenerate latest response"
                        >
                          <RotateCcw size={16} />
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

                  <span className="ml-2">The ceremony is in progress....</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 md:pb-8 bg-black/35 backdrop-blur-md border-t border-emerald-400/10">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
          <div
            className="
              w-full
              relative
              overflow-hidden
              rounded-[28px]
              p-2
              flex items-center gap-2

              bg-gradient-to-b from-[#141414] via-[#0c0c0c] to-[#050505]

              border border-emerald-400/20
              shadow-[0_0_18px_rgba(16,185,129,0.14),0_0_40px_rgba(16,185,129,0.06),inset_0_0_28px_rgba(0,0,0,0.95)]

              backdrop-blur-xl
            "
          >
            <div
              className="
                absolute inset-0 rounded-[28px] pointer-events-none
                bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12),transparent_62%)]
                opacity-80 blur-md
              "
            />
            <div
              className="
                absolute inset-[1px] rounded-[27px] pointer-events-none
                border border-emerald-300/8
              "
            />

            <button className="relative z-10 p-3 rounded-full hover:bg-emerald-400/5 transition-colors">
              <img
                src="/paperclip.png"
                alt="Attach"
                className="w-5 h-5 object-contain opacity-80"
              />
            </button>

            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ignite the flames, mortal ..."
              rows={1}
              className="
                relative z-10
                flex-1
                bg-transparent
                border-none
                focus:ring-0
                text-[15px]
                text-emerald-50/90
                py-3
                resize-none
                max-h-32
                placeholder:text-emerald-100/20
                outline-none
                tracking-[0.02em]
              "
            />

            <div className="relative z-10 flex items-center gap-1 pr-2">
              <button
                onClick={handleMicClick}
                className={cn(
                  'p-2.5 rounded-full transition-all',
                  isRecording
                    ? 'bg-emerald-500/20 text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.35)] animate-pulse'
                    : 'text-emerald-200/45 hover:text-emerald-100 hover:bg-emerald-400/5'
                )}
              >
                <Mic size={20} />
              </button>

              <button
                onClick={handleSendMessage}
                disabled={isThinking}
                className="
                  p-2.5
                  rounded-full
                  bg-gradient-to-b from-emerald-300 to-emerald-500
                  text-black
                  shadow-[0_0_14px_rgba(16,185,129,0.42)]
                  hover:shadow-[0_0_20px_rgba(16,185,129,0.65)]
                  hover:from-emerald-200 hover:to-emerald-400
                  transition-all
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {inputValue.trim() ? (
                  <SendHorizontal size={20} />
                ) : (
                  <AudioLines size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}