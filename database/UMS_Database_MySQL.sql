-- ============================================================================
-- UTILITY MANAGEMENT SYSTEM (UMS) - COMPLETE DATABASE SCHEMA
-- MySQL 8.0 Database with Tables, Triggers, Stored Procedures, Functions, Views
-- ============================================================================

-- Create Database
DROP DATABASE IF EXISTS UMS_DB;
CREATE DATABASE UMS_DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE UMS_DB;

-- ============================================================================
-- SECTION 1: CORE TABLES
-- ============================================================================

-- 1.1 Customer Types (Household, Business, Government)
CREATE TABLE CustomerTypes (
    TypeID INT PRIMARY KEY AUTO_INCREMENT,
    TypeName VARCHAR(50) NOT NULL UNIQUE,
    Description VARCHAR(200),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 1.2 Customers
CREATE TABLE Customers (
    CustomerID VARCHAR(20) PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    CustomerTypeID INT NOT NULL,
    Email VARCHAR(150),
    Phone VARCHAR(20) NOT NULL,
    Address VARCHAR(300) NOT NULL,
    City VARCHAR(100) DEFAULT 'Colombo',
    PostalCode VARCHAR(10),
    NIC VARCHAR(20),
    RegistrationDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status VARCHAR(20) DEFAULT 'Active',
    OutstandingBalance DECIMAL(12,2) DEFAULT 0.00,
    FOREIGN KEY (CustomerTypeID) REFERENCES CustomerTypes(TypeID),
    CONSTRAINT chk_customer_status CHECK (Status IN ('Active', 'Inactive', 'Suspended'))
);

-- 1.3 Utility Types (Electricity, Water, Gas)
CREATE TABLE UtilityTypes (
    UtilityTypeID INT PRIMARY KEY AUTO_INCREMENT,
    UtilityName VARCHAR(50) NOT NULL UNIQUE,
    Unit VARCHAR(20) NOT NULL,
    Description VARCHAR(200),
    IconColor VARCHAR(20) DEFAULT '#3B82F6'
);

-- 1.4 Tariff Slabs (for tiered pricing)
CREATE TABLE TariffSlabs (
    SlabID INT PRIMARY KEY AUTO_INCREMENT,
    UtilityTypeID INT NOT NULL,
    SlabName VARCHAR(100) NOT NULL,
    MinUnits DECIMAL(10,2) NOT NULL,
    MaxUnits DECIMAL(10,2),
    RatePerUnit DECIMAL(10,4) NOT NULL,
    FixedCharge DECIMAL(10,2) DEFAULT 0.00,
    CustomerTypeID INT,
    EffectiveFrom DATE NOT NULL,
    EffectiveTo DATE,
    IsActive TINYINT(1) DEFAULT 1,
    FOREIGN KEY (UtilityTypeID) REFERENCES UtilityTypes(UtilityTypeID),
    FOREIGN KEY (CustomerTypeID) REFERENCES CustomerTypes(TypeID)
);

-- 1.5 Tariffs (Simple flat rate reference)
CREATE TABLE Tariffs (
    TariffID INT PRIMARY KEY AUTO_INCREMENT,
    UtilityTypeID INT NOT NULL,
    TariffName VARCHAR(100) NOT NULL,
    RatePerUnit DECIMAL(10,4) NOT NULL,
    FixedCharge DECIMAL(10,2) DEFAULT 0.00,
    Description VARCHAR(200),
    EffectiveFrom DATE DEFAULT (CURRENT_DATE),
    IsActive TINYINT(1) DEFAULT 1,
    FOREIGN KEY (UtilityTypeID) REFERENCES UtilityTypes(UtilityTypeID)
);

-- 1.6 Meters (CASCADE DELETE when customer is deleted)
CREATE TABLE Meters (
    MeterID VARCHAR(30) PRIMARY KEY,
    CustomerID VARCHAR(20) NOT NULL,
    UtilityTypeID INT NOT NULL,
    MeterSerialNo VARCHAR(50),
    InstallationDate DATE DEFAULT (CURRENT_DATE),
    LastReadingValue DECIMAL(12,2) DEFAULT 0.00,
    LastReadingDate DATETIME,
    Status VARCHAR(20) DEFAULT 'Active',
    Location VARCHAR(200),
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID) ON DELETE CASCADE,
    FOREIGN KEY (UtilityTypeID) REFERENCES UtilityTypes(UtilityTypeID),
    CONSTRAINT chk_meter_status CHECK (Status IN ('Active', 'Inactive', 'Faulty', 'Replaced'))
);

-- 1.7 Meter Readings (CASCADE DELETE when meter is deleted)
CREATE TABLE MeterReadings (
    ReadingID VARCHAR(30) PRIMARY KEY,
    MeterID VARCHAR(30) NOT NULL,
    PreviousReading DECIMAL(12,2) NOT NULL,
    CurrentReading DECIMAL(12,2) NOT NULL,
    Consumption DECIMAL(12,2) NOT NULL,
    ReadingDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    ReadBy VARCHAR(100),
    IsEstimated TINYINT(1) DEFAULT 0,
    Notes VARCHAR(500),
    FOREIGN KEY (MeterID) REFERENCES Meters(MeterID) ON DELETE CASCADE
);

