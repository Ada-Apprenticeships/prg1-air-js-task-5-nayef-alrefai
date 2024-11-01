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

    getDistance() {
        const airportRow = this.airportsData.find(row => row[0] === this.overseasAirport);
        return airportRow ? (this.ukAirport === 'MAN' ? Number(airportRow[2]) : Number(airportRow[3])) : null;
    }

    getRunningCost() {
        const aircraftRow = this.aircraftData.find(row => row[0] === this.aircraftType);
        return aircraftRow ? Number(aircraftRow[1].replace('£', '')) : null;
    }

    getTotalSeats() {
        const aircraftRow = this.aircraftData.find(row => row[0] === this.aircraftType);
        return aircraftRow ? (Number(aircraftRow[3]) + Number(aircraftRow[4]) + Number(aircraftRow[5])) : null;
    }

    calculateIncome() {
        return (this.economySeatsBooked * this.economyPrice) +
               (this.businessSeatsBooked * this.businessPrice) +
               (this.firstClassSeatsBooked * this.firstClassPrice);
    }

    calculateCost() {
        const totalSeatsTaken = this.economySeatsBooked + this.businessSeatsBooked + this.firstClassSeatsBooked;
        const costPerSeat = (this.runningCostPerSeat / 100) * this.distance;
        return costPerSeat * totalSeatsTaken;
    }

    calculateProfit() {
        const income = this.calculateIncome();
        const cost = this.calculateCost();
        return income - cost;
    }

    getFlightDetails() {
        const profit = this.calculateProfit();
        return `Flight from ${this.ukAirport} to ${this.overseasAirport} (${this.aircraftType}):
Total Income: £${this.calculateIncome().toFixed(2)}
Total Cost: £${this.calculateCost().toFixed(2)}
Profit: £${profit.toFixed(2)}
---\n`;
    }
}

// Load the CSV files
const airportsData = readCsv('airports.csv');
const aircraftData = readCsv('aeroplanes.csv');
const validFlightData = readCsv('valid_flight_data.csv');

// Function to test the Flight class with data from CSV and output to a .txt file
function testFlightClassWithCSV(outputFile = 'flight_details.txt') {
    // Clear the file contents initially
    fs.writeFileSync(outputFile, 'Flight Details and Profit Analysis\n\n');

    validFlightData.forEach(row => {
        const [ukAirport, overseasAirport, aircraftType, economySeatsBooked, businessSeatsBooked, firstClassSeatsBooked, economyPrice, businessPrice, firstClassPrice] = row;

        const flight = new Flight(
            ukAirport,
            overseasAirport,
            aircraftType,
            Number(economySeatsBooked),
            Number(businessSeatsBooked),
            Number(firstClassSeatsBooked),
            Number(economyPrice),
            Number(businessPrice),
            Number(firstClassPrice),
            airportsData,
            aircraftData
        );

        // Write flight details to the text file
        fs.appendFileSync(outputFile, flight.getFlightDetails());
    });

    console.log(`Flight details written to ${outputFile}`);
}

// Run the test function
testFlightClassWithCSV();
