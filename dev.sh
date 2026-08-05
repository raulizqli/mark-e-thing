#!/bin/bash
API_PORT=5175
GUI_PORT=5176

for PORT in $API_PORT $GUI_PORT; do
  PID=$(lsof -t -i:$PORT)
  if [ ! -z "$PID" ]; then
    echo "Port $PORT is already in use by process $PID. Killing it..."
    kill -9 $PID
    echo "Process $PID killed."
  fi
done

npm run dev