-- 1.8 Bills (CASCADE DELETE when customer is deleted)
CREATE TABLE Bills (
    BillID VARCHAR(30) PRIMARY KEY,
    CustomerID VARCHAR(20) NOT NULL,
    MeterID VARCHAR(30),
    ReadingID VARCHAR(30),
    BillingPeriodStart DATE NOT NULL,
    BillingPeriodEnd DATE NOT NULL,
    Consumption DECIMAL(12,2) NOT NULL,
    UnitCharge DECIMAL(12,2) NOT NULL,
    FixedCharge DECIMAL(10,2) DEFAULT 0.00,
    Taxes DECIMAL(10,2) DEFAULT 0.00,
    TotalAmount DECIMAL(12,2) NOT NULL,
    DueDate DATE NOT NULL,
    GeneratedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status VARCHAR(20) DEFAULT 'Unpaid',
    PaidAmount DECIMAL(12,2) DEFAULT 0.00,
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID) ON DELETE CASCADE,
    FOREIGN KEY (MeterID) REFERENCES Meters(MeterID) ON DELETE SET NULL,
    FOREIGN KEY (ReadingID) REFERENCES MeterReadings(ReadingID) ON DELETE SET NULL,
    CONSTRAINT chk_bill_status CHECK (Status IN ('Unpaid', 'Paid', 'Overdue', 'Cancelled', 'Partial'))
);

-- 1.9 Payments (CASCADE DELETE when bill is deleted)
CREATE TABLE Payments (
    PaymentID VARCHAR(30) PRIMARY KEY,
    BillID VARCHAR(30) NOT NULL,
    CustomerID VARCHAR(20) NOT NULL,
    Amount DECIMAL(12,2) NOT NULL,
    PaymentMethod VARCHAR(30),
    PaymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    TransactionRef VARCHAR(50),
    ProcessedBy VARCHAR(100),
    Notes VARCHAR(200),
    FOREIGN KEY (BillID) REFERENCES Bills(BillID) ON DELETE CASCADE,
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID) ON DELETE CASCADE,
    CONSTRAINT chk_payment_method CHECK (PaymentMethod IN ('Cash', 'Card', 'Online', 'Bank Transfer', 'Cheque'))
);

-- 1.10 Users (System Users)
CREATE TABLE Users (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(50) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE,
    FullName VARCHAR(100) NOT NULL,
    Role VARCHAR(30) NOT NULL,
    Phone VARCHAR(20),
    IsActive TINYINT(1) DEFAULT 1,
    LastLogin DATETIME,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_role CHECK (Role IN ('Admin', 'FieldOfficer', 'Cashier', 'Manager'))
);

-- 1.11 Complaints (CASCADE DELETE when customer is deleted)
CREATE TABLE Complaints (
    ComplaintID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID VARCHAR(20) NOT NULL,
    MeterID VARCHAR(30),
    Category VARCHAR(50) NOT NULL,
    Subject VARCHAR(200) NOT NULL,
    Description VARCHAR(1000) NOT NULL,
    Priority VARCHAR(20) DEFAULT 'Medium',
    Status VARCHAR(30) DEFAULT 'Open',
    AssignedTo INT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    ResolvedAt DATETIME,
    Resolution VARCHAR(1000),
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID) ON DELETE CASCADE,
    FOREIGN KEY (MeterID) REFERENCES Meters(MeterID) ON DELETE SET NULL,
    FOREIGN KEY (AssignedTo) REFERENCES Users(UserID) ON DELETE SET NULL,
    CONSTRAINT chk_complaint_category CHECK (Category IN ('Billing', 'Meter', 'Service', 'Quality', 'Other')),
    CONSTRAINT chk_complaint_priority CHECK (Priority IN ('Low', 'Medium', 'High', 'Critical')),
    CONSTRAINT chk_complaint_status CHECK (Status IN ('Open', 'In Progress', 'Resolved', 'Closed'))
);

-- 1.12 Audit Log
CREATE TABLE AuditLog (
    LogID INT PRIMARY KEY AUTO_INCREMENT,
    TableName VARCHAR(50) NOT NULL,
    RecordID VARCHAR(50) NOT NULL,
    Action VARCHAR(20) NOT NULL,
    OldValues JSON,
    NewValues JSON,
    ChangedBy VARCHAR(100) DEFAULT (CURRENT_USER()),
    ChangedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_audit_action CHECK (Action IN ('INSERT', 'UPDATE', 'DELETE'))
);

