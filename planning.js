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
        this.ukAirport = ukAirport;  // Departure airport (UK)
        this.overseasAirport = overseasAirport; // Destination airport (international)
        this.aircraftType = aircraftType; // Type of aircraft used
        this.economySeatsBooked = economySeatsBooked; // Number of economy seats booked
        this.businessSeatsBooked = businessSeatsBooked; // Number of business seats booked
        this.firstClassSeatsBooked = firstClassSeatsBooked; // Number of first-class seats booked
        this.economyPrice = economyPrice; // Ticket price for economy seats
        this.businessPrice = businessPrice; // Ticket price for business seats
        this.firstClassPrice = firstClassPrice; // Ticket price for first-class seats
        this.airportsData = airportsData; // Reference to airport data
        this.aircraftData = aircraftData; // Reference to aircraft data

        if (!this.validateAirport(this.overseasAirport) || !this.validateAirport(this.ukAirport))  { // Perform validation on airport and aircraft codes
            throw new Error("Invalid airport code provided.");
        }
        if (!this.validateAircraft(this.aircraftType)) {
            throw new Error("Invalid aircraft type provided.");
        }
        this.distance = this.getDistance(); // Calculate and store the flight distance
        this.runningCostPerSeat = this.getRunningCost(); // Get running cost per seat
        this.totalSeats = this.getTotalSeats(); // Calculate the total seats for this aircraft

        this.validateFlight(); // Perform validation checks during construction
    }

    validateFlight() {
        if (!this.checkRangeFeasibility()) { // Validate flight feasibility and booking
            throw new Error(`Error: ${this.aircraftType} doesn't have the range to fly from ${this.ukAirport} to ${this.overseasAirport}`);
        }

        if (!this.checkOverbooking()) {
            throw new Error(`Error: Too many total seats booked (${this.economySeatsBooked + this.businessSeatsBooked + this.firstClassSeatsBooked} > ${this.getTotalSeats()})`);
        }

        if (this.economySeatsBooked > this.getTotalSeats('economy')) {
            throw new Error(`Error: Too many economy seats booked (${this.economySeatsBooked} > ${this.getTotalSeats('economy')})`);
        }

        if (this.businessSeatsBooked > this.getTotalSeats('business')) {
            throw new Error(`Error: Too many business seats booked (${this.businessSeatsBooked} > ${this.getTotalSeats('business')})`);
        }

        if (this.firstClassSeatsBooked > this.getTotalSeats('first-class')) {
            throw new Error(`Error: Too many first-class seats booked (${this.firstClassSeatsBooked} > ${this.getTotalSeats('first-class')})`);
        }
    }

    validateAirport(airportCode) { 
        if (airportCode === 'MAN' || airportCode === 'LGW') return true;// Allow 'MAN' and 'LGW' as valid UK airport codes
        return this.airportsData.some(row => row[0] === airportCode);// Otherwise, check if the code exists in the overseas airport data
    }

    validateAircraft(aircraftType) {
        const isValid = this.aircraftData.some(row => row[0].trim() === aircraftType);
        if (!isValid) {
            console.error(`Aircraft type not found in aircraft data: ${aircraftType}`);
        }
        return isValid;
    }

    getDistance() { // Find the distance to the destination airport from the airports data
        const airportRow = this.airportsData.find(row => row[0].trim() === this.overseasAirport); // Find matching airport row
        return airportRow ? (this.ukAirport === 'MAN' ? Number(airportRow[2]) : Number(airportRow[3])) : null; // Use correct distance based on UK airport
    }

    getRunningCost() { // Find the running cost per seat for the specified aircraft type
        const aircraftRow = this.aircraftData.find(row => row[0].trim() === this.aircraftType); // Find matching aircraft row
        return aircraftRow ? Number(aircraftRow[1].replace('£', '')) : null; //Parse runing cost and remove £
    }

    getTotalSeats(classType) {  // Calculate the total seats for the aircraft type using aircraft data
        const aircraftRow = this.aircraftData.find(row => row[0].trim() === this.aircraftType); // Find matching aircraft row
        if (!aircraftRow) return 0; 

        if (classType === 'economy') return Number(aircraftRow[3]);
        if (classType === 'business') return Number(aircraftRow[4]);
        if (classType === 'first-class') return Number(aircraftRow[5]);

        return (Number(aircraftRow[3]) + Number(aircraftRow[4]) + Number(aircraftRow[5])); // Sum the seats across all classes
    }

    checkRangeFeasibility() { // Find the row for the specified aircraft type
        const aircraftRow = this.aircraftData.find(row => row[0].trim() === this.aircraftType); // Find the row for the specified aircraft type
        // If the aircraft type is found, get the maximum range; otherwise return false
        const maxRange = aircraftRow ? Number(aircraftRow[2]) : null; // If the aircraft type is found, get the maximum range; otherwise return false

        console.log(`Max range for ${this.aircraftType}: ${maxRange}`);
        console.log(`Flight distance: ${this.distance}`);

        return maxRange !== null && this.distance <= maxRange;
    }

    checkOverbooking() {
        const totalBookedSeats = this.economySeatsBooked + this.businessSeatsBooked + this.firstClassSeatsBooked;
        return totalBookedSeats <= this.totalSeats;
    }

    calculateIncome() { // Calculate total income based on the booked seats in each class and their prices
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

function testFlightClassWithCSV(outputFile = 'flight_details.txt') {
    fs.writeFileSync(outputFile, 'Flight Details and Analysis\n\n');

    validFlightData.forEach(row => {
        const [ukAirport, overseasAirport, aircraftType, economySeatsBooked, businessSeatsBooked, firstClassSeatsBooked, economyPrice, businessPrice, firstClassPrice] = row;

        try {
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

            fs.appendFileSync(outputFile, flight.getFlightDetails());
        } catch (error) {
            fs.appendFileSync(outputFile, error.message + '\n'); // Log validation errors
        }
    });

    console.log(`Flight details written to ${outputFile}`);
}

// Call the testing function to run it
testFlightClassWithCSV();

function testGetDistance() {
    const sampleAirportsData = [
        ['JFK', 'New York', '5500', '6000'],
        ['LAX', 'Los Angeles', '9000', '9500']
    ];

    const flight = new Flight('MAN', 'JFK', 'Boeing 737', 100, 20, 10, 150, 300, 500, sampleAirportsData, []);
    
    const expectedDistance = 5500;
    const actualDistance = flight.getDistance();

    if (actualDistance === expectedDistance) {
        log("testGetDistance passed.");
    } else {
        errorLog(`testGetDistance failed. Expected ${expectedDistance}, but got ${actualDistance}`);
    }
}


function log(message) {
    console.log(`[INFO] ${message}`);
}

function errorLog(message) {
    console.error(`[ERROR] ${message}`);
}

function testGetDistance() {
    const sampleAirportsData = [
        ['JFK', 'New York', '5500', '6000'],
        ['LAX', 'Los Angeles', '9000', '9500']
    ];

    const flight = new Flight('MAN', 'JFK', 'Boeing 737', 100, 20, 10, 150, 300, 500, sampleAirportsData, []);
    
    const expectedDistance = 5500;
    const actualDistance = flight.getDistance();

    if (actualDistance === expectedDistance) {
        log("testGetDistance passed.");
    } else {
        errorLog(`testGetDistance failed. Expected ${expectedDistance}, but got ${actualDistance}`);
    }
}

// Call the test function
testGetDistance();



