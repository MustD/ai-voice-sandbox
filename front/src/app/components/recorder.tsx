'use client';

import {Box, Button} from "@mui/material";
import {useEffect, useState} from "react";
import {IMediaRecorder, MediaRecorder, register} from 'extendable-media-recorder';
import {connect} from 'extendable-media-recorder-wav-encoder';


export default function Recorder() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<IMediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);

  /* Connect Web Socket Fn */
  async function handleConnectWebSocket() {
    const serverUrl = "http://127.0.0.1:8080/input";
    const newSocket = new WebSocket(serverUrl);

    newSocket.onopen = () => {
      console.log("Connected to socket");
    };
    newSocket.onclose = () => {
      console.log("Disconnected");
    };

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
    handleConnectWebSocket()
    handleCreateMediaRecorder()
    return () => {
      socket?.close();
      mediaRecorder?.stop();
    }
  }, [])

  let header: ArrayBuffer | undefined
  useEffect(() => {
      if (mediaRecorder === null) return;
      if (socket === null) return;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          event.data.arrayBuffer()
            .then((buffer) => {
              console.log(`Sending ${buffer.byteLength} bytes of data`);
              if (header === undefined) {
                header = buffer.slice(0, 44)
                socket.send(buffer);
              } else {
                socket.send(new Blob([header, buffer], {type: event.data.type}));
              }

            })
            .catch((error) => {
              console.error("Error reading data as ArrayBuffer:", error);
            })
        }
      }

    }, [mediaRecorder, socket]
  )

  const chunkSize = 15000
  return (
    <Box sx={{p: 1}}>
      {socket === null && <div>Loading...</div>}
      {mediaRecorder === null && <div>Loading...</div>}

      {!recording && <Button variant={"outlined"} onClick={() => {
        mediaRecorder?.start(chunkSize)
        setRecording(true)
      }}>Start Recording</Button>}
      {recording && <Button variant={"outlined"} onClick={() => {
        mediaRecorder?.stop()
        setRecording(false)
      }}>Stop Recording</Button>}
    </Box>
  );
}
