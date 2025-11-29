-- ============================================================================
-- UTILITY MANAGEMENT SYSTEM (UMS) - COMPLETE DATABASE SCHEMA
-- SQL Server Database with Tables, Triggers, Stored Procedures, UDFs, and Views
-- ============================================================================

-- Create Database
USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = 'UMS_DB')
BEGIN
    ALTER DATABASE UMS_DB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE UMS_DB;
END
GO

CREATE DATABASE UMS_DB;
GO

USE UMS_DB;
GO

-- ============================================================================
-- SECTION 1: CORE TABLES
-- ============================================================================

-- 1.1 Customer Types (Household, Business, Government)
CREATE TABLE CustomerTypes (
    TypeID INT PRIMARY KEY IDENTITY(1,1),
    TypeName VARCHAR(50) NOT NULL UNIQUE,
    Description VARCHAR(200),
    CreatedAt DATETIME DEFAULT GETDATE()
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
    RegistrationDate DATETIME DEFAULT GETDATE(),
    Status VARCHAR(20) DEFAULT 'Active' CHECK (Status IN ('Active', 'Inactive', 'Suspended')),
    OutstandingBalance DECIMAL(12,2) DEFAULT 0.00,
    FOREIGN KEY (CustomerTypeID) REFERENCES CustomerTypes(TypeID)
);

-- 1.3 Utility Types (Electricity, Water, Gas)
CREATE TABLE UtilityTypes (
    UtilityTypeID INT PRIMARY KEY IDENTITY(1,1),
    UtilityName VARCHAR(50) NOT NULL UNIQUE,
    Unit VARCHAR(20) NOT NULL,  -- kWh, m³, units
    Description VARCHAR(200),
    IconColor VARCHAR(20) DEFAULT '#3B82F6'
);

-- 1.4 Tariff Slabs (for tiered pricing)
CREATE TABLE TariffSlabs (
    SlabID INT PRIMARY KEY IDENTITY(1,1),
    UtilityTypeID INT NOT NULL,
    SlabName VARCHAR(100) NOT NULL,
    MinUnits DECIMAL(10,2) NOT NULL,
    MaxUnits DECIMAL(10,2),  -- NULL means unlimited
    RatePerUnit DECIMAL(10,4) NOT NULL,
    FixedCharge DECIMAL(10,2) DEFAULT 0.00,
    CustomerTypeID INT,  -- NULL means applicable to all
    EffectiveFrom DATE NOT NULL,
    EffectiveTo DATE,  -- NULL means currently active
    IsActive BIT DEFAULT 1,
    FOREIGN KEY (UtilityTypeID) REFERENCES UtilityTypes(UtilityTypeID),
    FOREIGN KEY (CustomerTypeID) REFERENCES CustomerTypes(TypeID)
);

-- 1.5 Tariffs (Simple flat rate reference)
CREATE TABLE Tariffs (
    TariffID INT PRIMARY KEY IDENTITY(1,1),
    UtilityTypeID INT NOT NULL,
    TariffName VARCHAR(100) NOT NULL,
    RatePerUnit DECIMAL(10,4) NOT NULL,
    FixedCharge DECIMAL(10,2) DEFAULT 0.00,
    Description VARCHAR(200),
    EffectiveFrom DATE DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1,
    FOREIGN KEY (UtilityTypeID) REFERENCES UtilityTypes(UtilityTypeID)
);

-- 1.6 Meters
CREATE TABLE Meters (
    MeterID VARCHAR(30) PRIMARY KEY,
    CustomerID VARCHAR(20) NOT NULL,
    UtilityTypeID INT NOT NULL,
    MeterSerialNo VARCHAR(50),
    InstallationDate DATE DEFAULT GETDATE(),
    LastReadingValue DECIMAL(12,2) DEFAULT 0.00,
    LastReadingDate DATETIME,
    Status VARCHAR(20) DEFAULT 'Active' CHECK (Status IN ('Active', 'Inactive', 'Faulty', 'Replaced')),
    Location VARCHAR(200),
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID) ON DELETE CASCADE,
    FOREIGN KEY (UtilityTypeID) REFERENCES UtilityTypes(UtilityTypeID)
);

-- 1.7 Meter Readings
CREATE TABLE MeterReadings (
    ReadingID VARCHAR(30) PRIMARY KEY,
    MeterID VARCHAR(30) NOT NULL,
    PreviousReading DECIMAL(12,2) NOT NULL,
    CurrentReading DECIMAL(12,2) NOT NULL,
    Consumption DECIMAL(12,2) NOT NULL,
    ReadingDate DATETIME DEFAULT GETDATE(),
    ReadBy VARCHAR(100),
    IsEstimated BIT DEFAULT 0,
    Notes VARCHAR(500),
    FOREIGN KEY (MeterID) REFERENCES Meters(MeterID)
);

-- 1.8 Bills
CREATE TABLE Bills (
    BillID VARCHAR(30) PRIMARY KEY,
    CustomerID VARCHAR(20) NOT NULL,
    MeterID VARCHAR(30) NOT NULL,
    ReadingID VARCHAR(30),
    BillingPeriodStart DATE NOT NULL,
    BillingPeriodEnd DATE NOT NULL,
    Consumption DECIMAL(12,2) NOT NULL,
    UnitCharge DECIMAL(12,2) NOT NULL,
    FixedCharge DECIMAL(10,2) DEFAULT 0.00,
    Taxes DECIMAL(10,2) DEFAULT 0.00,
    TotalAmount DECIMAL(12,2) NOT NULL,
    DueDate DATE NOT NULL,
    GeneratedDate DATETIME DEFAULT GETDATE(),
    Status VARCHAR(20) DEFAULT 'Unpaid' CHECK (Status IN ('Unpaid', 'Paid', 'Overdue', 'Cancelled', 'Partial')),
    PaidAmount DECIMAL(12,2) DEFAULT 0.00,
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    FOREIGN KEY (MeterID) REFERENCES Meters(MeterID),
    FOREIGN KEY (ReadingID) REFERENCES MeterReadings(ReadingID)
);

