# IUS Dorm Maintenance Request System

Module for managing dormitory maintenance requests at IUS.

## Tech Stack
- .NET 10 Web API
- Entity Framework Core
- SQL Server
- React + TypeScript (frontend - coming soon)

## Setup
1. Clone the repository
2. Update connection string in `appsettings.json`
3. Run migrations: `dotnet ef database update --project Dorm.Infrastructure --startup-project Dorm.Api`
4. Run: `dotnet run --project Dorm.Api`