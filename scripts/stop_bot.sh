#!/bin/bash
PIDFILE="bot.pid"

if [ -f "$PIDFILE" ]; then
  PID=$(cat "$PIDFILE")
  if kill -0 "$PID" 2>/dev/null; then
    kill "$PID"
    echo "Bot stopped (PID $PID)"
  else
    echo "No process found with PID $PID"
  fi
  rm -f "$PIDFILE"
else
  echo "No PID file found. Is the bot running?"
fi
