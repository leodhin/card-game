import React, { useState, useEffect, useRef } from 'react';
import { Chat as ChatIcon } from '@mui/icons-material';
import './Chat.css';

const Chat = ({ socket }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('receiveMessage', (message) => {
      setMessages(message);
    });

    // Clean up the listener on unmount
    return () => {
      socket.off('receiveMessage');
    };
  }, [socket]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    socket.emit('sendMessage', input);
    setInput('');
  };

  const toggleChat = () => {
    setChatOpen((prev) => !prev);
  }

  return (
    <>
      {/* Chat toggle button remains the same */}
      <div className="chat-toggle" onClick={toggleChat}>
        <ChatIcon style={{ fontSize: 40, color: "#f7d155" }} />
      </div>

      {chatOpen && (
        <div className={`chat-overlay ${chatOpen ? "open" : "closed"}`}>
          <div className="chachat-container">
            <div className="chat-messages">
              {messages.map((msg, index) => {
                return (
                  <div key={index} className={`chat-message ${msg.player === 'You' ? 'self' : ''}`}>
                    <div className="chat-message-header">
                      <span className="chat-player">{msg.player}</span>
                    </div>
                    <div className="chat-message-body">
                      {msg.message}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <form className="chat-form" onSubmit={handleSubmit}>
              <input
                type="text"
                className="chat-input"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" className="chat-send-btn">Send</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;