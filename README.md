# 🏢 Utility Management System (UMS)

A comprehensive, full-stack utility management system for government or private utility providers delivering electricity, water, and gas services to households and businesses.

![UMS Dashboard](https://via.placeholder.com/1200x600/1e293b/ffffff?text=UMS+Portal+Dashboard)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [User Roles](#user-roles)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)

---

## 🌟 Overview

The Utility Management System (UMS) is designed to automate:
- **Customer Management** - Registration, updates, and account management
- **Meter Management** - Installation, readings, and status tracking
- **Billing** - Automatic bill generation based on consumption and tariffs
- **Payments** - Multi-channel payment processing
- **Reporting** - Revenue, consumption, and defaulter reports

### Utilities Supported
| Utility | Unit | Icon |
|---------|------|------|
| ⚡ Electricity | kWh | Yellow |
| 💧 Water | m³ | Blue |
| 🔥 Gas | units | Red |

---

## ✨ Features

### Core Features
- ✅ Multi-utility support (Electricity, Water, Gas)
- ✅ Role-based access control (Admin, Field Officer, Cashier, Manager)
- ✅ Automatic bill calculation with tiered tariffs
- ✅ Real-time dashboard with KPIs
- ✅ Payment tracking and history
- ✅ Customer complaint management
- ✅ Comprehensive reporting system

### Database Features
- ✅ Stored Procedures for complex operations
- ✅ Triggers for audit logging
- ✅ User-Defined Functions for calculations
- ✅ Views for reporting
- ✅ Data integrity constraints

### Frontend Features
- ✅ Modern, responsive UI with Tailwind CSS
- ✅ Interactive charts and analytics
- ✅ Role-specific dashboards
- ✅ Real-time notifications
- ✅ Mobile-friendly design

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│            React + Vite + Tailwind CSS + Recharts               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│              Node.js + Express + mssql                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ SQL Connection
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE                                  │
│     SQL Server (Tables, SPs, Triggers, UDFs, Views)             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI Library
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Recharts** - Charts & Analytics
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web Framework
- **mssql** - SQL Server Driver
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Environment Variables

### Database
- **MySQL 8.0** - Database Engine (MySQL Workbench)
- **SQL** - Stored Procedures, Functions, Triggers

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+ (MySQL Workbench 8.0 CE recommended)
- npm or yarn

### Step 1: Clone the Repository
```bash
cd "C:\Users\USER\Desktop\Main Gemini IMR"
```

### Step 2: Install Backend Dependencies
```bash
cd ums-backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../utility-app
npm install
```

---

## 🗄️ Database Setup

### Step 1: Open MySQL Workbench 8.0 CE

### Step 2: Execute the Database Script
1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Open the file: `database/UMS_Database_MySQL.sql`
4. Execute the script (⚡ icon or Ctrl+Shift+Enter)

This script will:
1. Create the `UMS_DB` database
2. Create all tables with proper constraints
3. Add indexes for performance
4. Create User-Defined Functions (UDFs)
5. Create Stored Procedures
6. Create Triggers for audit logging
7. Create Views for reporting
8. Insert sample data

### Step 3: Configure Backend Connection
Update the password in `ums-backend/server.js` (line ~20):

```javascript
const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'YOUR_MYSQL_PASSWORD',  // Change this!
    database: 'UMS_DB'
};
```

Or create a `.env` file in `ums-backend/`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=UMS_DB
PORT=5000
```

---

## 🚀 Running the Application

### Start Backend Server
```bash
cd ums-backend
npm start
```
Server runs on: `http://localhost:5000`

### Start Frontend Development Server
```bash
cd utility-app
npm run dev
```
Frontend runs on: `http://localhost:5173`

### Demo Mode
If no database is connected, the system runs with mock data automatically.

---

## 👥 User Roles

### 1. Administrator
- Manage customers (CRUD operations)
- Install/remove meters
- Configure tariffs
- Handle complaints
- View system overview

### 2. Field Officer / Meter Reader
- Search customers and meters
- Submit meter readings
- View reading history

### 3. Cashier / Billing Clerk
- Process payments
- View pending bills
- Record transactions
- Multiple payment methods (Cash, Card, Online, Bank Transfer)

### 4. Manager / Decision Maker
- View analytics dashboards
- Generate reports (Revenue, Consumption, Defaulters)
- Monitor KPIs
- Export data

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Initial Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/initial-data` | Load all data for frontend |
| GET | `/dashboard/stats` | Dashboard statistics |

#### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | List all customers |
| POST | `/customers` | Add new customer |
| PUT | `/customers/:id` | Update customer |
| DELETE | `/customers/:id` | Remove customer |

#### Meters
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/meters` | List all meters |
| POST | `/meters` | Install new meter |
| DELETE | `/meters/:id` | Remove meter |

#### Readings & Bills
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/add-reading` | Submit reading & generate bill |
| GET | `/bills` | List all bills |
| GET | `/bills/unpaid` | List unpaid bills |

#### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/pay-bill` | Process payment |
| GET | `/payments` | Payment history |

#### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/revenue` | Revenue report |
| GET | `/reports/defaulters` | Defaulters list |
| GET | `/reports/top-consumers` | Top consumers |

---

## 🗃️ Database Schema

### Tables
| Table | Description |
|-------|-------------|
| `CustomerTypes` | Household, Business, Government |
| `Customers` | Customer information |
| `UtilityTypes` | Electricity, Water, Gas |
| `Meters` | Meter installations |
| `MeterReadings` | Reading history |
| `Tariffs` | Flat rate tariffs |
| `TariffSlabs` | Tiered pricing |
| `Bills` | Generated bills |
| `Payments` | Payment records |
| `Users` | System users |
| `Complaints` | Customer complaints |
| `AuditLog` | Change tracking |

### Key Stored Procedures
| Procedure | Description |
|-----------|-------------|
| `sp_RegisterCustomer` | Register customer with initial meter |
| `sp_SubmitReading` | Submit reading and generate bill |
| `sp_ProcessPayment` | Process bill payment |
| `sp_GetCustomerBillSummary` | Customer billing summary |
| `sp_UpdateOverdueBills` | Mark bills as overdue |
| `sp_GenerateMonthlyReport` | Monthly financial report |
| `sp_GetTopConsumers` | Top consumers report |
| `sp_GetDefaulters` | Defaulters report |

### Key Views
| View | Description |
|------|-------------|
| `vw_CustomerSummary` | Customer overview with stats |
| `vw_MeterDetails` | Meter information with customer |
| `vw_BillDetails` | Complete bill information |
| `vw_PaymentHistory` | Payment history with details |
| `vw_RevenueSummary` | Revenue by period |
| `vw_ConsumptionSummary` | Consumption analytics |
| `vw_OverdueBills` | Overdue bills list |
| `vw_DashboardStats` | Dashboard KPIs |

---

## 📊 Sample Login Credentials

The system doesn't require login credentials - simply click on any role to access that dashboard.

| Role | Access Level |
|------|--------------|
| Administrator | Full system access |
| Field Officer | Meter readings only |
| Cashier | Payments and billing |
| Manager | Reports and analytics |

---

## 🔒 Security Features

- Input validation on all forms
- SQL injection prevention with parameterized queries
- Audit logging for all changes
- Role-based access control

---

## 📈 Future Enhancements

- [ ] Customer self-service portal
- [ ] SMS/Email notifications
- [ ] Mobile app for field officers
- [ ] Advanced analytics with ML
- [ ] Multi-language support
- [ ] Payment gateway integration

---

## 📝 License

This project is for educational purposes.

---

## 👨‍💻 Author

Built with ❤️ for Utility Management Excellence

---

## 🆘 Support

For issues or questions, please check the code comments or raise an issue in the repository.

