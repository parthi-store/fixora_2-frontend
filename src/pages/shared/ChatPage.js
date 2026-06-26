import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Navbar from '../../components/layout/Navbar';

export default function ChatPage() {
  const { user } = useAuth();
  const { socket } = useNotifications();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    chatAPI.getConversations()
      .then(({ data }) => setConversations(data.conversations))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    setLoading(true);
    chatAPI.getHistory(selectedUser._id)
      .then(({ data }) => { setMessages(data.messages); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedUser]);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_message', (msg) => {
      if (selectedUser && (msg.senderId === selectedUser._id || msg.receiverId === selectedUser._id)) {
        setMessages(prev => [...prev, msg]);
      }
    });
    return () => socket.off('new_message');
  }, [socket, selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !selectedUser) return;
    const text = input;
    setInput('');
    try {
      const { data } = await chatAPI.send({ receiverId: selectedUser._id, message: text });
      setMessages(prev => [...prev, data.message]);
    } catch { toast.error('Failed to send message.'); }
  };

  const ROLE_COLORS = { admin: 'bg-purple-100 text-purple-700', manager: 'bg-blue-100 text-blue-700', technician: 'bg-orange-100 text-orange-700', customer: 'bg-green-100 text-green-700' };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar menuItems={[]} />
      <div className="max-w-5xl mx-auto p-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex" style={{ height: 'calc(100vh - 120px)' }}>
          {/* Sidebar */}
          <div className="w-72 border-r border-gray-100 flex flex-col">
            <div className="px-4 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">No conversations yet</div>
              ) : conversations.map((conv, i) => (
                <button key={i} onClick={() => setSelectedUser(conv.user)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left border-b border-gray-50 ${selectedUser?._id === conv.user?._id ? 'bg-purple-50' : ''}`}>
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                    {conv.user?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800 truncate">{conv.user?.name}</p>
                      {conv.unread > 0 && <span className="text-xs bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center">{conv.unread}</span>}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{conv.lastMessage?.message}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${ROLE_COLORS[conv.user?.role] || 'bg-gray-100 text-gray-600'}`}>{conv.user?.role}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat area */}
          {selectedUser ? (
            <div className="flex-1 flex flex-col">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-600">
                  {selectedUser.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{selectedUser.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{selectedUser.role}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {loading ? <div className="text-center text-gray-400 text-sm">Loading...</div> :
                  messages.map((msg, i) => {
                    const isMe = msg.senderId === user?._id || msg.senderId?._id === user?._id;
                    return (
                      <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                          <p>{msg.message}</p>
                          <p className={`text-xs mt-0.5 ${isMe ? 'text-purple-200' : 'text-gray-400'}`}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    );
                  })}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && sendMessage()}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={`Message ${selectedUser.name}...`} />
                <button onClick={sendMessage} disabled={!input.trim()}
                  className="bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-60">
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-5xl mb-3">💬</div>
                <p className="font-medium">Select a conversation</p>
                <p className="text-sm mt-1">Choose from your existing conversations</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
