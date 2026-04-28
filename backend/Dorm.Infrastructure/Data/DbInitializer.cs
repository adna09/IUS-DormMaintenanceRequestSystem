using Dorm.Application.Interfaces;
using Dorm.Domain.Entities;
using Dorm.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Dorm.Infrastructure.Data;

public class DbInitializer
{
    public static async Task InitializeAsync(AppDbContext context, IPasswordHasher passwordHasher)
    {
        // Ensure database is created
        await context.Database.MigrateAsync();

        // Seed default Admin user if it doesn't exist
        if (!await context.Users.AnyAsync(u => u.Role == Role.Admin))
        {
            var adminUser = new User
            {
                Id = Guid.NewGuid(),
                FullName = "System Administrator",
                Email = "admin@dormmanagement.local",
                NormalizedEmail = "admin@dormmanagement.local",
                PasswordHash = passwordHasher.HashPassword("AdminPassword123!"),
                Role = Role.Admin,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Users.Add(adminUser);
        }

        // Seed default categories if they don't exist
        if (!await context.Categories.AnyAsync())
        {
            var categories = new List<Category>
            {
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Plumbing",
                    Description = "Water supply, drainage, and pipe-related issues",
                    IsActive = true
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Electrical",
                    Description = "Electrical wiring, outlets, and lighting issues",
                    IsActive = true
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "HVAC",
                    Description = "Heating, ventilation, and air conditioning problems",
                    IsActive = true
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Carpentry",
                    Description = "Doors, windows, furniture, and structural repairs",
                    IsActive = true
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Appliances",
                    Description = "Kitchen and laundry appliance issues",
                    IsActive = true
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "Cleaning & Sanitation",
                    Description = "Cleaning, pest control, and sanitation services",
                    IsActive = true
                },
                new Category
                {
                    Id = Guid.NewGuid(),
                    Name = "General Maintenance",
                    Description = "General upkeep and miscellaneous repairs",
                    IsActive = true
                }
            };

            context.Categories.AddRange(categories);
        }

        await context.SaveChangesAsync();
    }
}
