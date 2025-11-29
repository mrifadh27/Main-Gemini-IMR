/**
 * UTILITY MANAGEMENT SYSTEM (UMS) - Backend Server
 * Node.js + Express + MySQL
 * 
 * This server provides REST APIs for the UMS frontend application.
 * Connects to MySQL 8.0 database.
 */

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// =============================================================================
// DATABASE CONFIGURATION - MySQL Workbench 8.0
// =============================================================================

const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',  // ← Change this!
    database: 'UMS_DB'
};

// Global connection pool
let pool;

// Initialize database connection
async function initializeDatabase() {
    try {
        pool = mysql.createPool(dbConfig);
        // Test connection
        const connection = await pool.getConnection();
        console.log('✅ Connected to MySQL database');
        connection.release();
        return true;
    } catch (err) {
        console.error('❌ MySQL connection failed:', err.message);
        console.log('⚠️  Server running in demo mode with mock data');
        return false;
    }
}

// =============================================================================
// MOCK DATA (Fallback when database is not available)
// =============================================================================

// Empty mock data - ready for user to add their own customers
let mockDb = {
    customers: [],
    meters: [],
    readings: [],
    bills: [],
    payments: [],
    tariffs: [
        { id: 1, typeId: 1, name: 'Electricity Standard', rate: 25.00, fixed: 500.00 },
        { id: 2, typeId: 2, name: 'Water Standard', rate: 45.00, fixed: 300.00 },
        { id: 3, typeId: 3, name: 'Gas Standard', rate: 35.00, fixed: 250.00 },
    ],
    complaints: [],
    users: [
        { id: 1, username: 'admin', fullName: 'System Administrator', role: 'Admin', email: 'admin@ums.lk' },
        { id: 2, username: 'field1', fullName: 'Saman Kumara', role: 'FieldOfficer', email: 'field1@ums.lk' },
        { id: 3, username: 'cashier1', fullName: 'Malini Jayawardena', role: 'Cashier', email: 'cashier1@ums.lk' },
        { id: 4, username: 'manager1', fullName: 'Ruwan Perera', role: 'Manager', email: 'manager1@ums.lk' },
    ]
};

// =============================================================================
// HELPER FUNCTION - Execute Query
// =============================================================================

async function executeQuery(sql, params = []) {
    if (!pool) return null;
    const [results] = await pool.execute(sql, params);
    return results;
}

// =============================================================================
// API ROUTES
// =============================================================================

// -----------------------------------------------------------------------------
// GET: Load All Initial Data
// -----------------------------------------------------------------------------
app.get('/api/initial-data', async (req, res) => {
    try {
        if (pool) {
            const [customers] = await pool.execute(`
                SELECT CustomerID as id, CONCAT(FirstName, ' ', LastName) as name, 
                       FirstName as firstName, LastName as lastName,
                       Address as address, Phone as phone, Email as email, 
                       CustomerTypeID as customerTypeId, Status as status, 
                       OutstandingBalance as outstandingBalance
                FROM Customers
            `);
            
            const [meters] = await pool.execute(`
                SELECT MeterID as id, CustomerID as customerId, UtilityTypeID as typeId,
                       LastReadingValue as lastReading, Status as status
                FROM Meters
            `);
            
            const [readings] = await pool.execute(`
                SELECT ReadingID as id, MeterID as meterId, CurrentReading as value,
                       Consumption as consumption, ReadingDate as date
                FROM MeterReadings
                ORDER BY ReadingDate DESC
            `);
            
            const [bills] = await pool.execute(`
                SELECT BillID as id, CustomerID as customerId, MeterID as meterId,
                       ReadingID as readingId, TotalAmount as amount, Consumption as consumption,
                       GeneratedDate as date, DueDate as dueDate, Status as status, PaidAmount as paidAmount
                FROM Bills
                ORDER BY GeneratedDate DESC
            `);
            
            const [payments] = await pool.execute(`
                SELECT PaymentID as id, BillID as billId, CustomerID as customerId,
                       Amount as amount, PaymentMethod as method, PaymentDate as date,
                       ProcessedBy as processedBy
                FROM Payments
                ORDER BY PaymentDate DESC
            `);
            
            const [tariffs] = await pool.execute(`
                SELECT TariffID as id, UtilityTypeID as typeId, TariffName as name,
                       RatePerUnit as rate, FixedCharge as fixed
                FROM Tariffs WHERE IsActive = 1
            `);

            const [complaints] = await pool.execute(`
                SELECT ComplaintID as id, CustomerID as customerId, MeterID as meterId,
                       Category as category, Subject as subject, Description as description,
                       Priority as priority, Status as status, CreatedAt as createdAt
                FROM Complaints
                ORDER BY CreatedAt DESC
            `);
            
            res.json({
                customers: customers.map(c => ({...c, outstandingBalance: Number(c.outstandingBalance)})),
                meters: meters.map(m => ({...m, lastReading: Number(m.lastReading)})),
                readings: readings.map(r => ({...r, value: Number(r.value), consumption: Number(r.consumption)})),
                bills: bills.map(b => ({...b, amount: Number(b.amount), consumption: Number(b.consumption), paidAmount: Number(b.paidAmount)})),
                payments: payments.map(p => ({...p, amount: Number(p.amount)})),
                tariffs: tariffs.map(t => ({...t, rate: Number(t.rate), fixed: Number(t.fixed)})),
                complaints
            });
        } else {
            res.json(mockDb);
        }
    } catch (err) {
        console.error('Error fetching data:', err);
        res.json(mockDb);
    }
});

