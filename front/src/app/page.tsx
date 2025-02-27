'use client';

import Recorder from "@/app/components/recorder";
import Output from "@/app/components/output";
import {Box, Divider, Typography} from "@mui/material";
import Grid from '@mui/material/Grid2';
import React, {useEffect, useState} from "react";
import OnlineIndicator from "@/app/components/onlineIndicator";

export default function Home() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionNumber, setConnectionNumber] = useState(1);
  const [online, setOnline] = useState(false);

  /* Connect Web Socket Fn */
  async function handleConnectWebSocket() {
    const host = window.location.hostname;
    const port = "8080"
    const serverUrl = `http://${host}:${port}/text2speech`;
    const newSocket = new WebSocket(serverUrl);

    newSocket.onopen = () => {
      setOnline(true)
    };
    newSocket.onclose = () => {
      setOnline(false)
      setTimeout(() => {
        setConnectionNumber((n) => n + 1);
      }, 2000);
    };
    newSocket.onerror = () => {
      setOnline(false)
    }
    setSocket(newSocket);
  }

  useEffect(() => {
    handleConnectWebSocket().then()
    return () => {
      socket?.close()
    }
  }, [connectionNumber])

  return (
    <Box sx={{p: 1, pl: 4, height: '100vh', maxWidth: 900, width: '100vw'}}>
      <Grid container direction={"row"} spacing={1} alignItems={"center"}>
        <Grid> <Typography variant={"h5"}>Voice recognizer</Typography> </Grid>
        <Grid> <OnlineIndicator online={online}/> </Grid>
      </Grid>
      <Grid> <Divider/> </Grid>
      <Grid container direction={"column"}>
        <Grid> {socket !== null && <Recorder socket={socket}/>} </Grid>
        <Grid> {socket !== null && <Output socket={socket}/>} </Grid>
      </Grid>
    </Box>
  );
}
