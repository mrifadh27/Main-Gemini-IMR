const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Database Configuration ---
const dbConfig = {
    host: 'localhost',
    user: 'root',         
    password: 'root', //password
    database: 'UMS_DB'
};

// --- GET: Load All Data ---
app.get('/api/initial-data', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        const [resultCustomers] = await connection.execute('SELECT * FROM Customers');
        const [resultMeters] = await connection.execute('SELECT * FROM Meters');
        const [resultReadings] = await connection.execute('SELECT * FROM Readings');
        const [resultBills] = await connection.execute('SELECT * FROM Bills');
        const [resultPayments] = await connection.execute('SELECT * FROM Payments');
        const [resultTariffs] = await connection.execute('SELECT * FROM Tariffs');

        const data = {
            customers: resultCustomers.map(c => ({
                id: c.CustomerID, name: c.Name, address: c.Address, phone: c.Phone
            })),
            meters: resultMeters.map(m => ({
                id: m.MeterID, customerId: m.CustomerID, typeId: m.TypeID, lastReading: Number(m.LastReading), status: m.Status
            })),
            readings: resultReadings.map(r => ({
                id: r.ReadingID, meterId: r.MeterID, date: r.ReadingDate, value: Number(r.Value), consumption: Number(r.Consumption)
            })),
            bills: resultBills.map(b => ({
                id: b.BillID, customerId: b.CustomerID, meterId: b.MeterID, readingId: b.ReadingID, amount: Number(b.Amount), date: b.BillDate, status: b.Status
            })),
            payments: resultPayments.map(p => ({
                id: p.PaymentID, billId: p.BillID, amount: Number(p.Amount), date: p.PaymentDate
            })),
            tariffs: resultTariffs.map(t => ({
                id: t.TariffID, typeId: t.TypeID, name: t.Name, rate: Number(t.RatePerUnit), fixed: Number(t.FixedCharge)
            }))
        };
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database Error');
    } finally {
        if (connection) await connection.end();
    }
});

// --- POST: Add Customer ---
app.post('/api/customers', async (req, res) => {
    const { name, address, phone } = req.body;
    const id = `C${Date.now().toString().slice(-4)}`; 

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO Customers (CustomerID, Name, Address, Phone) VALUES (?, ?, ?, ?)',
            [id, name, address, phone]
        );
        res.json({ success: true, message: "Customer added", id });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding customer');
    } finally {
        if (connection) await connection.end();
    }
});

// --- PUT: Update Customer (NEW) ---
app.put('/api/customers/:id', async (req, res) => {
    const { name, address, phone } = req.body;
    const { id } = req.params;

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        // This SQL command updates the specific row in the database
        await connection.execute(
            'UPDATE Customers SET Name = ?, Address = ?, Phone = ? WHERE CustomerID = ?',
            [name, address, phone, id]
        );
        res.json({ success: true, message: "Customer updated" });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating customer');
    } finally {
        if (connection) await connection.end();
    }
});

// --- DELETE: Remove Customer ---
app.delete('/api/customers/:id', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM Customers WHERE CustomerID = ?', [req.params.id]);
        res.json({ success: true, message: "Customer deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting customer');
    } finally {
        if (connection) await connection.end();
    }
});

// --- POST: Pay Bill ---
app.post('/api/pay-bill', async (req, res) => {
    const { billId, amount } = req.body;
    const paymentId = `P${Date.now()}`;
    
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO Payments (PaymentID, BillID, Amount, PaymentDate) VALUES (?, ?, ?, NOW())',
            [paymentId, billId, amount]
        );
        await connection.execute(
            "UPDATE Bills SET Status = 'Paid' WHERE BillID = ?",
            [billId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error paying bill');
    } finally {
        if (connection) await connection.end();
    }
});

// --- POST: Add New Usage ---
app.post('/api/add-reading', async (req, res) => {
    const { meterId, currentReading } = req.body;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [meters] = await connection.execute(
            `SELECT m.*, t.RatePerUnit, t.FixedCharge FROM Meters m JOIN Tariffs t ON m.TypeID = t.TypeID WHERE m.MeterID = ?`, 
            [meterId]
        );
        
        if (meters.length === 0) return res.status(404).send("Meter not found");
        const meter = meters[0];
        const consumption = parseFloat(currentReading) - parseFloat(meter.LastReading);
        
        if (consumption < 0) return res.status(400).send("Invalid reading");

        const billAmount = (consumption * parseFloat(meter.RatePerUnit)) + parseFloat(meter.FixedCharge);
        const readingId = `R${Date.now()}`;
        const billId = `B${Date.now()}`;

        await connection.execute(
            'INSERT INTO Readings (ReadingID, MeterID, Value, Consumption, ReadingDate) VALUES (?, ?, ?, ?, NOW())',
            [readingId, meterId, currentReading, consumption]
        );
        await connection.execute(
            'UPDATE Meters SET LastReading = ? WHERE MeterID = ?',
            [currentReading, meterId]
        );
        await connection.execute(
            "INSERT INTO Bills (BillID, CustomerID, MeterID, ReadingID, Amount, BillDate, Status) VALUES (?, ?, ?, ?, ?, NOW(), 'Unpaid')",
            [billId, meter.CustomerID, meterId, readingId, billAmount]
        );

        res.json({ success: true, amount: billAmount });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    } finally {
        if (connection) await connection.end();
    }
});

// --- POST: Add Meter ---
app.post('/api/meters', async (req, res) => {
    const { id, customerId, typeId, lastReading, status } = req.body;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO Meters (MeterID, CustomerID, TypeID, LastReading, Status) VALUES (?, ?, ?, ?, ?)',
            [id, customerId, typeId, lastReading, status]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding meter');
    } finally {
        if (connection) await connection.end();
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));