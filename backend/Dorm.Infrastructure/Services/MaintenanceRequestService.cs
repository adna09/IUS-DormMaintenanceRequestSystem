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

    public async Task<MaintenanceRequestListItemDto?> GetByIdAsync(Guid requestId)
    {
        return await _context.MaintenanceRequests
            .AsNoTracking()
            .Where(r => r.Id == requestId)
            .Include(r => r.Category)
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
            .FirstOrDefaultAsync();
    }

    public async Task<bool> UpdateAsync(Guid requestId, Guid studentId, UpdateMaintenanceRequestDto dto)
    {
        var request = await _context.MaintenanceRequests
            .FirstOrDefaultAsync(r => r.Id == requestId && r.StudentId == studentId);

        if (request is null)
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

        _context.MaintenanceRequests.Remove(request);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AssignAsync(Guid requestId, Guid assignedById, AssignRequestDto dto)
    {
        var request = await _context.MaintenanceRequests
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request is null)
            return false;

        var staffExists = await _context.Users
            .AnyAsync(u => u.Id == dto.StaffId && u.Role == Role.MaintenanceStaff && u.IsActive);

        if (!staffExists)
            throw new InvalidOperationException("invalid_staff");

        request.AssignedStaffId = dto.StaffId;
        request.Status = RequestStatus.Assigned;
        request.UpdatedAt = DateTime.UtcNow;

        var assignmentLog = new AssignmentLog
        {
            Id = Guid.NewGuid(),
            RequestId = requestId,
            AssignedById = assignedById,
            AssignedToId = dto.StaffId,
            AssignedAt = DateTime.UtcNow,
            Note = dto.Note
        };

        await _context.AssignmentLogs.AddAsync(assignmentLog);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ResolveAsync(Guid requestId, Guid resolvedById, ResolveRequestDto dto)
    {
        var request = await _context.MaintenanceRequests
            .Include(r => r.ResolutionLog)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request is null)
            return false;

        if (request.ResolutionLog is null)
        {
            var resolutionLog = new ResolutionLog
            {
                Id = Guid.NewGuid(),
                RequestId = requestId,
                ResolvedById = resolvedById,
                ResolutionNotes = dto.ResolutionNotes,
                WorkDone = dto.WorkDone,
                PartsUsed = dto.PartsUsed,
                ResolvedAt = DateTime.UtcNow
            };

            await _context.ResolutionLogs.AddAsync(resolutionLog);
        }
        else
        {
            request.ResolutionLog.ResolvedById = resolvedById;
            request.ResolutionLog.ResolutionNotes = dto.ResolutionNotes;
            request.ResolutionLog.WorkDone = dto.WorkDone;
            request.ResolutionLog.PartsUsed = dto.PartsUsed;
            request.ResolutionLog.ResolvedAt = DateTime.UtcNow;
        }

        request.Status = RequestStatus.Resolved;
        request.ResolvedAt = DateTime.UtcNow;
        request.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ReopenAsync(Guid requestId, Guid reopenedById, string? reason = null)
    {
        var request = await _context.MaintenanceRequests
            .Include(r => r.ResolutionLog)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request is null)
            return false;

        request.Status = request.AssignedStaffId.HasValue ? RequestStatus.Assigned : RequestStatus.Pending;
        request.ResolvedAt = null;
        request.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(reason))
        {
            var reopenComment = new Comment
            {
                Id = Guid.NewGuid(),
                RequestId = requestId,
                AuthorId = reopenedById,
                Content = reason,
                IsInternal = true,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Comments.AddAsync(reopenComment);
        }

        await _context.SaveChangesAsync();
        return true;
    }
}
