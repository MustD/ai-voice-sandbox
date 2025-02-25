'use client';

import {Button} from "@mui/material";
import {useEffect, useState} from "react";
import {IMediaRecorder, MediaRecorder} from 'extendable-media-recorder';

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
    navigator.mediaDevices.getUserMedia({audio: true})
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream, {
          audioBitsPerSecond: 128000,
          mimeType: "audio/wav"
        });
        setMediaRecorder(mediaRecorder);

      }).catch((error) => {
      console.error("Error accessing media devices:", error);
    });
  }

  useEffect(() => {
    handleConnectWebSocket();
    handleCreateMediaRecorder();
    return () => {
      socket?.close();
      mediaRecorder?.stop();
    }
  }, []);

  useEffect(() => {
    if (mediaRecorder === null) return;
    if (socket === null) return;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        event.data.arrayBuffer()
          .then((buffer) => {
            console.log(`Sending ${buffer.byteLength} bytes of data`);
            socket.send(buffer);
          })
          .catch((error) => {
            console.error("Error reading data as ArrayBuffer:", error);
          });
      }
    };

  }, [mediaRecorder, socket]);

  const chunkSize = 6000
  return (
    <div>
      {socket === null && <div>Loading...</div>}
      {mediaRecorder === null && <div>Loading...</div>}

      {!recording && <Button onClick={() => {
        mediaRecorder?.start(chunkSize)
        setRecording(true)
      }}>Start Recording</Button>}
      {recording && <Button onClick={() => {
        mediaRecorder?.stop()
        setRecording(false)
      }}>Stop Recording</Button>}
    </div>
  );
}
