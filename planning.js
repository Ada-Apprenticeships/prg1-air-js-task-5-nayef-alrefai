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
        this.totalSeats = this.getTotalSeats();
    }

    getDistance() { // Method to calculate the distance of the flight based on airport data
        const airportRow = this.airportsData.find(function(row) {// Find the row in airportsData which matches the overseas airport
            return row[0] === this.overseasAirport;
        }, this); // Use the class context ('this') inside the function by binding it

        if (airportRow) {
            if (this.ukAirport === 'MAN') {
                return Number(airportRow[2]); // Distance from Manchester
            } else {
                return Number(airportRow[3]); // Distance from Gatwick
            }
        } else {
            return null; //Return null if the airport is not found
        }
    }

    getRunningCost() { // Method to calculate the running cost per seat based on aircraft data
        const aircraftRow = this.aircraftData.find(function(row) {
            return row[0] === this.aircraftType;
        }, this); 

        if (aircraftRow) {
            return Number(aircraftRow[1].replace('£', '')); // Remove £ sign and convert to number
        } else {
            return null; 
        }
    }

    getTotalSeats() {
        const aircraftRow = this.aircraftData.find(function(row) {
            return row[0] === this.aircraftType;
        }, this); 

        if (aircraftRow) {
            const economySeats = Number(aircraftRow[3]);
            const businessSeats = Number(aircraftRow[4]);
            const firstClassSeats = Number(aircraftRow[5]);
            return economySeats + businessSeats + firstClassSeats; // Total seats
        } else {
            return null; // Aircraft type not found
        }
    }

    calculateIncome() { //Method to calculate the income from all the seats
        const economyIncome = this.economySeatsBooked * this.economyPrice; // Income from economy seats
        const businessIncome = this.businessSeatsBooked * this.businessPrice; // Income from business seats
        const firstClassIncome = this.firstClassSeatsBooked * this.firstClassPrice; // Income from first-class seats
        return economyIncome + businessIncome + firstClassIncome; // Total income
    }

    calculateCost() {  // Method to calculate the total cost of the flight
        const totalSeatsTaken = this.economySeatsBooked + this.businessSeatsBooked + this.firstClassSeatsBooked;
        const costPerSeat = (this.runningCostPerSeat / 100) * this.distance; // Cost per seat based on distance
        return costPerSeat * totalSeatsTaken; // Total cost
    }

    calculateProfit() { // Method for calculating the profits
        const income = this.calculateIncome(); // Get total income
        const cost = this.calculateCost(); // Get total cost
        return income - cost; // Profit = Income - Cost
    }
}


//TESTING METHODS
const airportsData = readCsv('airports.csv');
const aircraftData = readCsv('aeroplanes.csv');


const ukAirport = 'MAN'; 
const overseasAirport = 'JFK'; 
const aircraftType = 'Boeing 737'; 
const economySeatsBooked = 100; 
const businessSeatsBooked = 20; 
const firstClassSeatsBooked = 10; 
const economyPrice = 150; 
const businessPrice = 300; 
const firstClassPrice = 500; 


const flight = new Flight(
    ukAirport,
    overseasAirport,
    aircraftType,
    economySeatsBooked,
    businessSeatsBooked,
    firstClassSeatsBooked,
    economyPrice,
    businessPrice,
    firstClassPrice,
    airportsData,
    aircraftData
);

console.log("Distance:", flight.getDistance());
console.log("Running Cost Per Seat:", flight.getRunningCost());
console.log("Total Seats:", flight.getTotalSeats());
console.log("Total Income:", flight.calculateIncome());
console.log("Total Cost:", flight.calculateCost());
console.log("Profit:", flight.calculateProfit());

