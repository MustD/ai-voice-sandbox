'use client';

import React, {useEffect, useState} from "react";
import {Box, Divider, Typography} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {List} from "immutable";

export default function Output() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<List<string>>(List());
  const [online, setOnline] = useState(false);

  /* Connect Web Socket Fn */
  async function handleConnectWebSocket() {
    const serverUrl = "http://127.0.0.1:8080/messages";
    const newSocket = new WebSocket(serverUrl);

    newSocket.onopen = () => {
      setOnline(true);
    };
    newSocket.onclose = () => {
      setOnline(false)
    };
    newSocket.onerror = () => {
      setOnline(false)
    }
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
      const message = event.data as string;
      setMessages((messages) => messages.push(message));
    }
  }, [socket]);

  return (
    <Box sx={{p: 1}}>
      {socket === null && <div>Loading...</div>}
      {messages.size > 0 && (
        <Box>
          <Typography variant={"h6"}>Transcription:</Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 2,}}>
            <Box sx={{width: 12, height: 12, borderRadius: '50%', backgroundColor: online ? 'green' : 'red',}}/>
            <Typography variant="body2">
              {online ? 'Online' : 'Offline'}
            </Typography>
          </Box>
          <Divider sx={{m: 1}}/>
        </Box>
      )}
      <Grid container direction={"column"} spacing={1}>
        {messages.map((message, index) => (
          <Grid key={index}>
            <Typography variant={"caption"} sx={{fontSize: "1rem"}}>{"> "}{message}</Typography>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
