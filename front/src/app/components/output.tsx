'use client';

import React, {useEffect, useState} from "react";
import {Box, Button, Divider, Paper, Typography} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {List} from "immutable";

type OutputProps = {
  socket: WebSocket
}

export default function Output(props: OutputProps) {
  const socket = props.socket;
  const [messages, setMessages] = useState<List<string>>(List());

  useEffect(() => {
    socket.onmessage = (event) => {
      const message = event.data as string;
      setMessages((messages) => messages.push(message));
    }
  }, [socket]);

  return (
    <Box sx={{p: 1}}>
      {messages.size > 0 && (
        <Box>
          <Typography variant={"h6"}>Transcription:</Typography>
          <Divider sx={{m: 1}}/>
        </Box>
      )}
      <Grid container direction={"column"} spacing={1}>
        {messages.map((message, index) => (
          <Grid key={index}>
            <Paper sx={{p: 1}}>
              <Typography variant={"caption"} sx={{fontSize: "1rem"}}>{""}{message}</Typography>
            </Paper>
          </Grid>
        ))}
        {messages.size > 0 && (
          <Grid key={"clear"}>
            <Button variant={"outlined"} onClick={() => setMessages(List())}>Clear</Button>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
