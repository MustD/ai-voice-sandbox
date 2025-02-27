'use client';

import Recorder from "@/app/components/recorder";
import Output from "@/app/components/output";
import {Box, Divider, Typography} from "@mui/material";
import Grid from '@mui/material/Grid2';
import React, {useEffect, useState} from "react";

export default function Home() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionNumber, setConnectionNumber] = useState(1);
  const [online, setOnline] = useState(false);

  /* Connect Web Socket Fn */
  async function handleConnectWebSocket() {
    const serverUrl = "http://127.0.0.1:8080/text2speech";
    const newSocket = new WebSocket(serverUrl);

    newSocket.onopen = () => {
      setOnline(true);
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
    handleConnectWebSocket();
    return () => {
      socket?.close();
    }
  }, [connectionNumber]);

  return (
    <Box sx={{flexGrow: 1, p: 1, pl: 4, height: '100vh', width: '100vw'}}>
      <Grid container direction={"row"} spacing={1}>
        <Grid>
          <Typography variant={"h5"}>Voice recognizer sandbox</Typography>
        </Grid>
        <Grid>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 2,}}>
            <Box sx={{width: 12, height: 12, borderRadius: '50%', backgroundColor: online ? 'green' : 'red',}}/>
            <Typography variant="body2">
              {online ? 'Online' : 'Offline'}
            </Typography>
          </Box>
        </Grid>
      </Grid>
      <Divider sx={{m: 1}}/>
      <Grid container direction={"column"}>
        <Grid>
          {socket !== null && <Recorder socket={socket}/>}
        </Grid>
        <Grid>
          {socket !== null && <Output socket={socket}/>}
        </Grid>
      </Grid>
    </Box>
  );
}
