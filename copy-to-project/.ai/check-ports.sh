#!/bin/bash
# Port Availability Checker
# Usage: ./check-ports.sh 3000 3001 5432

echo "🔍 Checking Port Availability..."
echo ""

if [ $# -eq 0 ]; then
    echo "Usage: $0 <port1> <port2> <port3> ..."
    echo "Example: $0 3000 3001 5432 6379"
    exit 1
fi

all_available=true

for port in "$@"
do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "❌ Port $port is IN USE"
        echo "   Process: $(lsof -Pi :$port -sTCP:LISTEN | tail -n 1 | awk '{print $1, $2}')"
        all_available=false
    else
        echo "✅ Port $port is AVAILABLE"
    fi
done

echo ""
if [ "$all_available" = true ]; then
    echo "🎉 All ports are available!"
    exit 0
else
    echo "⚠️  Some ports are in use. Choose different ports or kill the processes."
    echo ""
    echo "To kill a process on a port:"
    echo "  kill -9 \$(lsof -ti :<port>)"
    exit 1
fi
