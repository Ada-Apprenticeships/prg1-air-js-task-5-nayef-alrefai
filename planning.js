const fs = require('fs');

function readCsv(filename, delimiter = ',') {
    try {
        const fileContent = fs.readFileSync(filename, { encoding: 'utf-8' });
        const rows = fileContent.split('\n');
        const data = [];

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i].trim();
            if (row) {
                const columns = row.split(delimiter);
                data.push(columns);
            }
        }

        return data;
    } catch (err) {
        console.error("Error reading file:", err.message);
        return null;
    }
}

class Flight {
    constructor(ukAirport, overseasAirport, aircraftType, economySeatsBooked, businessSeatsBooked, firstClassSeatsBooked, economyPrice, businessPrice, firstClassPrice, airportsData, aircraftData) {
        this.ukAirport = ukAirport;
        this.overseasAirport = overseasAirport;
        this.aircraftType = aircraftType;
        this.economySeatsBooked = economySeatsBooked;
        this.businessSeatsBooked = businessSeatsBooked;
        this.firstClassSeatsBooked = firstClassSeatsBooked;
        this.economyPrice = economyPrice;
        this.businessPrice = businessPrice;
        this.firstClassPrice = firstClassPrice;

        this.airportsData = airportsData;
        this.aircraftData = aircraftData;

        this.distance = this.getDistance();
        this.runningCostPerSeat = this.getRunningCost();
        
    }

    getDistance() {
        const airportRow = this.airportsData.find(function(row) {
            return row[0] === this.overseasAirport;
        }, this); // bind 'this' to use the class instance

        if (airportRow) {
            if (this.ukAirport === 'MAN') {
                return Number(airportRow[2]); // Distance from MAN
            } else {
                return Number(airportRow[3]); // Distance from LGW
            }
        } else {
            return null; // Airport not found
        }
    }

    getRunningCost() {
        const aircraftRow = this.aircraftData.find(function(row) {
            return row[0] === this.aircraftType;
        }, this); // bind 'this' to use the class instance

        if (aircraftRow) {
            return Number(aircraftRow[1].replace('£', '')); // Remove £ sign
        } else {
            return null; // Aircraft type not found
        }
    }
}

// Sample airports data 
const airportsData = [
    ['JFK', 'John F Kennedy International', 5376, 5583],
    ['ORY', 'Paris-Orly', 610, 325],
    ['MAD', 'Madrid-Barajas', 1435, 1216],
    ['AMS', 'Amsterdam Schiphol', 485, 363],
    ['CAI', 'Cairo International', 3740, 3494],
];

// fake aircraft data
const aircraftData = [
    ['Medium narrow body', '£8', 2650, 160, 12, 0],
    ['Large narrow body', '£7', 5600, 180, 20, 4],
    ['Medium wide body', '£5', 4050, 380, 20, 8],
];

// Create an instance of Flight
const flight = new Flight(
    'MAN', 
    'JFK', 
    'Medium narrow body', 
    150, 
    12, 
    2, 
    399, 
    999, 
    1899, 
    airportsData, 
    aircraftData 
);

const runningCost = flight.getRunningCost();
console.log(`Running Cost per Seat: £${runningCost}`);