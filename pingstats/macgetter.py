import re
import sys

day = sys.argv[1]
hour = sys.argv[2]
home = sys.argv[3]
report = home+"/pingstats/nmap.report"

f=open(report)

content = f.read()

results = re.findall('Nmap scan report for ([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)\nHost is .+\.\nMAC Address\: (..:..:..:..:..:..) \(', content)

for (ip, mac) in results:
	print(day, hour, ip, mac)
