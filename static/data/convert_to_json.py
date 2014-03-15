import json
import csv

output = []
with open('sf_bike_parking.csv','rb') as fh:
  reader = csv.reader(fh, delimiter=',') 
  header = reader.next()
  current_id = 1
  for line in reader:
    lineItems = {'id': current_id}
    current_id += 1
    for key, value in zip(header, line):  
      lineItems[key] = value
    for key in ('lat', 'lng'):
      lineItems[key] = float(lineItems[key])
    output.append(lineItems)


with open('sf_bike_parking.json', 'w') as fh:
  fh.write(json.dumps(output))
