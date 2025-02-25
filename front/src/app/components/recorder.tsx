'use client';

import {Box, Button, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import {IMediaRecorder, MediaRecorder, register} from 'extendable-media-recorder';
import {connect} from 'extendable-media-recorder-wav-encoder';
import Grid from "@mui/material/Grid2";


export default function Recorder() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<IMediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [online, setOnline] = useState(false);

  /* Connect Web Socket Fn */
  async function handleConnectWebSocket() {
    const serverUrl = "http://127.0.0.1:8080/input";
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

  /* Connect to microphone */
  async function handleCreateMediaRecorder() {
    await register(await connect());
    const stream = await navigator.mediaDevices.getUserMedia({audio: true})
    const mediaRecorder = new MediaRecorder(stream, {mimeType: "audio/wav"});

    setMediaRecorder(mediaRecorder);
  }

  useEffect(() => {
    try {
      handleConnectWebSocket()
      handleCreateMediaRecorder()
    } catch (e) {
      console.error("Error initializing recorder", e);
    }
    return () => {
      socket?.close();
      mediaRecorder?.stop();
    }
  }, [])

  useEffect(() => {
      if (mediaRecorder === null) return;
      if (socket === null) return;

    mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          try {
            const buffer = await event.data.arrayBuffer();
            console.log(`Sending ${buffer.byteLength} bytes of data`);
            socket.send(buffer); //wav headers will present only in first chunk
          } catch (e) {
            console.error("Error reading data as ArrayBuffer:", e);
          }
        }
      }

    }, [mediaRecorder, socket]
  )

  const chunkSize = 6000
  return (
    <Box sx={{p: 1}}>
      <Grid container spacing={1} direction={"row"}>
        <Grid>
          {!recording && <Button variant={"outlined"} onClick={() => {
            mediaRecorder?.start(chunkSize)
            setRecording(true)
          }}>Start Recording</Button>}
          {recording && <Button variant={"outlined"} onClick={() => {
            mediaRecorder?.stop()
            setRecording(false)
          }}>Stop Recording</Button>}
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
    </Box>
  );
}
