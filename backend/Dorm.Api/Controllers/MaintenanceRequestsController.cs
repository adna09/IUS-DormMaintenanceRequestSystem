using Dorm.Application.DTOs.MaintenanceRequests;
using Dorm.Domain.Entities;
using Dorm.Domain.Enums;
using Dorm.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Dorm.Api.Controllers;

[ApiController]
[Route("api/maintenance-requests")]
[Authorize]
public class MaintenanceRequestsController : ControllerBase
{
    private readonly AppDbContext _context;

    public MaintenanceRequestsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    [Authorize(Roles = nameof(Role.Student))]
    public async Task<IActionResult> Create([FromBody] CreateMaintenanceRequestDto dto)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var categoryExists = await _context.Categories
            .AnyAsync(c => c.Id == dto.CategoryId && c.IsActive);
        if (!categoryExists)
            return BadRequest(new { message = "Selected category is invalid or inactive." });

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var studentId))
            return Unauthorized(new { message = "Invalid user token." });

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

        _context.MaintenanceRequests.Add(request);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMy), new { }, new { request.Id });
    }

    [HttpGet("my")]
    [Authorize(Roles = nameof(Role.Student))]
    public async Task<IActionResult> GetMy()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var studentId))
            return Unauthorized(new { message = "Invalid user token." });

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

        return Ok(requests);
    }
}
