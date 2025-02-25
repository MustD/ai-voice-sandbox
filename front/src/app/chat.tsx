'use client';

import {useEffect, useState} from "react";

export default function Chat() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  /* Connect Web Socket Fn */
  async function handleConnectWebSocket() {
    const serverUrl = "http://127.0.0.1:8080/messages";
    const newSocket = new WebSocket(serverUrl);

    newSocket.onopen = () => {
      console.log("Connected to socket");
    };
    newSocket.onclose = () => {
      console.log("Disconnected");
    };

    setSocket(newSocket);
  }

  useEffect(() => {
    handleConnectWebSocket();
    return () => {
      socket?.close();
    }
  }, []);

  useEffect(() => {
    if (socket === null) return;
    socket.onmessage = (event) => {
      const message = event.data;
      setMessages((messages) => [...messages, message]);
    }
  }, [socket]);

  return (
    <div>
      {socket === null && <div>Loading...</div>}
      {messages.map((message, index) => (
        <div key={index}>{message}</div>
      ))}
    </div>
  );
}
