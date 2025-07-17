'use client';

import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { getFirebaseIdToken } from '@/lib/firebaseAuth';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function ChatPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const scrollRef = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    if (!user) return;

    socket.current = io(process.env.NEXT_PUBLIC_BACKEND_URL);
    socket.current.on('connect', () => console.log('Socket connected'));

    const fetchConversations = async () => {
      const token = await getFirebaseIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setConversations(data);
      if (data.length > 0) {
        joinConversation(data[0]._id);
      }
    };

    fetchConversations();

    socket.current.on('chat-history', setMessages);
    socket.current.on('new-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket.current.on('ai-typing', setTyping);

    return () => socket.current && socket.current.disconnect();
  }, [user]);

  const joinConversation = (id) => {
    setConversationId(id);
    if (socket.current) {
      socket.current.emit('join-chat', {
        userId: user.uid,
        conversationId: id,
      });
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !conversationId) return;

    if (socket.current) {
      socket.current.emit('send-message', {
        userId: user.uid,
        message,
        conversationId,
      });
    }

    setMessage('');
  };

  const startNewConversation = async () => {
    const token = await getFirebaseIdToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: 'New Chat ' + Date.now() }),
    });
    const convo = await res.json();
    setConversations((prev) => [convo, ...prev]);
    joinConversation(convo._id);
    setMessages([]);
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <Card className="w-72 min-w-60 bg-white/90 border-l-4 border-indigo-500/80 shadow-xl flex flex-col">
        <CardHeader className="pb-2">
          <Button onClick={startNewConversation} className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow-md hover:from-indigo-600 hover:to-blue-600">
            + New Chat
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="flex flex-col gap-1">
            {conversations.map((c) => (
              <button
                key={c._id}
                onClick={() => joinConversation(c._id)}
                className={`text-left px-4 py-2 rounded-lg transition-all font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:bg-indigo-100/80 hover:bg-indigo-100/80 cursor-pointer select-none ${
                  conversationId === c._id
                    ? 'bg-gradient-to-r from-indigo-400 to-blue-400 text-white shadow font-bold scale-[1.03]'
                    : 'text-gray-700'
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat */}
      <div className="flex-1 flex flex-col p-6">
        <Card className="flex-1 flex flex-col bg-white/95 shadow-lg border-t-4 border-indigo-400/70">
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 space-y-3 overflow-y-auto px-2 py-6 bg-gradient-to-br from-white via-indigo-50 to-blue-50 rounded-xl border border-indigo-100 shadow-inner">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xl px-5 py-3 rounded-2xl shadow text-base break-words transition-all
                      ${msg.sender === 'user'
                        ? 'bg-gradient-to-r from-indigo-100 to-blue-200 text-indigo-900 border border-indigo-200 rounded-br-md'
                        : 'bg-gradient-to-l from-gray-100 to-gray-200 text-gray-700 border border-gray-200 rounded-bl-md'}
                    `}
                    style={{ minWidth: '3rem' }}
                  >
                    {msg.message}
                  </div>
                </div>
              ))}
              {typing && <div className="flex justify-end"><div className="italic text-sm text-gray-400">AI is typing...</div></div>}
              <div ref={scrollRef} />
            </ScrollArea>
          </CardContent>
          <div className="border-t bg-white/80 px-4 py-3 flex gap-2 rounded-b-xl shadow-sm">
            <Input
              placeholder="Ask something..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 bg-indigo-50/50 focus:bg-white border-indigo-200 focus:border-indigo-400 rounded-full px-4 py-2 shadow-sm"
            />
            <Button
              onClick={sendMessage}
              className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold rounded-full px-6 shadow-md hover:from-indigo-600 hover:to-blue-600"
            >
              Send
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
