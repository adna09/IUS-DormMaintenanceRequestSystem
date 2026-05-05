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

    public async Task<IReadOnlyList<MaintenanceRequestListItemDto>> GetAllAsync()
    {
        var requests = await _context.MaintenanceRequests
            .AsNoTracking()
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

    public async Task<bool> UpdateAsync(Guid requestId, Guid studentId, UpdateMaintenanceRequestDto dto)
    {
        var request = await _context.MaintenanceRequests
            .FirstOrDefaultAsync(r => r.Id == requestId && r.StudentId == studentId);

        if (request is null)
            return false;

        if (request.Status is RequestStatus.Resolved or RequestStatus.Cancelled)
            return false;

        var categoryExists = await _context.Categories
            .AnyAsync(c => c.Id == dto.CategoryId && c.IsActive);

        if (!categoryExists)
            throw new InvalidOperationException("invalid_category");

        request.Title = dto.Title;
        request.Description = dto.Description;
        request.Location = dto.Location;
        request.Priority = dto.Priority;
        request.CategoryId = dto.CategoryId;
        request.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid requestId, Guid studentId)
    {
        var request = await _context.MaintenanceRequests
            .FirstOrDefaultAsync(r => r.Id == requestId && r.StudentId == studentId);

        if (request is null)
            return false;

        if (request.Status is RequestStatus.Resolved or RequestStatus.Cancelled)
            return false;

        _context.MaintenanceRequests.Remove(request);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateStatusAsync(Guid requestId, UpdateMaintenanceRequestStatusDto dto)
    {
        var request = await _context.MaintenanceRequests
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request is null)
            return false;

        if (dto.Status is RequestStatus.Assigned or RequestStatus.InProgress)
        {
            var effectiveStaffId = dto.AssignedStaffId ?? request.AssignedStaffId;
            if (effectiveStaffId is null)
                throw new InvalidOperationException("staff_required");

            var staffExists = await _context.Users.AnyAsync(u =>
                u.Id == effectiveStaffId.Value &&
                (u.Role == Role.MaintenanceStaff || u.Role == Role.Admin));

            if (!staffExists)
                throw new InvalidOperationException("invalid_staff");

            request.AssignedStaffId = effectiveStaffId;
        }
        else if (dto.AssignedStaffId is not null)
        {
            var staffExists = await _context.Users.AnyAsync(u =>
                u.Id == dto.AssignedStaffId.Value &&
                (u.Role == Role.MaintenanceStaff || u.Role == Role.Admin));

            if (!staffExists)
                throw new InvalidOperationException("invalid_staff");

            request.AssignedStaffId = dto.AssignedStaffId;
        }
        else if (dto.Status == RequestStatus.Pending)
        {
            request.AssignedStaffId = null;
        }

        request.Status = dto.Status;
        request.ResolvedAt = dto.Status == RequestStatus.Resolved ? DateTime.UtcNow : null;
        request.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }
}
