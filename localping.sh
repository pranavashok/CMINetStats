#!/bin/bash
if [ "$#" -ne 3 ]; then
  echo "Usage: sudo sh localping.sh 192.168.49.0/24 NUMBER_OF_PINGS OUTPUT_FILE" >&2
  echo "Note that NUMBER_OF_PINGS is pings/ip. A good value to set would be 5. 10 would be appreciated. Anything more may corrupt data because IPs might go down in time" >&2
  exit 1
fi
echo "Starting nmap..."
nmap -sP -oG output.nmap $1 >> /dev/null
grep -o -e '[0-9]*\.[0-9]*.[0-9]*\.[0-9]*' output.nmap | tr '\n' ' ' > input.nping
echo "Starting nping..."
sudo nping --icmp -c $2 `cat input.nping` > $3
cat $3
echo "Output dumped to $3"