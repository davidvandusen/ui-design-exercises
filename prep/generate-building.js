"use strict";

const fs = require('fs');
const faker = require('faker');
const moment = require('moment');

const numFloors = 4;
const unitsPerFloor = 12;

const building = {
  name: 'Lighthouse Tower',
  built: 2014,
  address: '128 W. Hastings St.\nVancouver, BC',
  floors: []
};

for (let floorNum = 0; floorNum < numFloors; floorNum++) {
  building.floors[floorNum] = {
    number: floorNum + 1,
    units: []
  };
  for (let unitNum = 0; unitNum < unitsPerFloor; unitNum++) {
    building.floors[floorNum].units[unitNum] = {
      number: (floorNum + 1) * 100 + unitNum + 1,
      occupants: [{
        name: faker.name.findName(),
        phone: faker.phone.phoneNumber(),
        email: faker.internet.email()
      }],
      rentDue: moment().startOf('month').add(Math.floor(Math.random() * 2), 'months'),
      leaseExpires: moment().startOf('month').add(Math.floor(Math.random() * 12 + 1), 'months'),
      serviceRequests: []
    };
  }
}

fs.writeFile('public/data/building.json', JSON.stringify(building, null, 2));
