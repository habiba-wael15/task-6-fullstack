-- ==============================================================================
-- Saiket Systems Internship - Task 6: Full Stack User Management System
-- Database Schema Initialization Script for Microsoft SQL Server
-- Target Database: SaiketTask6DB
-- Target Table:    dbo.Users
-- ==============================================================================
-- INSTRUCTIONS FOR SQL SERVER MANAGEMENT STUDIO (SSMS):
-- 1. Open SQL Server Management Studio (SSMS) and connect to your SQL Server instance
--    (e.g., DESKTOP-F3PIBN9 or localhost) using Windows Authentication.
-- 2. Open this file (File -> Open -> File... or Ctrl+O).
-- 3. Click 'Execute' (F5) to run the script.
-- 4. The script is completely idempotent: safe to run multiple times without data loss.
-- ==============================================================================

SET NOCOUNT ON;

-- 1. Create Database if it does not already exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'SaiketTask6DB')
BEGIN
    PRINT N'[INFO] Database SaiketTask6DB does not exist. Creating database...';
    CREATE DATABASE [SaiketTask6DB];
    PRINT N'[SUCCESS] Database SaiketTask6DB created successfully.';
END
ELSE
BEGIN
    PRINT N'[INFO] Database SaiketTask6DB already exists. Skipping database creation.';
END
GO

-- 2. Switch context to SaiketTask6DB
USE [SaiketTask6DB];
GO

-- 3. Create dbo.Users table if it does not already exist
IF NOT EXISTS (
    SELECT * FROM sys.objects 
    WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U')
)
BEGIN
    PRINT N'[INFO] Table dbo.Users does not exist. Creating table...';
    CREATE TABLE [dbo].[Users] (
        [Id]        INT IDENTITY(1,1)   NOT NULL,
        [Name]      NVARCHAR(100)       NOT NULL,
        [Email]     NVARCHAR(255)       NOT NULL,
        [Age]       INT                 NOT NULL,
        [CreatedAt] DATETIME2(7)        NOT NULL CONSTRAINT [DF_Users_CreatedAt] DEFAULT (SYSUTCDATETIME()),
        [UpdatedAt] DATETIME2(7)        NULL,

        CONSTRAINT [PK_Users_Id] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [UQ_Users_Email] UNIQUE NONCLUSTERED ([Email] ASC),
        CONSTRAINT [CK_Users_Age] CHECK ([Age] >= 1 AND [Age] <= 120),
        CONSTRAINT [CK_Users_Name_NotEmpty] CHECK (LEN(LTRIM(RTRIM([Name]))) > 0)
    );
    PRINT N'[SUCCESS] Table dbo.Users created successfully with constraints.';
END
ELSE
BEGIN
    PRINT N'[INFO] Table dbo.Users already exists. Skipping table creation.';
END
GO

-- 4. Seed initial sample users only if table is empty
IF NOT EXISTS (SELECT 1 FROM [dbo].[Users])
BEGIN
    PRINT N'[INFO] Table dbo.Users is empty. Inserting initial sample users...';
    
    INSERT INTO [dbo].[Users] ([Name], [Email], [Age], [CreatedAt])
    VALUES 
        (N'Habiba Wael', N'habiba.wael@example.com', 22, SYSUTCDATETIME()),
        (N'Alex Johnson', N'alex.johnson@example.com', 28, SYSUTCDATETIME()),
        (N'Sarah Chen', N'sarah.chen@example.com', 31, SYSUTCDATETIME()),
        (N'Michael Brown', N'michael.brown@example.com', 45, SYSUTCDATETIME());

    PRINT N'[SUCCESS] Initial sample users seeded successfully (4 records).';
END
ELSE
BEGIN
    PRINT N'[INFO] Table dbo.Users already contains records. Skipping seed step to preserve existing data.';
END
GO

-- 5. Verification query
PRINT N'[INFO] Current record count in SaiketTask6DB.dbo.Users:';
SELECT COUNT(*) AS [TotalUsers] FROM [dbo].[Users];
SELECT [Id], [Name], [Email], [Age], [CreatedAt], [UpdatedAt] FROM [dbo].[Users];
GO

