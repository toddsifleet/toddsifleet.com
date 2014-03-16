import json
import csv

output = []
with open('sf_bike_parking.csv','rb') as fh:
  reader = csv.reader(fh, delimiter=',')
  header = reader.next()
  current_id = 1
  for line in reader:
    parking_spot = {'id': current_id}
    current_id += 1
    for key, value in zip(header, line):
      parking_spot[key] = value
    for key in ('lat', 'lng'):
      parking_spot[key] = float(parking_spot[key])

    if not parking_spot['address']:
        parking_spot['address'] = parking_spot['name']
    output.append(parking_spot)


with open('sf_bike_parking.json', 'w') as fh:
  fh.write(json.dumps(output))