-- 1.9 Payments
CREATE TABLE Payments (
    PaymentID VARCHAR(30) PRIMARY KEY,
    BillID VARCHAR(30) NOT NULL,
    CustomerID VARCHAR(20) NOT NULL,
    Amount DECIMAL(12,2) NOT NULL,
    PaymentMethod VARCHAR(30) CHECK (PaymentMethod IN ('Cash', 'Card', 'Online', 'Bank Transfer', 'Cheque')),
    PaymentDate DATETIME DEFAULT GETDATE(),
    TransactionRef VARCHAR(50),
    ProcessedBy VARCHAR(100),
    Notes VARCHAR(200),
    FOREIGN KEY (BillID) REFERENCES Bills(BillID),
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
);

-- 1.10 Users (System Users)
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    Username VARCHAR(50) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE,
    FullName VARCHAR(100) NOT NULL,
    Role VARCHAR(30) NOT NULL CHECK (Role IN ('Admin', 'FieldOfficer', 'Cashier', 'Manager')),
    Phone VARCHAR(20),
    IsActive BIT DEFAULT 1,
    LastLogin DATETIME,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 1.11 Complaints
CREATE TABLE Complaints (
    ComplaintID INT PRIMARY KEY IDENTITY(1,1),
    CustomerID VARCHAR(20) NOT NULL,
    MeterID VARCHAR(30),
    Category VARCHAR(50) NOT NULL CHECK (Category IN ('Billing', 'Meter', 'Service', 'Quality', 'Other')),
    Subject VARCHAR(200) NOT NULL,
    Description VARCHAR(1000) NOT NULL,
    Priority VARCHAR(20) DEFAULT 'Medium' CHECK (Priority IN ('Low', 'Medium', 'High', 'Critical')),
    Status VARCHAR(30) DEFAULT 'Open' CHECK (Status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
    AssignedTo INT,
    CreatedAt DATETIME DEFAULT GETDATE(),
    ResolvedAt DATETIME,
    Resolution VARCHAR(1000),
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    FOREIGN KEY (MeterID) REFERENCES Meters(MeterID),
    FOREIGN KEY (AssignedTo) REFERENCES Users(UserID)
);

-- 1.12 Audit Log
CREATE TABLE AuditLog (
    LogID INT PRIMARY KEY IDENTITY(1,1),
    TableName VARCHAR(50) NOT NULL,
    RecordID VARCHAR(50) NOT NULL,
    Action VARCHAR(20) NOT NULL CHECK (Action IN ('INSERT', 'UPDATE', 'DELETE')),
    OldValues NVARCHAR(MAX),
    NewValues NVARCHAR(MAX),
    ChangedBy VARCHAR(100) DEFAULT SYSTEM_USER,
    ChangedAt DATETIME DEFAULT GETDATE()
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

GO

-- ============================================================================
-- SECTION 3: USER-DEFINED FUNCTIONS (UDFs)
-- ============================================================================

-- 3.1 Calculate Bill Amount Based on Consumption and Tariff Slabs
CREATE FUNCTION dbo.fn_CalculateBillAmount (
    @UtilityTypeID INT,
    @Consumption DECIMAL(12,2),
    @CustomerTypeID INT = NULL
)
RETURNS DECIMAL(12,2)
AS
BEGIN
    DECLARE @TotalAmount DECIMAL(12,2) = 0;
    DECLARE @RemainingUnits DECIMAL(12,2) = @Consumption;
    DECLARE @FixedCharge DECIMAL(10,2) = 0;
    
    -- Get applicable tariff slabs ordered by MinUnits
    DECLARE @SlabRate DECIMAL(10,4), @MinUnits DECIMAL(10,2), @MaxUnits DECIMAL(10,2);
    
    DECLARE slab_cursor CURSOR FOR
        SELECT RatePerUnit, MinUnits, ISNULL(MaxUnits, 999999) as MaxUnits, FixedCharge
        FROM TariffSlabs
        WHERE UtilityTypeID = @UtilityTypeID
          AND IsActive = 1
          AND (CustomerTypeID = @CustomerTypeID OR CustomerTypeID IS NULL)
          AND EffectiveFrom <= GETDATE()
          AND (EffectiveTo IS NULL OR EffectiveTo >= GETDATE())
        ORDER BY MinUnits;
    
    OPEN slab_cursor;
    FETCH NEXT FROM slab_cursor INTO @SlabRate, @MinUnits, @MaxUnits, @FixedCharge;
    
    WHILE @@FETCH_STATUS = 0 AND @RemainingUnits > 0
    BEGIN
        DECLARE @SlabUnits DECIMAL(12,2) = @MaxUnits - @MinUnits;
        DECLARE @UnitsInSlab DECIMAL(12,2);
        
        IF @RemainingUnits >= @SlabUnits
            SET @UnitsInSlab = @SlabUnits;
        ELSE
            SET @UnitsInSlab = @RemainingUnits;
        
        SET @TotalAmount = @TotalAmount + (@UnitsInSlab * @SlabRate);
        SET @RemainingUnits = @RemainingUnits - @UnitsInSlab;
        
        IF @FixedCharge > 0
            SET @TotalAmount = @TotalAmount + @FixedCharge;
        
        FETCH NEXT FROM slab_cursor INTO @SlabRate, @MinUnits, @MaxUnits, @FixedCharge;
    END
    
    CLOSE slab_cursor;
    DEALLOCATE slab_cursor;
    
    -- If no slabs found, use flat rate from Tariffs table
    IF @TotalAmount = 0
    BEGIN
        SELECT TOP 1 @TotalAmount = (@Consumption * RatePerUnit) + FixedCharge
        FROM Tariffs
        WHERE UtilityTypeID = @UtilityTypeID AND IsActive = 1
        ORDER BY EffectiveFrom DESC;
    END
    
    RETURN ISNULL(@TotalAmount, 0);
END;
GO

-- 3.2 Get Customer Outstanding Balance
CREATE FUNCTION dbo.fn_GetCustomerBalance (@CustomerID VARCHAR(20))
RETURNS DECIMAL(12,2)
AS
BEGIN
    DECLARE @Balance DECIMAL(12,2);
    
    SELECT @Balance = ISNULL(SUM(TotalAmount - PaidAmount), 0)
    FROM Bills
    WHERE CustomerID = @CustomerID
      AND Status IN ('Unpaid', 'Overdue', 'Partial');
    
    RETURN @Balance;
END;
GO

-- 3.3 Get Total Consumption for Customer in Period
CREATE FUNCTION dbo.fn_GetCustomerConsumption (
    @CustomerID VARCHAR(20),
    @StartDate DATE,
    @EndDate DATE,
    @UtilityTypeID INT = NULL
)
RETURNS DECIMAL(12,2)
AS
BEGIN
    DECLARE @TotalConsumption DECIMAL(12,2);
    
    SELECT @TotalConsumption = ISNULL(SUM(mr.Consumption), 0)
    FROM MeterReadings mr
    INNER JOIN Meters m ON mr.MeterID = m.MeterID
    WHERE m.CustomerID = @CustomerID
      AND mr.ReadingDate BETWEEN @StartDate AND @EndDate
      AND (@UtilityTypeID IS NULL OR m.UtilityTypeID = @UtilityTypeID);
    
    RETURN @TotalConsumption;
END;
GO

-- 3.4 Format Bill ID
CREATE FUNCTION dbo.fn_GenerateBillID ()
RETURNS VARCHAR(30)
AS
BEGIN
    RETURN 'BILL-' + FORMAT(GETDATE(), 'yyyyMMdd') + '-' + RIGHT('000000' + CAST(NEXT VALUE FOR dbo.BillSequence AS VARCHAR(6)), 6);
END;
GO

-- Create sequence for Bill IDs
CREATE SEQUENCE dbo.BillSequence AS INT START WITH 1 INCREMENT BY 1;
GO

-- 3.5 Calculate Days Overdue
CREATE FUNCTION dbo.fn_GetDaysOverdue (@BillID VARCHAR(30))
RETURNS INT
AS
BEGIN
    DECLARE @Days INT = 0;
    DECLARE @DueDate DATE;
    
    SELECT @DueDate = DueDate FROM Bills WHERE BillID = @BillID AND Status IN ('Unpaid', 'Overdue');
    
    IF @DueDate IS NOT NULL AND @DueDate < GETDATE()
        SET @Days = DATEDIFF(DAY, @DueDate, GETDATE());
    
    RETURN @Days;
END;
GO

-- ============================================================================
-- SECTION 4: STORED PROCEDURES
-- ============================================================================

-- 4.1 Register New Customer with Initial Meter
CREATE PROCEDURE sp_RegisterCustomer
    @FirstName VARCHAR(100),
    @LastName VARCHAR(100),
    @CustomerTypeID INT,
    @Email VARCHAR(150),
    @Phone VARCHAR(20),
    @Address VARCHAR(300),
    @City VARCHAR(100) = 'Colombo',
    @NIC VARCHAR(20) = NULL,
    @UtilityTypeID INT = NULL,
    @CustomerID VARCHAR(20) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Generate Customer ID
        SET @CustomerID = 'CUS-' + FORMAT(GETDATE(), 'yyyyMM') + '-' + RIGHT('0000' + CAST((SELECT COUNT(*) + 1 FROM Customers) AS VARCHAR(4)), 4);
        
        -- Insert Customer
        INSERT INTO Customers (CustomerID, FirstName, LastName, CustomerTypeID, Email, Phone, Address, City, NIC)
        VALUES (@CustomerID, @FirstName, @LastName, @CustomerTypeID, @Email, @Phone, @Address, @City, @NIC);
        
        -- If utility type specified, create meter
        IF @UtilityTypeID IS NOT NULL
        BEGIN
            DECLARE @MeterID VARCHAR(30);
            SET @MeterID = 'MTR-' + 
                CASE @UtilityTypeID 
                    WHEN 1 THEN 'E' 
                    WHEN 2 THEN 'W' 
                    WHEN 3 THEN 'G' 
                    ELSE 'X' 
                END + '-' + RIGHT('000000' + CAST(ABS(CHECKSUM(NEWID())) % 1000000 AS VARCHAR(6)), 6);
            
            INSERT INTO Meters (MeterID, CustomerID, UtilityTypeID, MeterSerialNo, Location)
            VALUES (@MeterID, @CustomerID, @UtilityTypeID, 'SN-' + REPLACE(NEWID(), '-', ''), @Address);
        END
        
        COMMIT TRANSACTION;
        
        SELECT @CustomerID as CustomerID, 'Customer registered successfully' as Message;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 4.2 Submit Meter Reading and Generate Bill
CREATE PROCEDURE sp_SubmitReading
    @MeterID VARCHAR(30),
    @CurrentReading DECIMAL(12,2),
    @ReadBy VARCHAR(100) = 'System',
    @BillID VARCHAR(30) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @CustomerID VARCHAR(20), @UtilityTypeID INT, @CustomerTypeID INT;
        DECLARE @PreviousReading DECIMAL(12,2), @Consumption DECIMAL(12,2);
        DECLARE @ReadingID VARCHAR(30);
        DECLARE @UnitCharge DECIMAL(12,2), @FixedCharge DECIMAL(10,2), @TotalAmount DECIMAL(12,2);
        
        -- Get meter info
        SELECT @CustomerID = m.CustomerID, 
               @UtilityTypeID = m.UtilityTypeID,
               @PreviousReading = m.LastReadingValue,
               @CustomerTypeID = c.CustomerTypeID
        FROM Meters m
        INNER JOIN Customers c ON m.CustomerID = c.CustomerID
        WHERE m.MeterID = @MeterID AND m.Status = 'Active';
        
        IF @CustomerID IS NULL
        BEGIN
            RAISERROR('Meter not found or inactive', 16, 1);
            RETURN;
        END
        
        -- Validate reading
        IF @CurrentReading < @PreviousReading
        BEGIN
            RAISERROR('Current reading cannot be less than previous reading', 16, 1);
            RETURN;
        END
        
        -- Calculate consumption
        SET @Consumption = @CurrentReading - @PreviousReading;
        
        -- Generate IDs
        SET @ReadingID = 'RDG-' + FORMAT(GETDATE(), 'yyyyMMddHHmmss') + '-' + RIGHT(@MeterID, 4);
        SET @BillID = 'BILL-' + FORMAT(GETDATE(), 'yyyyMMddHHmmss') + '-' + RIGHT(@MeterID, 4);
        
        -- Insert Reading
        INSERT INTO MeterReadings (ReadingID, MeterID, PreviousReading, CurrentReading, Consumption, ReadBy)
        VALUES (@ReadingID, @MeterID, @PreviousReading, @CurrentReading, @Consumption, @ReadBy);
        
        -- Update Meter
        UPDATE Meters SET LastReadingValue = @CurrentReading, LastReadingDate = GETDATE() WHERE MeterID = @MeterID;
        
        -- Calculate charges using tariff
        SELECT TOP 1 @UnitCharge = @Consumption * RatePerUnit, @FixedCharge = FixedCharge
        FROM Tariffs
        WHERE UtilityTypeID = @UtilityTypeID AND IsActive = 1
        ORDER BY EffectiveFrom DESC;
        
        SET @TotalAmount = ISNULL(@UnitCharge, 0) + ISNULL(@FixedCharge, 0);
        
        -- Generate Bill
        INSERT INTO Bills (BillID, CustomerID, MeterID, ReadingID, BillingPeriodStart, BillingPeriodEnd, 
                          Consumption, UnitCharge, FixedCharge, TotalAmount, DueDate)
        VALUES (@BillID, @CustomerID, @MeterID, @ReadingID, 
                DATEADD(MONTH, -1, GETDATE()), GETDATE(),
                @Consumption, @UnitCharge, @FixedCharge, @TotalAmount,
                DATEADD(DAY, 30, GETDATE()));
        
        -- Update customer outstanding balance
        UPDATE Customers SET OutstandingBalance = OutstandingBalance + @TotalAmount WHERE CustomerID = @CustomerID;
        
        COMMIT TRANSACTION;
        
        SELECT @BillID as BillID, @TotalAmount as Amount, @Consumption as Consumption, 'Bill generated successfully' as Message;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 4.3 Process Payment
CREATE PROCEDURE sp_ProcessPayment
    @BillID VARCHAR(30),
    @Amount DECIMAL(12,2),
    @PaymentMethod VARCHAR(30) = 'Cash',
    @ProcessedBy VARCHAR(100) = 'System',
    @TransactionRef VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @CustomerID VARCHAR(20), @BillTotal DECIMAL(12,2), @PaidAmount DECIMAL(12,2);
        DECLARE @PaymentID VARCHAR(30);
        
        -- Get bill info
        SELECT @CustomerID = CustomerID, @BillTotal = TotalAmount, @PaidAmount = PaidAmount
        FROM Bills WHERE BillID = @BillID AND Status IN ('Unpaid', 'Overdue', 'Partial');
        
        IF @CustomerID IS NULL
        BEGIN
            RAISERROR('Bill not found or already paid', 16, 1);
            RETURN;
        END
        
        -- Generate Payment ID
        SET @PaymentID = 'PAY-' + FORMAT(GETDATE(), 'yyyyMMddHHmmss') + '-' + RIGHT(@BillID, 4);
        
        -- Insert Payment
        INSERT INTO Payments (PaymentID, BillID, CustomerID, Amount, PaymentMethod, ProcessedBy, TransactionRef)
        VALUES (@PaymentID, @BillID, @CustomerID, @Amount, @PaymentMethod, @ProcessedBy, @TransactionRef);
        
        -- Update Bill
        UPDATE Bills 
        SET PaidAmount = PaidAmount + @Amount,
            Status = CASE 
                WHEN PaidAmount + @Amount >= TotalAmount THEN 'Paid'
                ELSE 'Partial'
            END
        WHERE BillID = @BillID;
        
        -- Update customer balance
        UPDATE Customers SET OutstandingBalance = OutstandingBalance - @Amount WHERE CustomerID = @CustomerID;
        
        COMMIT TRANSACTION;
        
        SELECT @PaymentID as PaymentID, 'Payment processed successfully' as Message;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 4.4 Get Customer Bill Summary
CREATE PROCEDURE sp_GetCustomerBillSummary
    @CustomerID VARCHAR(20)
AS
BEGIN
    SELECT 
        c.CustomerID,
        c.FirstName + ' ' + c.LastName as CustomerName,
        c.OutstandingBalance,
        COUNT(b.BillID) as TotalBills,
        SUM(CASE WHEN b.Status = 'Paid' THEN 1 ELSE 0 END) as PaidBills,
        SUM(CASE WHEN b.Status IN ('Unpaid', 'Overdue') THEN 1 ELSE 0 END) as UnpaidBills,
        SUM(b.TotalAmount) as TotalBilled,
        SUM(b.PaidAmount) as TotalPaid
    FROM Customers c
    LEFT JOIN Bills b ON c.CustomerID = b.CustomerID
    WHERE c.CustomerID = @CustomerID
    GROUP BY c.CustomerID, c.FirstName, c.LastName, c.OutstandingBalance;
END;
GO

-- 4.5 Mark Overdue Bills
CREATE PROCEDURE sp_UpdateOverdueBills
AS
BEGIN
    UPDATE Bills
    SET Status = 'Overdue'
    WHERE Status = 'Unpaid' AND DueDate < GETDATE();
    
    SELECT @@ROWCOUNT as BillsMarkedOverdue;
END;
GO

-- 4.6 Generate Monthly Report
CREATE PROCEDURE sp_GenerateMonthlyReport
    @Year INT,
    @Month INT
AS
BEGIN
    SELECT 
        ut.UtilityName,
        COUNT(DISTINCT b.BillID) as BillsGenerated,
        SUM(b.Consumption) as TotalConsumption,
        SUM(b.TotalAmount) as TotalBilled,
        SUM(b.PaidAmount) as TotalCollected,
        SUM(b.TotalAmount) - SUM(b.PaidAmount) as Outstanding
    FROM Bills b
    INNER JOIN Meters m ON b.MeterID = m.MeterID
    INNER JOIN UtilityTypes ut ON m.UtilityTypeID = ut.UtilityTypeID
    WHERE YEAR(b.GeneratedDate) = @Year AND MONTH(b.GeneratedDate) = @Month
    GROUP BY ut.UtilityName
    ORDER BY TotalBilled DESC;
END;
GO

-- 4.7 Get Top Consumers
CREATE PROCEDURE sp_GetTopConsumers
    @UtilityTypeID INT = NULL,
    @TopN INT = 10,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    IF @StartDate IS NULL SET @StartDate = DATEADD(MONTH, -1, GETDATE());
    IF @EndDate IS NULL SET @EndDate = GETDATE();
    
    SELECT TOP (@TopN)
        c.CustomerID,
        c.FirstName + ' ' + c.LastName as CustomerName,
        ct.TypeName as CustomerType,
        ut.UtilityName,
        SUM(mr.Consumption) as TotalConsumption,
        ut.Unit
    FROM Customers c
    INNER JOIN CustomerTypes ct ON c.CustomerTypeID = ct.TypeID
    INNER JOIN Meters m ON c.CustomerID = m.CustomerID
    INNER JOIN MeterReadings mr ON m.MeterID = mr.MeterID
    INNER JOIN UtilityTypes ut ON m.UtilityTypeID = ut.UtilityTypeID
    WHERE mr.ReadingDate BETWEEN @StartDate AND @EndDate
      AND (@UtilityTypeID IS NULL OR m.UtilityTypeID = @UtilityTypeID)
    GROUP BY c.CustomerID, c.FirstName, c.LastName, ct.TypeName, ut.UtilityName, ut.Unit
    ORDER BY TotalConsumption DESC;
END;
GO

-- 4.8 Get Defaulters (Overdue Customers)
CREATE PROCEDURE sp_GetDefaulters
    @MinDaysOverdue INT = 30
AS
BEGIN
    SELECT 
        c.CustomerID,
        c.FirstName + ' ' + c.LastName as CustomerName,
        c.Phone,
        c.Address,
        COUNT(b.BillID) as OverdueBills,
        SUM(b.TotalAmount - b.PaidAmount) as TotalOverdue,
        MIN(b.DueDate) as OldestDueDate,
        DATEDIFF(DAY, MIN(b.DueDate), GETDATE()) as MaxDaysOverdue
    FROM Customers c
    INNER JOIN Bills b ON c.CustomerID = b.CustomerID
    WHERE b.Status = 'Overdue'
    GROUP BY c.CustomerID, c.FirstName, c.LastName, c.Phone, c.Address
    HAVING DATEDIFF(DAY, MIN(b.DueDate), GETDATE()) >= @MinDaysOverdue
    ORDER BY TotalOverdue DESC;
END;
GO

-- ============================================================================
-- SECTION 5: TRIGGERS
-- ============================================================================

-- 5.1 Audit Trigger for Customers Table
CREATE TRIGGER trg_Customers_Audit
ON Customers
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (SELECT * FROM inserted) AND EXISTS (SELECT * FROM deleted)
    BEGIN
        -- UPDATE
        INSERT INTO AuditLog (TableName, RecordID, Action, OldValues, NewValues)
        SELECT 'Customers', d.CustomerID, 'UPDATE',
            (SELECT d.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            (SELECT i.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
        FROM deleted d
        INNER JOIN inserted i ON d.CustomerID = i.CustomerID;
    END
    ELSE IF EXISTS (SELECT * FROM inserted)
    BEGIN
        -- INSERT
        INSERT INTO AuditLog (TableName, RecordID, Action, NewValues)
        SELECT 'Customers', i.CustomerID, 'INSERT',
            (SELECT i.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
        FROM inserted i;
    END
    ELSE IF EXISTS (SELECT * FROM deleted)
    BEGIN
        -- DELETE
        INSERT INTO AuditLog (TableName, RecordID, Action, OldValues)
        SELECT 'Customers', d.CustomerID, 'DELETE',
            (SELECT d.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
        FROM deleted d;
    END
END;
GO

-- 5.2 Audit Trigger for Bills Table
CREATE TRIGGER trg_Bills_Audit
ON Bills
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (SELECT * FROM inserted) AND EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO AuditLog (TableName, RecordID, Action, OldValues, NewValues)
        SELECT 'Bills', d.BillID, 'UPDATE',
            (SELECT d.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            (SELECT i.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
        FROM deleted d
        INNER JOIN inserted i ON d.BillID = i.BillID;
    END
    ELSE IF EXISTS (SELECT * FROM inserted)
    BEGIN
        INSERT INTO AuditLog (TableName, RecordID, Action, NewValues)
        SELECT 'Bills', i.BillID, 'INSERT',
            (SELECT i.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
        FROM inserted i;
    END
    ELSE IF EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO AuditLog (TableName, RecordID, Action, OldValues)
        SELECT 'Bills', d.BillID, 'DELETE',
            (SELECT d.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
        FROM deleted d;
    END
END;
GO

-- 5.3 Trigger to prevent negative meter readings
CREATE TRIGGER trg_MeterReadings_Validate
ON MeterReadings
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (
        SELECT 1 FROM inserted i
        INNER JOIN Meters m ON i.MeterID = m.MeterID
        WHERE i.CurrentReading < m.LastReadingValue
    )
    BEGIN
        RAISERROR('Current reading cannot be less than last recorded reading', 16, 1);
        RETURN;
    END
    
    INSERT INTO MeterReadings (ReadingID, MeterID, PreviousReading, CurrentReading, Consumption, ReadingDate, ReadBy, IsEstimated, Notes)
    SELECT ReadingID, MeterID, PreviousReading, CurrentReading, Consumption, ISNULL(ReadingDate, GETDATE()), ReadBy, IsEstimated, Notes
    FROM inserted;
END;
GO

-- 5.4 Trigger to update customer status on outstanding balance
CREATE TRIGGER trg_Customer_StatusUpdate
ON Customers
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Auto-suspend customers with very high outstanding balance
    UPDATE c
    SET Status = 'Suspended'
    FROM Customers c
    INNER JOIN inserted i ON c.CustomerID = i.CustomerID
    WHERE i.OutstandingBalance > 50000 AND c.Status = 'Active';
END;
GO

-- 5.5 Trigger to auto-calculate consumption on reading insert
CREATE TRIGGER trg_MeterReadings_CalcConsumption
ON MeterReadings
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE mr
    SET Consumption = mr.CurrentReading - mr.PreviousReading
    FROM MeterReadings mr
    INNER JOIN inserted i ON mr.ReadingID = i.ReadingID
    WHERE mr.Consumption IS NULL OR mr.Consumption = 0;
END;
GO

-- ============================================================================
-- SECTION 6: VIEWS
-- ============================================================================

-- 6.1 Customer Summary View
CREATE VIEW vw_CustomerSummary
AS
SELECT 
    c.CustomerID,
    c.FirstName + ' ' + c.LastName as FullName,
    ct.TypeName as CustomerType,
    c.Email,
    c.Phone,
    c.Address,
    c.City,
    c.Status,
    c.OutstandingBalance,
    c.RegistrationDate,
    (SELECT COUNT(*) FROM Meters WHERE CustomerID = c.CustomerID AND Status = 'Active') as ActiveMeters,
    (SELECT COUNT(*) FROM Bills WHERE CustomerID = c.CustomerID) as TotalBills,
    (SELECT COUNT(*) FROM Bills WHERE CustomerID = c.CustomerID AND Status IN ('Unpaid', 'Overdue')) as UnpaidBills
FROM Customers c
INNER JOIN CustomerTypes ct ON c.CustomerTypeID = ct.TypeID;
GO

-- 6.2 Meter Details View
CREATE VIEW vw_MeterDetails
AS
SELECT 
    m.MeterID,
    m.MeterSerialNo,
    c.CustomerID,
    c.FirstName + ' ' + c.LastName as CustomerName,
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
GO

-- 6.3 Bill Details View
CREATE VIEW vw_BillDetails
AS
SELECT 
    b.BillID,
    b.CustomerID,
    c.FirstName + ' ' + c.LastName as CustomerName,
    c.Phone as CustomerPhone,
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
    b.TotalAmount - b.PaidAmount as BalanceDue,
    b.DueDate,
    b.GeneratedDate,
    b.Status,
    CASE WHEN b.DueDate < GETDATE() AND b.Status != 'Paid' 
         THEN DATEDIFF(DAY, b.DueDate, GETDATE()) ELSE 0 END as DaysOverdue
FROM Bills b
INNER JOIN Customers c ON b.CustomerID = c.CustomerID
INNER JOIN Meters m ON b.MeterID = m.MeterID
INNER JOIN UtilityTypes ut ON m.UtilityTypeID = ut.UtilityTypeID;
GO

-- 6.4 Payment History View
CREATE VIEW vw_PaymentHistory
AS
SELECT 
    p.PaymentID,
    p.BillID,
    b.CustomerID,
    c.FirstName + ' ' + c.LastName as CustomerName,
    ut.UtilityName,
    p.Amount,
    p.PaymentMethod,
    p.PaymentDate,
    p.ProcessedBy,
    p.TransactionRef
FROM Payments p
INNER JOIN Bills b ON p.BillID = b.BillID
INNER JOIN Customers c ON b.CustomerID = c.CustomerID
INNER JOIN Meters m ON b.MeterID = m.MeterID
INNER JOIN UtilityTypes ut ON m.UtilityTypeID = ut.UtilityTypeID;
GO

-- 6.5 Revenue Summary View (Daily/Monthly)
CREATE VIEW vw_RevenueSummary
AS
SELECT 
    CAST(p.PaymentDate AS DATE) as PaymentDay,
    YEAR(p.PaymentDate) as Year,
    MONTH(p.PaymentDate) as Month,
    ut.UtilityName,
    COUNT(p.PaymentID) as TransactionCount,
    SUM(p.Amount) as TotalRevenue
FROM Payments p
INNER JOIN Bills b ON p.BillID = b.BillID
INNER JOIN Meters m ON b.MeterID = m.MeterID
INNER JOIN UtilityTypes ut ON m.UtilityTypeID = ut.UtilityTypeID
GROUP BY CAST(p.PaymentDate AS DATE), YEAR(p.PaymentDate), MONTH(p.PaymentDate), ut.UtilityName;
GO

-- 6.6 Consumption Summary View
CREATE VIEW vw_ConsumptionSummary
AS
SELECT 
    YEAR(mr.ReadingDate) as Year,
    MONTH(mr.ReadingDate) as Month,
    ut.UtilityName,
    ut.Unit,
    COUNT(mr.ReadingID) as ReadingsCount,
    SUM(mr.Consumption) as TotalConsumption,
    AVG(mr.Consumption) as AvgConsumption,
    MAX(mr.Consumption) as MaxConsumption,
    MIN(mr.Consumption) as MinConsumption
FROM MeterReadings mr
INNER JOIN Meters m ON mr.MeterID = m.MeterID
INNER JOIN UtilityTypes ut ON m.UtilityTypeID = ut.UtilityTypeID
GROUP BY YEAR(mr.ReadingDate), MONTH(mr.ReadingDate), ut.UtilityName, ut.Unit;
GO

-- 6.7 Overdue Bills View
CREATE VIEW vw_OverdueBills
AS
SELECT 
    b.BillID,
    c.CustomerID,
    c.FirstName + ' ' + c.LastName as CustomerName,
    c.Phone,
    c.Email,
    ut.UtilityName,
    b.TotalAmount,
    b.PaidAmount,
    b.TotalAmount - b.PaidAmount as AmountDue,
    b.DueDate,
    DATEDIFF(DAY, b.DueDate, GETDATE()) as DaysOverdue
FROM Bills b
INNER JOIN Customers c ON b.CustomerID = c.CustomerID
INNER JOIN Meters m ON b.MeterID = m.MeterID
INNER JOIN UtilityTypes ut ON m.UtilityTypeID = ut.UtilityTypeID
WHERE b.Status IN ('Unpaid', 'Overdue') AND b.DueDate < GETDATE();
GO

-- 6.8 Dashboard Statistics View
CREATE VIEW vw_DashboardStats
AS
SELECT 
    (SELECT COUNT(*) FROM Customers WHERE Status = 'Active') as TotalActiveCustomers,
    (SELECT COUNT(*) FROM Meters WHERE Status = 'Active') as TotalActiveMeters,
    (SELECT COUNT(*) FROM Bills WHERE Status = 'Unpaid') as UnpaidBills,
    (SELECT COUNT(*) FROM Bills WHERE Status = 'Overdue') as OverdueBills,
    (SELECT ISNULL(SUM(TotalAmount - PaidAmount), 0) FROM Bills WHERE Status IN ('Unpaid', 'Overdue')) as TotalOutstanding,
    (SELECT ISNULL(SUM(Amount), 0) FROM Payments WHERE CAST(PaymentDate AS DATE) = CAST(GETDATE() AS DATE)) as TodayRevenue,
    (SELECT ISNULL(SUM(Amount), 0) FROM Payments WHERE YEAR(PaymentDate) = YEAR(GETDATE()) AND MONTH(PaymentDate) = MONTH(GETDATE())) as MonthlyRevenue,
    (SELECT COUNT(*) FROM Complaints WHERE Status = 'Open') as OpenComplaints;
GO

-- ============================================================================
-- SECTION 7: INSERT SAMPLE DATA
-- ============================================================================

-- Customer Types
INSERT INTO CustomerTypes (TypeName, Description) VALUES 
('Household', 'Residential customers'),
('Business', 'Commercial and business establishments'),
('Government', 'Government offices and institutions');

-- Utility Types
INSERT INTO UtilityTypes (UtilityName, Unit, Description, IconColor) VALUES 
('Electricity', 'kWh', 'Electric power supply', '#EAB308'),
('Water', 'm³', 'Water supply', '#3B82F6'),
('Gas', 'units', 'Natural gas supply', '#EF4444');

-- Tariffs (Simple flat rates)
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

-- Sample Customers
INSERT INTO Customers (CustomerID, FirstName, LastName, CustomerTypeID, Email, Phone, Address, City, NIC) VALUES 
('CUS-001', 'Amal', 'Perera', 1, 'amal.perera@email.com', '0771234567', '45 Galle Road, Colombo 03', 'Colombo', '912345678V'),
('CUS-002', 'Nimal', 'Silva', 1, 'nimal.silva@email.com', '0772345678', '123 Kandy Road, Kelaniya', 'Kelaniya', '882345679V'),
('CUS-003', 'Kamala', 'Fernando', 1, 'kamala.f@email.com', '0773456789', '78 High Level Road, Nugegoda', 'Nugegoda', '903456780V'),
('CUS-004', 'Tech Solutions', 'Pvt Ltd', 2, 'info@techsolutions.lk', '0114567890', '500 Union Place, Colombo 02', 'Colombo', NULL),
('CUS-005', 'Municipal Council', 'Office', 3, 'info@municipal.gov.lk', '0115678901', '100 Town Hall Road', 'Colombo', NULL);

-- Sample Meters
INSERT INTO Meters (MeterID, CustomerID, UtilityTypeID, MeterSerialNo, Location, LastReadingValue, LastReadingDate) VALUES 
('MTR-E-000001', 'CUS-001', 1, 'SN-ELEC-001', '45 Galle Road', 1250.00, '2024-10-15'),
('MTR-W-000001', 'CUS-001', 2, 'SN-WATR-001', '45 Galle Road', 85.50, '2024-10-15'),
('MTR-E-000002', 'CUS-002', 1, 'SN-ELEC-002', '123 Kandy Road', 890.00, '2024-10-15'),
('MTR-W-000002', 'CUS-002', 2, 'SN-WATR-002', '123 Kandy Road', 62.00, '2024-10-15'),
('MTR-G-000001', 'CUS-002', 3, 'SN-GAS-001', '123 Kandy Road', 45.00, '2024-10-15'),
('MTR-E-000003', 'CUS-003', 1, 'SN-ELEC-003', '78 High Level Road', 2100.00, '2024-10-15'),
('MTR-E-000004', 'CUS-004', 1, 'SN-ELEC-004', '500 Union Place', 15000.00, '2024-10-15'),
('MTR-W-000003', 'CUS-004', 2, 'SN-WATR-003', '500 Union Place', 450.00, '2024-10-15'),
('MTR-E-000005', 'CUS-005', 1, 'SN-ELEC-005', '100 Town Hall Road', 8500.00, '2024-10-15');

-- Sample Meter Readings
INSERT INTO MeterReadings (ReadingID, MeterID, PreviousReading, CurrentReading, Consumption, ReadingDate, ReadBy) VALUES 
('RDG-001', 'MTR-E-000001', 1100.00, 1250.00, 150.00, '2024-10-15', 'Field Officer 1'),
('RDG-002', 'MTR-W-000001', 70.00, 85.50, 15.50, '2024-10-15', 'Field Officer 1'),
('RDG-003', 'MTR-E-000002', 780.00, 890.00, 110.00, '2024-10-15', 'Field Officer 2'),
('RDG-004', 'MTR-W-000002', 50.00, 62.00, 12.00, '2024-10-15', 'Field Officer 2'),
('RDG-005', 'MTR-E-000003', 1900.00, 2100.00, 200.00, '2024-10-15', 'Field Officer 1'),
('RDG-006', 'MTR-E-000004', 12000.00, 15000.00, 3000.00, '2024-10-15', 'Field Officer 3');

-- Sample Bills
INSERT INTO Bills (BillID, CustomerID, MeterID, ReadingID, BillingPeriodStart, BillingPeriodEnd, Consumption, UnitCharge, FixedCharge, TotalAmount, DueDate, Status, PaidAmount) VALUES 
('BILL-001', 'CUS-001', 'MTR-E-000001', 'RDG-001', '2024-09-15', '2024-10-15', 150.00, 3750.00, 500.00, 4250.00, '2024-11-15', 'Paid', 4250.00),
('BILL-002', 'CUS-001', 'MTR-W-000001', 'RDG-002', '2024-09-15', '2024-10-15', 15.50, 697.50, 300.00, 997.50, '2024-11-15', 'Unpaid', 0.00),
('BILL-003', 'CUS-002', 'MTR-E-000002', 'RDG-003', '2024-09-15', '2024-10-15', 110.00, 2750.00, 500.00, 3250.00, '2024-11-15', 'Unpaid', 0.00),
('BILL-004', 'CUS-003', 'MTR-E-000003', 'RDG-005', '2024-09-15', '2024-10-15', 200.00, 5000.00, 500.00, 5500.00, '2024-10-30', 'Overdue', 0.00),
('BILL-005', 'CUS-004', 'MTR-E-000004', 'RDG-006', '2024-09-15', '2024-10-15', 3000.00, 75000.00, 500.00, 75500.00, '2024-11-15', 'Partial', 50000.00);

-- Sample Payments
INSERT INTO Payments (PaymentID, BillID, CustomerID, Amount, PaymentMethod, ProcessedBy) VALUES 
('PAY-001', 'BILL-001', 'CUS-001', 4250.00, 'Card', 'Cashier 1'),
('PAY-002', 'BILL-005', 'CUS-004', 50000.00, 'Bank Transfer', 'Cashier 1');

-- Sample Users
INSERT INTO Users (Username, PasswordHash, Email, FullName, Role, Phone) VALUES 
('admin', 'hashed_password_here', 'admin@ums.lk', 'System Administrator', 'Admin', '0770000001'),
('field1', 'hashed_password_here', 'field1@ums.lk', 'Saman Kumara', 'FieldOfficer', '0770000002'),
('cashier1', 'hashed_password_here', 'cashier1@ums.lk', 'Malini Jayawardena', 'Cashier', '0770000003'),
('manager1', 'hashed_password_here', 'manager1@ums.lk', 'Ruwan Perera', 'Manager', '0770000004');

-- Sample Complaints
INSERT INTO Complaints (CustomerID, MeterID, Category, Subject, Description, Priority, AssignedTo) VALUES 
('CUS-001', 'MTR-E-000001', 'Billing', 'High Bill Amount', 'My electricity bill this month is unusually high. Please investigate.', 'Medium', 2),
('CUS-002', 'MTR-W-000002', 'Meter', 'Faulty Meter Reading', 'Water meter seems to be running even when no water is being used.', 'High', 2);

-- Update outstanding balances
UPDATE Customers SET OutstandingBalance = dbo.fn_GetCustomerBalance(CustomerID);
GO

PRINT 'UMS Database created successfully with all tables, functions, procedures, triggers, and views!';
GO

