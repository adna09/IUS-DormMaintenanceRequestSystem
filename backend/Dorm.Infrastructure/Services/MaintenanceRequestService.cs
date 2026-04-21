using Dorm.Application.DTOs.MaintenanceRequests;
using Dorm.Application.Interfaces;
using Dorm.Domain.Entities;
using Dorm.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Dorm.Infrastructure.Services;

public class MaintenanceRequestService : IMaintenanceRequestService
{
    private readonly AppDbContext _context;

    public MaintenanceRequestService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> CreateAsync(Guid studentId, CreateMaintenanceRequestDto dto)
    {
        var categoryExists = await _context.Categories
            .AnyAsync(c => c.Id == dto.CategoryId && c.IsActive);

        if (!categoryExists)
            throw new InvalidOperationException("invalid_category");

        var request = new MaintenanceRequest
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            Location = dto.Location,
            Priority = dto.Priority,
            Status = RequestStatus.Pending,
            StudentId = studentId,
            CategoryId = dto.CategoryId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.MaintenanceRequests.AddAsync(request);
        await _context.SaveChangesAsync();

        return request.Id;
    }

    public async Task<IReadOnlyList<MaintenanceRequestListItemDto>> GetMyAsync(Guid studentId)
    {
        var requests = await _context.MaintenanceRequests
            .AsNoTracking()
            .Where(r => r.StudentId == studentId)
            .Include(r => r.Category)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new MaintenanceRequestListItemDto
            {
                Id = r.Id,
                Title = r.Title,
                Description = r.Description,
                Location = r.Location,
                Priority = r.Priority.ToString(),
                Status = r.Status.ToString(),
                CategoryId = r.CategoryId,
                CategoryName = r.Category.Name,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt
            })
            .ToListAsync();

        return requests;
    }
}
