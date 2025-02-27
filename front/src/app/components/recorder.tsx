'use client';

import {Box, Button} from "@mui/material";
import React, {useEffect, useState} from "react";
import {IMediaRecorder, MediaRecorder, register} from 'extendable-media-recorder';
import Grid from "@mui/material/Grid2";
import {connect} from "extendable-media-recorder-wav-encoder";

type RecorderProps = {
  socket: WebSocket,
}

export default function Recorder(props: RecorderProps) {
  const [mediaRecorder, setMediaRecorder] = useState<IMediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const socket = props.socket
  const chunkLength = 6000

  /* Connect to microphone */
  async function handleCreateMediaRecorder() {
    try {
      const port = await connect()
      await register(port)
    } catch (e) {
      console.info("double register", e)
    }
    const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: false})
    const mediaRecorder = new MediaRecorder(stream, {mimeType: "audio/wav"});

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
    setMediaRecorder(mediaRecorder);
  }

  const startRecording = () => {
    mediaRecorder?.start(chunkLength)
    setRecording(true)
    socket.send("start")
  }
  const stopRecording = () => {
    mediaRecorder?.stop()
    setRecording(false)
    setTimeout(() => {
      socket.send("stop");
    }, chunkLength);
  }

  useEffect(() => {
    try {
      handleCreateMediaRecorder().then()
    } catch (e) {
      console.error("Error initializing recorder", e);
    }
    return () => {
      mediaRecorder?.stop();
    }
  }, [])

  return (
    <Box sx={{p: 1}}>
      <Grid container spacing={1} direction={"row"}>
        <Grid>
          {!recording && <Button variant={"outlined"} onClick={() => startRecording()}>Start Recording</Button>}
          {recording && <Button variant={"outlined"} onClick={() => stopRecording()}>Stop Recording</Button>}
        </Grid>
      </Grid>
    </Box>
  );
}
