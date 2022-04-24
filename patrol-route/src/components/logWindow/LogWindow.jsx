import React, { useEffect, useState } from "react";
import "./LogWindow.css";
import { Typography } from "@mui/material";

function LogWindow({ log }) {
  const [logHistory, setLogHistory] = useState([]);
  if (log !== null) {
    log.forEach((obj) => {
      obj.Messages.forEach((msg) => {
        if (!logHistory.includes(msg)) {
          logHistory.unshift(msg);
        }
      });
    });
  }
  return (
    <div className="logWindow">
      {log === null
        ? ""
        : logHistory.map((msg, index) => {
            return (
              <div className="logWindow__msg" key={index}>
                <Typography variant="p">{msg}</Typography>
              </div>
            );
          })}
    </div>
  );
}

export default LogWindow;
