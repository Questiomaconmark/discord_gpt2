#!/bin/bash
LOGFILE="bot.log"
PIDFILE="bot.pid"

# Clear the log file
> "$LOGFILE"

# Run bot in background and save its PID
node ../src/bot.js >> "$LOGFILE" 2>&1 &
echo $! > "$PIDFILE"

echo "Bot started with PID $(cat $PIDFILE)"