-- ============================================================================
-- SECTION 2: INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IX_Customers_Status ON Customers(Status);
CREATE INDEX IX_Customers_CustomerType ON Customers(CustomerTypeID);
CREATE INDEX IX_Meters_Customer ON Meters(CustomerID);
CREATE INDEX IX_Meters_UtilityType ON Meters(UtilityTypeID);
CREATE INDEX IX_MeterReadings_Meter ON MeterReadings(MeterID);
CREATE INDEX IX_MeterReadings_Date ON MeterReadings(ReadingDate);
CREATE INDEX IX_Bills_Customer ON Bills(CustomerID);
CREATE INDEX IX_Bills_Status ON Bills(Status);
CREATE INDEX IX_Bills_DueDate ON Bills(DueDate);
CREATE INDEX IX_Payments_Bill ON Payments(BillID);
CREATE INDEX IX_Payments_Date ON Payments(PaymentDate);
CREATE INDEX IX_Complaints_Customer ON Complaints(CustomerID);
CREATE INDEX IX_Complaints_Status ON Complaints(Status);

-- ============================================================================
-- SECTION 3: USER-DEFINED FUNCTIONS (UDFs)
-- ============================================================================

DELIMITER //

-- 3.1 Get Customer Outstanding Balance
CREATE FUNCTION fn_GetCustomerBalance(p_CustomerID VARCHAR(20))
RETURNS DECIMAL(12,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_Balance DECIMAL(12,2);
    
    SELECT IFNULL(SUM(TotalAmount - PaidAmount), 0) INTO v_Balance
    FROM Bills
    WHERE CustomerID = p_CustomerID
      AND Status IN ('Unpaid', 'Overdue', 'Partial');
    
    RETURN v_Balance;
END //

-- 3.2 Calculate Days Overdue
CREATE FUNCTION fn_GetDaysOverdue(p_BillID VARCHAR(30))
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_Days INT DEFAULT 0;
    DECLARE v_DueDate DATE;
    
    SELECT DueDate INTO v_DueDate 
    FROM Bills 
    WHERE BillID = p_BillID AND Status IN ('Unpaid', 'Overdue');
    
    IF v_DueDate IS NOT NULL AND v_DueDate < CURDATE() THEN
        SET v_Days = DATEDIFF(CURDATE(), v_DueDate);
    END IF;
    
    RETURN v_Days;
END //

-- 3.3 Get Total Consumption for Customer
CREATE FUNCTION fn_GetCustomerConsumption(
    p_CustomerID VARCHAR(20),
    p_StartDate DATE,
    p_EndDate DATE
)
RETURNS DECIMAL(12,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_TotalConsumption DECIMAL(12,2);
    
    SELECT IFNULL(SUM(mr.Consumption), 0) INTO v_TotalConsumption
    FROM MeterReadings mr
    INNER JOIN Meters m ON mr.MeterID = m.MeterID
    WHERE m.CustomerID = p_CustomerID
      AND mr.ReadingDate BETWEEN p_StartDate AND p_EndDate;
    
    RETURN v_TotalConsumption;
END //

DELIMITER ;

-- ============================================================================
-- SECTION 4: STORED PROCEDURES
-- ============================================================================

DELIMITER //

-- 4.1 Register New Customer with Initial Meter
CREATE PROCEDURE sp_RegisterCustomer(
    IN p_FirstName VARCHAR(100),
    IN p_LastName VARCHAR(100),
    IN p_CustomerTypeID INT,
    IN p_Email VARCHAR(150),
    IN p_Phone VARCHAR(20),
    IN p_Address VARCHAR(300),
    IN p_City VARCHAR(100),
    IN p_NIC VARCHAR(20),
    IN p_UtilityTypeID INT,
    OUT p_CustomerID VARCHAR(20)
)
BEGIN
    DECLARE v_MeterID VARCHAR(30);
    DECLARE v_Count INT;
    
    -- Generate Customer ID
    SELECT COUNT(*) + 1 INTO v_Count FROM Customers;
    SET p_CustomerID = CONCAT('CUS-', DATE_FORMAT(NOW(), '%Y%m'), '-', LPAD(v_Count, 4, '0'));
    
    -- Insert Customer
    INSERT INTO Customers (CustomerID, FirstName, LastName, CustomerTypeID, Email, Phone, Address, City, NIC)
    VALUES (p_CustomerID, p_FirstName, p_LastName, p_CustomerTypeID, p_Email, p_Phone, p_Address, IFNULL(p_City, 'Colombo'), p_NIC);
    
    -- If utility type specified, create meter
    IF p_UtilityTypeID IS NOT NULL THEN
        SET v_MeterID = CONCAT('MTR-', 
            CASE p_UtilityTypeID 
                WHEN 1 THEN 'E' 
                WHEN 2 THEN 'W' 
                WHEN 3 THEN 'G' 
                ELSE 'X' 
            END, '-', LPAD(FLOOR(RAND() * 1000000), 6, '0'));
        
        INSERT INTO Meters (MeterID, CustomerID, UtilityTypeID, MeterSerialNo, Location)
        VALUES (v_MeterID, p_CustomerID, p_UtilityTypeID, CONCAT('SN-', UUID()), p_Address);
    END IF;
    
    SELECT p_CustomerID AS CustomerID, 'Customer registered successfully' AS Message;
END //

-- 4.2 Submit Meter Reading and Generate Bill
CREATE PROCEDURE sp_SubmitReading(
    IN p_MeterID VARCHAR(30),
    IN p_CurrentReading DECIMAL(12,2),
    IN p_ReadBy VARCHAR(100),
    OUT p_BillID VARCHAR(30)
)
BEGIN
    DECLARE v_CustomerID VARCHAR(20);
    DECLARE v_UtilityTypeID INT;
    DECLARE v_PreviousReading DECIMAL(12,2);
    DECLARE v_Consumption DECIMAL(12,2);
    DECLARE v_ReadingID VARCHAR(30);
    DECLARE v_UnitCharge DECIMAL(12,2);
    DECLARE v_FixedCharge DECIMAL(10,2);
    DECLARE v_TotalAmount DECIMAL(12,2);
    DECLARE v_Rate DECIMAL(10,4);
    
    -- Get meter info
    SELECT m.CustomerID, m.UtilityTypeID, m.LastReadingValue
    INTO v_CustomerID, v_UtilityTypeID, v_PreviousReading
    FROM Meters m
    WHERE m.MeterID = p_MeterID AND m.Status = 'Active';
    
    IF v_CustomerID IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Meter not found or inactive';
    END IF;
    
    -- Validate reading
    IF p_CurrentReading < v_PreviousReading THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Current reading cannot be less than previous reading';
    END IF;
    
    -- Calculate consumption
    SET v_Consumption = p_CurrentReading - v_PreviousReading;
    
    -- Generate IDs
    SET v_ReadingID = CONCAT('RDG-', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'), '-', RIGHT(p_MeterID, 4));
    SET p_BillID = CONCAT('BILL-', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'), '-', RIGHT(p_MeterID, 4));
    
    -- Insert Reading
    INSERT INTO MeterReadings (ReadingID, MeterID, PreviousReading, CurrentReading, Consumption, ReadBy)
    VALUES (v_ReadingID, p_MeterID, v_PreviousReading, p_CurrentReading, v_Consumption, IFNULL(p_ReadBy, 'System'));
    
    -- Update Meter
    UPDATE Meters SET LastReadingValue = p_CurrentReading, LastReadingDate = NOW() WHERE MeterID = p_MeterID;
    
    -- Get tariff rates
    SELECT RatePerUnit, FixedCharge INTO v_Rate, v_FixedCharge
    FROM Tariffs
    WHERE UtilityTypeID = v_UtilityTypeID AND IsActive = 1
    ORDER BY EffectiveFrom DESC
    LIMIT 1;
    
    SET v_UnitCharge = v_Consumption * IFNULL(v_Rate, 25);
    SET v_TotalAmount = v_UnitCharge + IFNULL(v_FixedCharge, 0);
    
    -- Generate Bill
    INSERT INTO Bills (BillID, CustomerID, MeterID, ReadingID, BillingPeriodStart, BillingPeriodEnd, 
                      Consumption, UnitCharge, FixedCharge, TotalAmount, DueDate)
    VALUES (p_BillID, v_CustomerID, p_MeterID, v_ReadingID, 
            DATE_SUB(CURDATE(), INTERVAL 1 MONTH), CURDATE(),
            v_Consumption, v_UnitCharge, IFNULL(v_FixedCharge, 0), v_TotalAmount,
            DATE_ADD(CURDATE(), INTERVAL 30 DAY));
    
    -- Update customer outstanding balance
    UPDATE Customers SET OutstandingBalance = OutstandingBalance + v_TotalAmount WHERE CustomerID = v_CustomerID;
    
    SELECT p_BillID AS BillID, v_TotalAmount AS Amount, v_Consumption AS Consumption, 'Bill generated successfully' AS Message;
END //

-- 4.3 Process Payment
CREATE PROCEDURE sp_ProcessPayment(
    IN p_BillID VARCHAR(30),
    IN p_Amount DECIMAL(12,2),
    IN p_PaymentMethod VARCHAR(30),
    IN p_ProcessedBy VARCHAR(100),
    IN p_TransactionRef VARCHAR(50)
)
BEGIN
    DECLARE v_CustomerID VARCHAR(20);
    DECLARE v_PaymentID VARCHAR(30);
    DECLARE v_BillTotal DECIMAL(12,2);
    DECLARE v_PaidAmount DECIMAL(12,2);
    
    -- Get bill info
    SELECT CustomerID, TotalAmount, PaidAmount INTO v_CustomerID, v_BillTotal, v_PaidAmount
    FROM Bills WHERE BillID = p_BillID AND Status IN ('Unpaid', 'Overdue', 'Partial');
    
    IF v_CustomerID IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Bill not found or already paid';
    END IF;
    
    -- Generate Payment ID
    SET v_PaymentID = CONCAT('PAY-', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'), '-', RIGHT(p_BillID, 4));
    
    -- Insert Payment
    INSERT INTO Payments (PaymentID, BillID, CustomerID, Amount, PaymentMethod, ProcessedBy, TransactionRef)
    VALUES (v_PaymentID, p_BillID, v_CustomerID, p_Amount, IFNULL(p_PaymentMethod, 'Cash'), 
            IFNULL(p_ProcessedBy, 'System'), p_TransactionRef);
    
    -- Update Bill
    UPDATE Bills 
    SET PaidAmount = PaidAmount + p_Amount,
        Status = CASE 
            WHEN PaidAmount + p_Amount >= TotalAmount THEN 'Paid'
            ELSE 'Partial'
        END
    WHERE BillID = p_BillID;
    
    -- Update customer balance
    UPDATE Customers SET OutstandingBalance = OutstandingBalance - p_Amount WHERE CustomerID = v_CustomerID;
    
    SELECT v_PaymentID AS PaymentID, 'Payment processed successfully' AS Message;
END //

-- 4.4 Delete Customer (with all related data)
CREATE PROCEDURE sp_DeleteCustomer(IN p_CustomerID VARCHAR(20))
BEGIN
    -- Due to CASCADE DELETE, this will remove all related records
    DELETE FROM Customers WHERE CustomerID = p_CustomerID;
    SELECT 'Customer and all related data deleted successfully' AS Message;
END //

-- 4.5 Get Customer Bill Summary
CREATE PROCEDURE sp_GetCustomerBillSummary(IN p_CustomerID VARCHAR(20))
BEGIN
    SELECT 
        c.CustomerID,
        CONCAT(c.FirstName, ' ', c.LastName) AS CustomerName,
        c.OutstandingBalance,
        COUNT(b.BillID) AS TotalBills,
        SUM(CASE WHEN b.Status = 'Paid' THEN 1 ELSE 0 END) AS PaidBills,
        SUM(CASE WHEN b.Status IN ('Unpaid', 'Overdue') THEN 1 ELSE 0 END) AS UnpaidBills,
        IFNULL(SUM(b.TotalAmount), 0) AS TotalBilled,
        IFNULL(SUM(b.PaidAmount), 0) AS TotalPaid
    FROM Customers c
    LEFT JOIN Bills b ON c.CustomerID = b.CustomerID
    WHERE c.CustomerID = p_CustomerID
    GROUP BY c.CustomerID, c.FirstName, c.LastName, c.OutstandingBalance;
END //

-- 4.6 Mark Overdue Bills
CREATE PROCEDURE sp_UpdateOverdueBills()
BEGIN
    DECLARE v_Count INT;
    
    UPDATE Bills
    SET Status = 'Overdue'
    WHERE Status = 'Unpaid' AND DueDate < CURDATE();
    
    SET v_Count = ROW_COUNT();
    SELECT v_Count AS BillsMarkedOverdue;
END //

-- 4.7 Generate Monthly Report
CREATE PROCEDURE sp_GenerateMonthlyReport(IN p_Year INT, IN p_Month INT)
BEGIN
    SELECT 
        ut.UtilityName,
        COUNT(DISTINCT b.BillID) AS BillsGenerated,
        IFNULL(SUM(b.Consumption), 0) AS TotalConsumption,
        IFNULL(SUM(b.TotalAmount), 0) AS TotalBilled,
        IFNULL(SUM(b.PaidAmount), 0) AS TotalCollected,
        IFNULL(SUM(b.TotalAmount), 0) - IFNULL(SUM(b.PaidAmount), 0) AS Outstanding
    FROM Bills b
    INNER JOIN Meters m ON b.MeterID = m.MeterID
    INNER JOIN UtilityTypes ut ON m.UtilityTypeID = ut.UtilityTypeID
    WHERE YEAR(b.GeneratedDate) = p_Year AND MONTH(b.GeneratedDate) = p_Month
    GROUP BY ut.UtilityName
    ORDER BY TotalBilled DESC;
END //

-- 4.8 Get Top Consumers
CREATE PROCEDURE sp_GetTopConsumers(
    IN p_UtilityTypeID INT,
    IN p_TopN INT,
    IN p_StartDate DATE,
    IN p_EndDate DATE
)
BEGIN
    SET p_StartDate = IFNULL(p_StartDate, DATE_SUB(CURDATE(), INTERVAL 1 MONTH));
    SET p_EndDate = IFNULL(p_EndDate, CURDATE());
    SET p_TopN = IFNULL(p_TopN, 10);
    
    SELECT 
        c.CustomerID,
        CONCAT(c.FirstName, ' ', c.LastName) AS CustomerName,
        ct.TypeName AS CustomerType,
        ut.UtilityName,
        SUM(mr.Consumption) AS TotalConsumption,
        ut.Unit
    FROM Customers c
    INNER JOIN CustomerTypes ct ON c.CustomerTypeID = ct.TypeID
    INNER JOIN Meters m ON c.CustomerID = m.CustomerID
    INNER JOIN MeterReadings mr ON m.MeterID = mr.MeterID
    INNER JOIN UtilityTypes ut ON m.UtilityTypeID = ut.UtilityTypeID
    WHERE mr.ReadingDate BETWEEN p_StartDate AND p_EndDate
      AND (p_UtilityTypeID IS NULL OR m.UtilityTypeID = p_UtilityTypeID)
    GROUP BY c.CustomerID, c.FirstName, c.LastName, ct.TypeName, ut.UtilityName, ut.Unit
    ORDER BY TotalConsumption DESC
    LIMIT p_TopN;
END //

-- 4.9 Get Defaulters (Overdue Customers)
CREATE PROCEDURE sp_GetDefaulters(IN p_MinDaysOverdue INT)
BEGIN
    SET p_MinDaysOverdue = IFNULL(p_MinDaysOverdue, 30);
    
    SELECT 
        c.CustomerID,
        CONCAT(c.FirstName, ' ', c.LastName) AS CustomerName,
        c.Phone,
        c.Address,
        COUNT(b.BillID) AS OverdueBills,
        SUM(b.TotalAmount - b.PaidAmount) AS TotalOverdue,
        MIN(b.DueDate) AS OldestDueDate,
        DATEDIFF(CURDATE(), MIN(b.DueDate)) AS MaxDaysOverdue
    FROM Customers c
    INNER JOIN Bills b ON c.CustomerID = b.CustomerID
    WHERE b.Status = 'Overdue'
    GROUP BY c.CustomerID, c.FirstName, c.LastName, c.Phone, c.Address
    HAVING DATEDIFF(CURDATE(), MIN(b.DueDate)) >= p_MinDaysOverdue
    ORDER BY TotalOverdue DESC;
END //

DELIMITER ;

-- ============================================================================
-- SECTION 5: TRIGGERS
-- ============================================================================

DELIMITER //

-- 5.1 Audit Trigger for Customers - INSERT
CREATE TRIGGER trg_Customers_Insert
AFTER INSERT ON Customers
FOR EACH ROW
BEGIN
    INSERT INTO AuditLog (TableName, RecordID, Action, NewValues)
    VALUES ('Customers', NEW.CustomerID, 'INSERT', 
            JSON_OBJECT('CustomerID', NEW.CustomerID, 'FirstName', NEW.FirstName, 
                       'LastName', NEW.LastName, 'Phone', NEW.Phone));
END //

-- 5.2 Audit Trigger for Customers - UPDATE
CREATE TRIGGER trg_Customers_Update
AFTER UPDATE ON Customers
FOR EACH ROW
BEGIN
    INSERT INTO AuditLog (TableName, RecordID, Action, OldValues, NewValues)
    VALUES ('Customers', NEW.CustomerID, 'UPDATE',
            JSON_OBJECT('FirstName', OLD.FirstName, 'LastName', OLD.LastName, 
                       'Phone', OLD.Phone, 'Status', OLD.Status),
            JSON_OBJECT('FirstName', NEW.FirstName, 'LastName', NEW.LastName, 
                       'Phone', NEW.Phone, 'Status', NEW.Status));
END //

-- 5.3 Audit Trigger for Customers - DELETE
CREATE TRIGGER trg_Customers_Delete
AFTER DELETE ON Customers
FOR EACH ROW
BEGIN
    INSERT INTO AuditLog (TableName, RecordID, Action, OldValues)
    VALUES ('Customers', OLD.CustomerID, 'DELETE',
            JSON_OBJECT('CustomerID', OLD.CustomerID, 'FirstName', OLD.FirstName, 
                       'LastName', OLD.LastName));
END //

-- 5.4 Audit Trigger for Bills - INSERT
CREATE TRIGGER trg_Bills_Insert
AFTER INSERT ON Bills
FOR EACH ROW
BEGIN
    INSERT INTO AuditLog (TableName, RecordID, Action, NewValues)
    VALUES ('Bills', NEW.BillID, 'INSERT',
            JSON_OBJECT('BillID', NEW.BillID, 'CustomerID', NEW.CustomerID, 
                       'TotalAmount', NEW.TotalAmount, 'Status', NEW.Status));
END //

-- 5.5 Audit Trigger for Bills - UPDATE
CREATE TRIGGER trg_Bills_Update
AFTER UPDATE ON Bills
FOR EACH ROW
BEGIN
    INSERT INTO AuditLog (TableName, RecordID, Action, OldValues, NewValues)
    VALUES ('Bills', NEW.BillID, 'UPDATE',
            JSON_OBJECT('Status', OLD.Status, 'PaidAmount', OLD.PaidAmount),
            JSON_OBJECT('Status', NEW.Status, 'PaidAmount', NEW.PaidAmount));
END //

-- 5.6 Auto-calculate consumption on reading insert
CREATE TRIGGER trg_MeterReadings_Consumption
BEFORE INSERT ON MeterReadings
FOR EACH ROW
BEGIN
    IF NEW.Consumption IS NULL OR NEW.Consumption = 0 THEN
        SET NEW.Consumption = NEW.CurrentReading - NEW.PreviousReading;
    END IF;
END //

DELIMITER ;

-- ============================================================================
-- SECTION 6: VIEWS
-- ============================================================================

-- 6.1 Customer Summary View
CREATE VIEW vw_CustomerSummary AS
SELECT 
    c.CustomerID,
    CONCAT(c.FirstName, ' ', c.LastName) AS FullName,
    ct.TypeName AS CustomerType,
    c.Email,
    c.Phone,
    c.Address,
    c.City,
    c.Status,
    c.OutstandingBalance,
    c.RegistrationDate,
    (SELECT COUNT(*) FROM Meters WHERE CustomerID = c.CustomerID AND Status = 'Active') AS ActiveMeters,
    (SELECT COUNT(*) FROM Bills WHERE CustomerID = c.CustomerID) AS TotalBills,
    (SELECT COUNT(*) FROM Bills WHERE CustomerID = c.CustomerID AND Status IN ('Unpaid', 'Overdue')) AS UnpaidBills
FROM Customers c
INNER JOIN CustomerTypes ct ON c.CustomerTypeID = ct.TypeID;

-- 6.2 Meter Details View
CREATE VIEW vw_MeterDetails AS
SELECT 
    m.MeterID,
    m.MeterSerialNo,
    c.CustomerID,
    CONCAT(c.FirstName, ' ', c.LastName) AS CustomerName,
    ut.UtilityName,
    ut.Unit,
    m.LastReadingValue,
    m.LastReadingDate,
    m.InstallationDate,
    m.Status,
    m.Location
FROM Meters m
INNER JOIN Customers c ON m.CustomerID = c.CustomerID
INNER JOIN UtilityTypes ut ON m.UtilityTypeID = ut.UtilityTypeID;

-- 6.3 Bill Details View
CREATE VIEW vw_BillDetails AS
SELECT 
    b.BillID,
    b.CustomerID,
    CONCAT(c.FirstName, ' ', c.LastName) AS CustomerName,
    c.Phone AS CustomerPhone,
    b.MeterID,
    ut.UtilityName,
    ut.Unit,
    b.BillingPeriodStart,
    b.BillingPeriodEnd,
    b.Consumption,
    b.UnitCharge,
    b.FixedCharge,
    b.Taxes,
    b.TotalAmount,
    b.PaidAmount,
    b.TotalAmount - b.PaidAmount AS BalanceDue,
    b.DueDate,
    b.GeneratedDate,
    b.Status,
    CASE WHEN b.DueDate < CURDATE() AND b.Status != 'Paid' 
         THEN DATEDIFF(CURDATE(), b.DueDate) ELSE 0 END AS DaysOverdue
FROM Bills b
INNER JOIN Customers c ON b.CustomerID = c.CustomerID
LEFT JOIN Meters m ON b.MeterID = m.MeterID
LEFT JOIN UtilityTypes ut ON m.UtilityTypeID = ut.UtilityTypeID;

-- 6.4 Payment History View
CREATE VIEW vw_PaymentHistory AS
SELECT 
    p.PaymentID,
    p.BillID,
    b.CustomerID,
    CONCAT(c.FirstName, ' ', c.LastName) AS CustomerName,
    IFNULL(ut.UtilityName, 'N/A') AS UtilityName,
    p.Amount,
    p.PaymentMethod,
    p.PaymentDate,
    p.ProcessedBy,
    p.TransactionRef
FROM Payments p
INNER JOIN Bills b ON p.BillID = b.BillID
INNER JOIN Customers c ON b.CustomerID = c.CustomerID
LEFT JOIN Meters m ON b.MeterID = m.MeterID
LEFT JOIN UtilityTypes ut ON m.UtilityTypeID = ut.UtilityTypeID;

-- 6.5 Revenue Summary View
CREATE VIEW vw_RevenueSummary AS
SELECT 
    DATE(p.PaymentDate) AS PaymentDay,
    YEAR(p.PaymentDate) AS Year,
    MONTH(p.PaymentDate) AS Month,
    IFNULL(ut.UtilityName, 'N/A') AS UtilityName,
    COUNT(p.PaymentID) AS TransactionCount,
    SUM(p.Amount) AS TotalRevenue
FROM Payments p
INNER JOIN Bills b ON p.BillID = b.BillID
LEFT JOIN Meters m ON b.MeterID = m.MeterID
LEFT JOIN UtilityTypes ut ON m.UtilityTypeID = ut.UtilityTypeID
GROUP BY DATE(p.PaymentDate), YEAR(p.PaymentDate), MONTH(p.PaymentDate), ut.UtilityName;

-- 6.6 Consumption Summary View
CREATE VIEW vw_ConsumptionSummary AS
SELECT 
    YEAR(mr.ReadingDate) AS Year,
    MONTH(mr.ReadingDate) AS Month,
    ut.UtilityName,
    ut.Unit,
    COUNT(mr.ReadingID) AS ReadingsCount,
    SUM(mr.Consumption) AS TotalConsumption,
    AVG(mr.Consumption) AS AvgConsumption,
    MAX(mr.Consumption) AS MaxConsumption,
    MIN(mr.Consumption) AS MinConsumption
FROM MeterReadings mr
INNER JOIN Meters m ON mr.MeterID = m.MeterID
INNER JOIN UtilityTypes ut ON m.UtilityTypeID = ut.UtilityTypeID
GROUP BY YEAR(mr.ReadingDate), MONTH(mr.ReadingDate), ut.UtilityName, ut.Unit;

-- 6.7 Overdue Bills View
CREATE VIEW vw_OverdueBills AS
SELECT 
    b.BillID,
    c.CustomerID,
    CONCAT(c.FirstName, ' ', c.LastName) AS CustomerName,
    c.Phone,
    c.Email,
    IFNULL(ut.UtilityName, 'N/A') AS UtilityName,
    b.TotalAmount,
    b.PaidAmount,
    b.TotalAmount - b.PaidAmount AS AmountDue,
    b.DueDate,
    DATEDIFF(CURDATE(), b.DueDate) AS DaysOverdue
FROM Bills b
INNER JOIN Customers c ON b.CustomerID = c.CustomerID
LEFT JOIN Meters m ON b.MeterID = m.MeterID
LEFT JOIN UtilityTypes ut ON m.UtilityTypeID = ut.UtilityTypeID
WHERE b.Status IN ('Unpaid', 'Overdue') AND b.DueDate < CURDATE();

-- 6.8 Dashboard Statistics View
CREATE VIEW vw_DashboardStats AS
SELECT 
    (SELECT COUNT(*) FROM Customers WHERE Status = 'Active') AS TotalActiveCustomers,
    (SELECT COUNT(*) FROM Meters WHERE Status = 'Active') AS TotalActiveMeters,
    (SELECT COUNT(*) FROM Bills WHERE Status = 'Unpaid') AS UnpaidBills,
    (SELECT COUNT(*) FROM Bills WHERE Status = 'Overdue') AS OverdueBills,
    (SELECT IFNULL(SUM(TotalAmount - PaidAmount), 0) FROM Bills WHERE Status IN ('Unpaid', 'Overdue')) AS TotalOutstanding,
    (SELECT IFNULL(SUM(Amount), 0) FROM Payments WHERE DATE(PaymentDate) = CURDATE()) AS TodayRevenue,
    (SELECT IFNULL(SUM(Amount), 0) FROM Payments WHERE YEAR(PaymentDate) = YEAR(CURDATE()) AND MONTH(PaymentDate) = MONTH(CURDATE())) AS MonthlyRevenue,
    (SELECT COUNT(*) FROM Complaints WHERE Status = 'Open') AS OpenComplaints;

-- ============================================================================
-- SECTION 7: INSERT REQUIRED REFERENCE DATA ONLY (NO CUSTOMERS)
-- ============================================================================

-- Customer Types (Required for the system)
INSERT INTO CustomerTypes (TypeName, Description) VALUES 
('Household', 'Residential customers'),
('Business', 'Commercial and business establishments'),
('Government', 'Government offices and institutions');

-- Utility Types (Required for the system)
INSERT INTO UtilityTypes (UtilityName, Unit, Description, IconColor) VALUES 
('Electricity', 'kWh', 'Electric power supply', '#EAB308'),
('Water', 'm³', 'Water supply', '#3B82F6'),
('Gas', 'units', 'Natural gas supply', '#EF4444');

-- Tariffs (Required for billing calculations)
INSERT INTO Tariffs (UtilityTypeID, TariffName, RatePerUnit, FixedCharge, Description) VALUES 
(1, 'Electricity Standard', 25.00, 500.00, 'Standard electricity tariff'),
(2, 'Water Standard', 45.00, 300.00, 'Standard water tariff'),
(3, 'Gas Standard', 35.00, 250.00, 'Standard gas tariff');

-- Tariff Slabs (Tiered pricing for electricity)
INSERT INTO TariffSlabs (UtilityTypeID, SlabName, MinUnits, MaxUnits, RatePerUnit, FixedCharge, EffectiveFrom) VALUES 
(1, 'Electricity 0-60 kWh', 0, 60, 10.00, 200.00, '2024-01-01'),
(1, 'Electricity 61-90 kWh', 60, 90, 20.00, 0.00, '2024-01-01'),
(1, 'Electricity 91-120 kWh', 90, 120, 30.00, 0.00, '2024-01-01'),
(1, 'Electricity 121+ kWh', 120, NULL, 45.00, 0.00, '2024-01-01'),
(2, 'Water 0-15 m³', 0, 15, 25.00, 150.00, '2024-01-01'),
(2, 'Water 16-25 m³', 15, 25, 40.00, 0.00, '2024-01-01'),
(2, 'Water 26+ m³', 25, NULL, 60.00, 0.00, '2024-01-01'),
(3, 'Gas Standard', 0, NULL, 35.00, 250.00, '2024-01-01');

-- System Users (Required for login)
INSERT INTO Users (Username, PasswordHash, Email, FullName, Role, Phone) VALUES 
('admin', 'hashed_password_here', 'admin@ums.lk', 'System Administrator', 'Admin', '0770000001'),
('field1', 'hashed_password_here', 'field1@ums.lk', 'Saman Kumara', 'FieldOfficer', '0770000002'),
('cashier1', 'hashed_password_here', 'cashier1@ums.lk', 'Malini Jayawardena', 'Cashier', '0770000003'),
('manager1', 'hashed_password_here', 'manager1@ums.lk', 'Ruwan Perera', 'Manager', '0770000004');

SELECT 'UMS MySQL Database created successfully! (No customer data - ready for your data)' AS Message;
