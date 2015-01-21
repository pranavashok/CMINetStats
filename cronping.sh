#!/bin/bash
# Add this to crontab by using 'sudo crontab -e' and
# appending this with the right script_dir:
#
# 01 * * * * <script_dir>/cronping.sh 192.168.48.0/21 5
#
# Ensure that this script is executable by running 
# chmod +x <script_dir>/cronping.sh
#
# This will make the script run every 1st minute of 
# every hour. Make sure you remove the crontab entry 
# after this project is over.
#
# Set your script folder below

script_dir=/home/pranav

if [ "$#" -ne 22]; then
  echo "Usage: sudo sh localping.sh 192.168.49.0/24 NUMBER_OF_PINGS" >&2
  echo "Note that NUMBER_OF_PINGS is pings/ip. A good value to set would be 5. 10 would be appreciated. Anything more may corrupt data because IPs might go down in time" >&2
  exit 1
fi

echo "Starting nmap..."
nmap -sP -oG output.nmap $1 >> /dev/null
grep -o -e '[0-9]*\.[0-9]*.[0-9]*\.[0-9]*' output.nmap | tr '\n' ' ' > input.nping
echo "Starting nping..."
sudo nping --icmp -c $2 `cat input.nping` > $script_dir/pingstats/`date +%e%H`
cat $script_dir/pingstats/`date +%e%H`
echo "Output dumped to $script_dir/pingstats/`date +%e%H`"
