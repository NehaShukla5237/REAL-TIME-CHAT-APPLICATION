import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import "./App.css";
import EmojiPicker from "emoji-picker-react";

const socket = io("http://localhost:5000");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const emojiRef = useRef();

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("user_joined", (data) => {
      setMessages((prev) => [...prev, { system: true, message: data }]);
    });

    socket.on("typing", (user) => {
      setTypingUser(user);
      setTimeout(() => setTypingUser(""), 2000);
    });

    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("user_left", (user) => {
      setMessages((prev) => [...prev, { system: true, message: `${user} left the chat` }]);
    });

    return () => {
      socket.off();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiRef.current &&
        !emojiRef.current.contains(e.target) &&
        !e.target.closest(".emoji-btn")
      ) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", { username, room });
      setJoined(true);
    }
  };

  const sendMessage = () => {
    if (message !== "") {
      const data = {
        author: username,
        message: message,
        room: room,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      socket.emit("send_message", data);
      setMessage("");
      setShowEmoji(false);
    }
  };

  const handleTyping = () => {
    socket.emit("typing", { username, room });
  };

  return (
    <div className={darkMode ? "App dark" : "App"}>
      {!joined ? (
        <div className="join-container">
          <h2>Join Chat Room</h2>
          <input type="text" placeholder="Enter name" onChange={(e) => setUsername(e.target.value)} />
          <input type="text" placeholder="Enter room" onChange={(e) => setRoom(e.target.value)} />
          <button onClick={joinRoom}>Join</button>
        </div>
      ) : (
        <div className="chat-container">
          <div className="header">
            <h2>Room: {room}</h2>
            <button onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "🌞 Light" : "🌙 Dark"}
            </button>
            <div className="users">
              👥 {onlineUsers.length} online: {onlineUsers.join(", ")}
            </div>
          </div>
          <div className="messages">
            {messages.map((msg, index) =>
              msg.system ? (
                <div key={index} className="system-message">{msg.message}</div>
              ) : (
                <div key={index} className={`message ${msg.author === username ? "own" : "other"}`}>
                  <span className="author">{msg.author}</span>
                  <div>{msg.message}</div>
                  <span className="time">{msg.time}</span>
                </div>
              )
            )}
            {typingUser && <div className="typing">{typingUser} is typing...</div>}
          </div>
          <div className="input-area">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleTyping}
              placeholder="Type your message..."
            />
            <button className="emoji-btn" onClick={() => setShowEmoji((prev) => !prev)}>😊</button>
            <button onClick={sendMessage}>Send</button>
          </div>
          {showEmoji && (
            <div className="emoji-picker" ref={emojiRef}>
              <EmojiPicker onEmojiClick={(e) => setMessage((prev) => prev + e.emoji)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;






