#!/usr/bin/env bash
# wait-for-it.sh

set -e

host="$1"
port="$2"
shift 2
cmd="$@"

# Install netcat if not present
if ! command -v nc &> /dev/null; then
    >&2 echo "netcat not found, installing..."
    apk add --no-cache netcat-openbsd
fi

until nc -z "$host" "$port"; do
  >&2 echo "Service at $host:$port is unavailable - sleeping"
  sleep 1
done

>&2 echo "Service at $host:$port is up - executing command"
exec $cmd