import Recorder from "@/app/components/recorder";
import Output from "@/app/components/output";
import {Box, Divider, Typography} from "@mui/material";
import Grid from '@mui/material/Grid2';
import React from "react";

export default function Home() {
  return (
    <Box sx={{flexGrow: 1, p: 1, pl: 4, height: '100vh', width: '100vw'}}>
      <Typography variant={"h5"}>Voice recognizer sandbox</Typography>
      <Divider sx={{m: 1}}/>
      <Grid container direction={"column"}>
        <Grid>
          <Recorder/>
        </Grid>
        <Grid>
          <Output/>
        </Grid>
      </Grid>
    </Box>
  );
}
