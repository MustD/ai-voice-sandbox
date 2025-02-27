import {Box, Typography} from "@mui/material";
import React from "react";

type OnlineIndicatorProps = { online: boolean, }

export default function OnlineIndicator({online}: OnlineIndicatorProps) {
  return (
    <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
      <Box sx={{width: 12, height: 12, borderRadius: '50%', backgroundColor: online ? 'green' : 'red',}}/>
      <Typography variant="body2">
        {online ? "Online" : "Offline"}
      </Typography>
    </Box>
  )
}