// -----------------------------------------------------------------------------
// GET: Dashboard Statistics
// -----------------------------------------------------------------------------
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        if (pool) {
            const [result] = await pool.execute('SELECT * FROM vw_DashboardStats');
            res.json(result[0] || {});
        } else {
            res.json({
                TotalActiveCustomers: mockDb.customers.length,
                TotalActiveMeters: mockDb.meters.filter(m => m.status === 'Active').length,
                UnpaidBills: mockDb.bills.filter(b => b.status === 'Unpaid').length,
                OverdueBills: mockDb.bills.filter(b => b.status === 'Overdue').length,
                TotalOutstanding: mockDb.bills.filter(b => ['Unpaid', 'Overdue', 'Partial'].includes(b.status)).reduce((sum, b) => sum + (b.amount - b.paidAmount), 0),
                TodayRevenue: 0,
                MonthlyRevenue: mockDb.payments.reduce((sum, p) => sum + p.amount, 0),
                OpenComplaints: mockDb.complaints.filter(c => c.status === 'Open').length
            });
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// -----------------------------------------------------------------------------
// CUSTOMER ROUTES
// -----------------------------------------------------------------------------

app.get('/api/customers', async (req, res) => {
    try {
        if (pool) {
            const [result] = await pool.execute('SELECT * FROM vw_CustomerSummary');
            res.json(result);
        } else {
            res.json(mockDb.customers);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/customers/:id', async (req, res) => {
    try {
        if (pool) {
            const [result] = await pool.execute(
                'SELECT * FROM vw_CustomerSummary WHERE CustomerID = ?', 
                [req.params.id]
            );
            res.json(result[0]);
        } else {
            res.json(mockDb.customers.find(c => c.id === req.params.id));
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/customers', async (req, res) => {
    const { name, firstName, lastName, address, phone, email, customerTypeId = 1 } = req.body;
    const id = 'CUS-' + Date.now().toString().slice(-6);
    
    try {
        if (pool) {
            let fName = firstName || (name ? name.split(' ')[0] : '');
            let lName = lastName || (name ? name.split(' ').slice(1).join(' ') : '');
            
            await pool.execute(
                `INSERT INTO Customers (CustomerID, FirstName, LastName, Address, Phone, Email, CustomerTypeID)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [id, fName, lName, address, phone, email || `${id.toLowerCase()}@email.com`, customerTypeId]
            );
            res.json({ success: true, message: 'Customer added', id });
        } else {
            const newCustomer = { 
                id, 
                name: name || `${firstName} ${lastName}`,
                firstName: firstName || name?.split(' ')[0],
                lastName: lastName || name?.split(' ').slice(1).join(' '),
                address, phone, email,
                customerTypeId,
                status: 'Active',
                outstandingBalance: 0
            };
            mockDb.customers.push(newCustomer);
            res.json({ success: true, message: 'Customer added', id });
        }
    } catch (err) {
        console.error('Error adding customer:', err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/customers/:id', async (req, res) => {
    const { name, firstName, lastName, address, phone, email } = req.body;
    
    try {
        if (pool) {
            let fName = firstName || (name ? name.split(' ')[0] : '');
            let lName = lastName || (name ? name.split(' ').slice(1).join(' ') : '');
            
            await pool.execute(
                `UPDATE Customers SET FirstName = ?, LastName = ?, Address = ?, Phone = ?, Email = IFNULL(?, Email)
                 WHERE CustomerID = ?`,
                [fName, lName, address, phone, email, req.params.id]
            );
            res.json({ success: true, message: 'Customer updated' });
        } else {
            const idx = mockDb.customers.findIndex(c => c.id === req.params.id);
            if (idx !== -1) {
                mockDb.customers[idx] = { ...mockDb.customers[idx], name, address, phone, email };
            }
            res.json({ success: true, message: 'Customer updated' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/customers/:id', async (req, res) => {
    try {
        if (pool) {
            // Use stored procedure for proper cascade delete
            await pool.execute('CALL sp_DeleteCustomer(?)', [req.params.id]);
            res.json({ success: true, message: 'Customer and all related data deleted' });
        } else {
            // Mock: Delete all related data (simulating cascade)
            const customerId = req.params.id;
            
            // Get meter IDs for this customer
            const customerMeterIds = mockDb.meters
                .filter(m => m.customerId === customerId)
                .map(m => m.id);
            
            // Delete readings for these meters
            mockDb.readings = mockDb.readings.filter(r => !customerMeterIds.includes(r.meterId));
            
            // Get bill IDs for this customer
            const customerBillIds = mockDb.bills
                .filter(b => b.customerId === customerId)
                .map(b => b.id);
            
            // Delete payments for these bills
            mockDb.payments = mockDb.payments.filter(p => !customerBillIds.includes(p.billId));
            
            // Delete bills
            mockDb.bills = mockDb.bills.filter(b => b.customerId !== customerId);
            
            // Delete complaints
            mockDb.complaints = mockDb.complaints.filter(c => c.customerId !== customerId);
            
            // Delete meters
            mockDb.meters = mockDb.meters.filter(m => m.customerId !== customerId);
            
            // Finally delete customer
            mockDb.customers = mockDb.customers.filter(c => c.id !== customerId);
            
            res.json({ success: true, message: 'Customer and all related data deleted' });
        }
    } catch (err) {
        console.error('Error deleting customer:', err);
        res.status(500).json({ error: err.message });
    }
});

// -----------------------------------------------------------------------------
// METER ROUTES
// -----------------------------------------------------------------------------

app.get('/api/meters', async (req, res) => {
    try {
        if (pool) {
            const [result] = await pool.execute('SELECT * FROM vw_MeterDetails');
            res.json(result);
        } else {
            res.json(mockDb.meters);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/meters', async (req, res) => {
    const { id, customerId, typeId, lastReading = 0, status = 'Active' } = req.body;
    
    try {
        if (pool) {
            await pool.execute(
                `INSERT INTO Meters (MeterID, CustomerID, UtilityTypeID, LastReadingValue, Status)
                 VALUES (?, ?, ?, ?, ?)`,
                [id, customerId, typeId, lastReading, status]
            );
            res.json({ success: true, message: 'Meter added' });
        } else {
            mockDb.meters.push({ id, customerId, typeId, lastReading, status });
            res.json({ success: true, message: 'Meter added' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/meters/:id', async (req, res) => {
    try {
        if (pool) {
            // First delete readings for this meter (cascade)
            await pool.execute('DELETE FROM MeterReadings WHERE MeterID = ?', [req.params.id]);
            // Then delete the meter
            await pool.execute('DELETE FROM Meters WHERE MeterID = ?', [req.params.id]);
            res.json({ success: true, message: 'Meter removed' });
        } else {
            const meterId = req.params.id;
            // Delete readings for this meter
            mockDb.readings = mockDb.readings.filter(r => r.meterId !== meterId);
            // Delete meter
            mockDb.meters = mockDb.meters.filter(m => m.id !== meterId);
            res.json({ success: true, message: 'Meter removed' });
        }
    } catch (err) {
        console.error('Error deleting meter:', err);
        res.status(500).json({ error: err.message });
    }
});

// -----------------------------------------------------------------------------
// READING ROUTES
// -----------------------------------------------------------------------------

app.post('/api/add-reading', async (req, res) => {
    const { meterId, currentReading } = req.body;
    
    try {
        if (pool) {
            // Call stored procedure
            await pool.execute('SET @billId = ""');
            await pool.execute(
                'CALL sp_SubmitReading(?, ?, ?, @billId)',
                [meterId, parseFloat(currentReading), 'Field Officer']
            );
            const [[result]] = await pool.execute('SELECT @billId as billId');
            
            // Get the bill amount
            const [[bill]] = await pool.execute(
                'SELECT TotalAmount as amount FROM Bills WHERE BillID = ?',
                [result.billId]
            );
            
            res.json({ 
                success: true, 
                billId: result.billId,
                amount: bill?.amount || 0,
                message: 'Reading submitted and bill generated'
            });
        } else {
            // Mock implementation
            const meter = mockDb.meters.find(m => m.id === meterId);
            if (!meter) {
                return res.status(404).json({ error: 'Meter not found' });
            }
            
            const consumption = parseFloat(currentReading) - meter.lastReading;
            if (consumption < 0) {
                return res.status(400).json({ error: 'Invalid reading' });
            }
            
            const tariff = mockDb.tariffs.find(t => t.typeId === meter.typeId);
            const billAmount = (consumption * tariff.rate) + tariff.fixed;
            
            const readingId = 'RDG-' + Date.now();
            const billId = 'BILL-' + Date.now();
            
            mockDb.readings.push({
                id: readingId, meterId,
                value: parseFloat(currentReading), consumption,
                date: new Date().toISOString()
            });
            
            meter.lastReading = parseFloat(currentReading);
            
            mockDb.bills.push({
                id: billId, customerId: meter.customerId, meterId, readingId,
                amount: billAmount, consumption,
                date: new Date().toISOString(),
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'Unpaid', paidAmount: 0
            });
            
            res.json({ success: true, amount: billAmount, billId });
        }
    } catch (err) {
        console.error('Error submitting reading:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/readings', async (req, res) => {
    try {
        if (pool) {
            const [result] = await pool.execute(`
                SELECT mr.ReadingID as id, mr.MeterID as meterId, 
                       mr.CurrentReading as value, mr.Consumption as consumption,
                       mr.ReadingDate as date, mr.ReadBy as readBy,
                       CONCAT(c.FirstName, ' ', c.LastName) as customerName
                FROM MeterReadings mr
                INNER JOIN Meters m ON mr.MeterID = m.MeterID
                INNER JOIN Customers c ON m.CustomerID = c.CustomerID
                ORDER BY mr.ReadingDate DESC
            `);
            res.json(result);
        } else {
            res.json(mockDb.readings);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -----------------------------------------------------------------------------
// BILL ROUTES
// -----------------------------------------------------------------------------

app.get('/api/bills', async (req, res) => {
    try {
        if (pool) {
            const [result] = await pool.execute('SELECT * FROM vw_BillDetails ORDER BY GeneratedDate DESC');
            res.json(result);
        } else {
            res.json(mockDb.bills);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/bills/unpaid', async (req, res) => {
    try {
        if (pool) {
            const [result] = await pool.execute(`
                SELECT * FROM vw_BillDetails 
                WHERE Status IN ('Unpaid', 'Overdue', 'Partial')
                ORDER BY DueDate ASC
            `);
            res.json(result);
        } else {
            res.json(mockDb.bills.filter(b => ['Unpaid', 'Overdue', 'Partial'].includes(b.status)));
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/bills/overdue', async (req, res) => {
    try {
        if (pool) {
            const [result] = await pool.execute('SELECT * FROM vw_OverdueBills');
            res.json(result);
        } else {
            res.json(mockDb.bills.filter(b => b.status === 'Overdue'));
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -----------------------------------------------------------------------------
// PAYMENT ROUTES
// -----------------------------------------------------------------------------

app.post('/api/pay-bill', async (req, res) => {
    const { billId, amount, paymentMethod = 'Cash', processedBy = 'Cashier' } = req.body;
    
    try {
        if (pool) {
            await pool.execute(
                'CALL sp_ProcessPayment(?, ?, ?, ?, ?)',
                [billId, amount, paymentMethod, processedBy, null]
            );
            res.json({ success: true, message: 'Payment processed' });
        } else {
            const bill = mockDb.bills.find(b => b.id === billId);
            if (!bill) {
                return res.status(404).json({ error: 'Bill not found' });
            }
            
            const paymentId = 'PAY-' + Date.now();
            mockDb.payments.push({
                id: paymentId, billId, customerId: bill.customerId,
                amount, method: paymentMethod,
                date: new Date().toISOString(), processedBy
            });
            
            bill.paidAmount += amount;
            bill.status = bill.paidAmount >= bill.amount ? 'Paid' : 'Partial';
            
            res.json({ success: true, message: 'Payment processed', paymentId });
        }
    } catch (err) {
        console.error('Error processing payment:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/payments', async (req, res) => {
    try {
        if (pool) {
            const [result] = await pool.execute('SELECT * FROM vw_PaymentHistory ORDER BY PaymentDate DESC');
            res.json(result);
        } else {
            res.json(mockDb.payments);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -----------------------------------------------------------------------------
// TARIFF ROUTES
// -----------------------------------------------------------------------------

app.get('/api/tariffs', async (req, res) => {
    try {
        if (pool) {
            const [result] = await pool.execute(`
                SELECT TariffID as id, UtilityTypeID as typeId, TariffName as name,
                       RatePerUnit as rate, FixedCharge as fixed
                FROM Tariffs WHERE IsActive = 1
            `);
            res.json(result.map(t => ({...t, rate: Number(t.rate), fixed: Number(t.fixed)})));
        } else {
            res.json(mockDb.tariffs);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/tariffs/:id', async (req, res) => {
    const { name, rate, fixed } = req.body;
    
    try {
        if (pool) {
            await pool.execute(
                `UPDATE Tariffs SET TariffName = ?, RatePerUnit = ?, FixedCharge = ? WHERE TariffID = ?`,
                [name, rate, fixed, req.params.id]
            );
            res.json({ success: true, message: 'Tariff updated' });
        } else {
            const tariff = mockDb.tariffs.find(t => t.id == req.params.id);
            if (tariff) {
                tariff.name = name;
                tariff.rate = rate;
                tariff.fixed = fixed;
            }
            res.json({ success: true, message: 'Tariff updated' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -----------------------------------------------------------------------------
// COMPLAINT ROUTES
// -----------------------------------------------------------------------------

app.get('/api/complaints', async (req, res) => {
    try {
        if (pool) {
            const [result] = await pool.execute(`
                SELECT c.ComplaintID as id, c.CustomerID as customerId, 
                       CONCAT(cu.FirstName, ' ', cu.LastName) as customerName,
                       c.MeterID as meterId, c.Category as category,
                       c.Subject as subject, c.Description as description,
                       c.Priority as priority, c.Status as status,
                       c.CreatedAt as createdAt, c.ResolvedAt as resolvedAt,
                       c.Resolution as resolution
                FROM Complaints c
                INNER JOIN Customers cu ON c.CustomerID = cu.CustomerID
                ORDER BY c.CreatedAt DESC
            `);
            res.json(result);
        } else {
            res.json(mockDb.complaints);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/complaints', async (req, res) => {
    const { customerId, meterId, category, subject, description, priority = 'Medium' } = req.body;
    
    try {
        if (pool) {
            await pool.execute(
                `INSERT INTO Complaints (CustomerID, MeterID, Category, Subject, Description, Priority)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [customerId, meterId, category, subject, description, priority]
            );
            res.json({ success: true, message: 'Complaint registered' });
        } else {
            const id = mockDb.complaints.length + 1;
            mockDb.complaints.push({
                id, customerId, meterId, category, subject, description,
                priority, status: 'Open', createdAt: new Date().toISOString()
            });
            res.json({ success: true, message: 'Complaint registered', id });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/complaints/:id', async (req, res) => {
    const { status, resolution, assignedTo } = req.body;
    
    try {
        if (pool) {
            await pool.execute(
                `UPDATE Complaints 
                 SET Status = ?, Resolution = IFNULL(?, Resolution), AssignedTo = IFNULL(?, AssignedTo),
                     ResolvedAt = CASE WHEN ? IN ('Resolved', 'Closed') THEN NOW() ELSE ResolvedAt END
                 WHERE ComplaintID = ?`,
                [status, resolution, assignedTo, status, req.params.id]
            );
            res.json({ success: true, message: 'Complaint updated' });
        } else {
            const complaint = mockDb.complaints.find(c => c.id == req.params.id);
            if (complaint) {
                complaint.status = status;
                if (resolution) complaint.resolution = resolution;
            }
            res.json({ success: true, message: 'Complaint updated' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -----------------------------------------------------------------------------
// REPORT ROUTES
// -----------------------------------------------------------------------------

app.get('/api/reports/revenue', async (req, res) => {
    const { year, month } = req.query;
    
    try {
        if (pool) {
            let sql = 'SELECT * FROM vw_RevenueSummary';
            const params = [];
            if (year) {
                sql += ' WHERE Year = ?';
                params.push(year);
                if (month) {
                    sql += ' AND Month = ?';
                    params.push(month);
                }
            }
            sql += ' ORDER BY PaymentDay DESC';
            
            const [result] = await pool.execute(sql, params);
            res.json(result);
        } else {
            const revenueByDay = mockDb.payments.reduce((acc, p) => {
                const day = new Date(p.date).toLocaleDateString();
                const existing = acc.find(r => r.PaymentDay === day);
                if (existing) {
                    existing.TotalRevenue += p.amount;
                    existing.TransactionCount++;
                } else {
                    acc.push({ PaymentDay: day, TotalRevenue: p.amount, TransactionCount: 1 });
                }
                return acc;
            }, []);
            res.json(revenueByDay);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reports/defaulters', async (req, res) => {
    const { minDays = 30 } = req.query;
    
    try {
        if (pool) {
            await pool.execute('CALL sp_GetDefaulters(?)', [parseInt(minDays)]);
            const [result] = await pool.execute('CALL sp_GetDefaulters(?)', [parseInt(minDays)]);
            res.json(result[0] || []);
        } else {
            const defaulters = mockDb.bills
                .filter(b => b.status === 'Overdue')
                .map(b => {
                    const customer = mockDb.customers.find(c => c.id === b.customerId);
                    return {
                        CustomerID: b.customerId,
                        CustomerName: customer?.name,
                        TotalOverdue: b.amount - b.paidAmount,
                        OverdueBills: 1
                    };
                });
            res.json(defaulters);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reports/top-consumers', async (req, res) => {
    const { utilityType, limit = 10 } = req.query;
    
    try {
        if (pool) {
            const [result] = await pool.execute(
                'CALL sp_GetTopConsumers(?, ?, NULL, NULL)',
                [utilityType || null, parseInt(limit)]
            );
            res.json(result[0] || []);
        } else {
            const consumers = mockDb.customers.map(c => ({
                CustomerID: c.id,
                CustomerName: c.name,
                TotalConsumption: Math.random() * 1000
            })).sort((a, b) => b.TotalConsumption - a.TotalConsumption).slice(0, limit);
            res.json(consumers);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reports/monthly/:year/:month', async (req, res) => {
    try {
        if (pool) {
            const [result] = await pool.execute(
                'CALL sp_GenerateMonthlyReport(?, ?)',
                [parseInt(req.params.year), parseInt(req.params.month)]
            );
            res.json(result[0] || []);
        } else {
            res.json([]);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -----------------------------------------------------------------------------
// USER ROUTES
// -----------------------------------------------------------------------------

app.post('/api/auth/login', async (req, res) => {
    const { username } = req.body;
    
    try {
        if (pool) {
            const [result] = await pool.execute(
                `SELECT UserID as id, Username as username, FullName as fullName, 
                        Role as role, Email as email
                 FROM Users WHERE Username = ? AND IsActive = 1`,
                [username]
            );
            
            if (result.length > 0) {
                await pool.execute('UPDATE Users SET LastLogin = NOW() WHERE Username = ?', [username]);
                res.json({ success: true, user: result[0] });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } else {
            const user = mockDb.users.find(u => u.username === username);
            if (user) {
                res.json({ success: true, user });
            } else {
                res.json({ 
                    success: true, 
                    user: { id: 0, username, fullName: username, role: 'Admin', email: `${username}@ums.lk` }
                });
            }
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =============================================================================
// SERVER INITIALIZATION
// =============================================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  UTILITY MANAGEMENT SYSTEM (UMS) - Backend Server');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`  🚀 Server running on http://localhost:${PORT}`);
    console.log('');
    
    const dbConnected = await initializeDatabase();
    
    if (!dbConnected) {
        console.log('');
        console.log('  📦 Running with mock data (no database connection)');
        console.log('');
        console.log('  To connect to MySQL Workbench 8.0:');
        console.log('  1. Open MySQL Workbench and run: database/UMS_Database_MySQL.sql');
        console.log('  2. Update password in server.js or create .env file:');
        console.log('     DB_HOST=localhost');
        console.log('     DB_PORT=3306');
        console.log('     DB_USER=root');
        console.log('     DB_PASSWORD=your_password');
        console.log('     DB_NAME=UMS_DB');
        console.log('  3. Restart the server');
    }
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
});
