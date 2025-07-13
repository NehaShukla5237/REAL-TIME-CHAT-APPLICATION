import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('chat message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('chat message');
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('chat message', message);
      setMessage('');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Real-Time Chat App</h2>
      <div>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ margin: '10px 0' }}>
            {msg}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
          style={{ padding: '8px', width: '300px' }}
        />
        <button type="submit" style={{ padding: '8px 12px', marginLeft: '10px' }}>Send</button>
      </form>
    </div>
  );
}

export default Chat;
