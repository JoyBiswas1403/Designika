/**********************************************************************************
 * Copyright (c) 2026 Joy Biswas. All rights reserved.
 **********************************************************************************/

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';
import api from '../../lib/api';
import { useDesignStore } from '../../store/design';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    role: 'user' | 'model';
    content: string;
}

export const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: "Hi! I'm your AI Interior Consultant. Describe your room or ask for design advice!" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [isOpen]);

    const { selectedImage, style, roomType } = useDesignStore()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setIsLoading(true);

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));

            // Prepare Context (Vision + Style)
            const context: any = {
                style: style || 'General',
                room: roomType || 'Room'
            }

            if (selectedImage) {
                context.image = selectedImage;
            }

            const { data } = await api.post('/chat', {
                message: userMessage,
                history,
                context
            });

            setMessages(prev => [...prev, { role: 'model', content: data.reply }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting to my design brain right now. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100000] flex flex-col items-end font-sans">
            {/* Chat Body */}
            {isOpen && (
                <div className="mb-4 w-[350px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[600px] animate-in slide-in-from-bottom-5 fade-in duration-300 origin-bottom-right ring-1 ring-black/5">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 dark:from-zinc-950 dark:to-zinc-900 p-5 flex justify-between items-center relative overflow-hidden">

                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-purple-500/20 opacity-50"></div>
                        <div className="flex items-center gap-3 relative z-10 text-white">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <Sparkles size={20} className="text-white animate-pulse" />
                            </div>
                            <div>
                                <h3 className="font-serif font-bold text-lg tracking-wide leading-none">Designika AI</h3>
                                <p className="text-[10px] uppercase tracking-widest text-white/60 font-medium mt-1">Interior Consultant</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/50 hover:text-white transition-colors relative z-10 hover:bg-white/10 p-2 rounded-full"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-zinc-50/50 dark:bg-black/20">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-1 ${msg.role === 'user'
                                    ? 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 ring-1 ring-zinc-200 dark:ring-zinc-700'
                                    : 'bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-orange-500/20'
                                    }`}>
                                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                </div>
                                <div className={`max-w-[80%] p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-tr-sm border border-zinc-100 dark:border-zinc-700'
                                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-tl-sm border border-zinc-100 dark:border-zinc-700'
                                    }`}>
                                    {msg.role === 'user' ? (
                                        msg.content
                                    ) : (
                                        <div className="text-sm space-y-2">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                                    ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                                    li: ({ node, ...props }) => <li className="pl-1 marker:text-amber-500" {...props} />,
                                                    strong: ({ node, ...props }) => <strong className="font-bold text-zinc-900 dark:text-zinc-100" {...props} />,
                                                    h1: ({ node, ...props }) => <h1 className="font-bold text-lg mb-2" {...props} />,
                                                    h2: ({ node, ...props }) => <h2 className="font-bold text-base mb-2" {...props} />,
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                                    <Bot size={14} />
                                </div>
                                <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex gap-3 items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask for advice..."
                            className="flex-1 bg-zinc-100 dark:bg-zinc-800/50 border-0 rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-amber-500/20 outline-none transition-all placeholder:text-zinc-400 font-medium"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-zinc-900 w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-105 active:scale-95"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Toggle Button */}
            <div className="relative group">
                {!isOpen && (
                    <span className="absolute right-0 bottom-full mb-3 px-3 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl pointer-events-none">
                        Chat with AI
                        <div className="absolute right-6 top-full border-4 border-transparent border-t-zinc-900"></div>
                    </span>
                )}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-16 h-16 rounded-full shadow-[0_8px_40px_rgba(0,0,0,0.18)] flex items-center justify-center transition-all duration-500 hover:scale-110 relative z-10 ${isOpen
                        ? 'bg-white text-zinc-900 rotate-90 scale-90'
                        : 'bg-zinc-900 text-white hover:bg-black'
                        }`}
                >
                    <div className="absolute inset-0 rounded-full border border-white/10"></div>
                    {isOpen ? <X size={28} /> :
                        <div className="relative">
                            <Sparkles size={28} className="animate-pulse" />
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-500 border-2 border-zinc-900 rounded-full"></span>
                        </div>
                    }
                </button>
            </div>
        </div>
    );
};
