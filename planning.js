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
}