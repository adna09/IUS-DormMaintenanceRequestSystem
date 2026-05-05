using Dorm.Application.DTOs.MaintenanceRequests;
using Dorm.Application.Interfaces;
using Dorm.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Dorm.Api.Controllers;

[ApiController]
[Route("api/maintenance-requests")]
[Authorize]
public class MaintenanceRequestsController : ControllerBase
{
    private readonly IMaintenanceRequestService _maintenanceRequestService;

    public MaintenanceRequestsController(IMaintenanceRequestService maintenanceRequestService)
    {
        _maintenanceRequestService = maintenanceRequestService;
    }

    [HttpPost]
    [Authorize(Roles = nameof(Role.Student))]
    public async Task<IActionResult> Create([FromBody] CreateMaintenanceRequestDto dto)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var studentId))
            return Unauthorized(new { message = "Invalid user token." });

        try
        {
            var requestId = await _maintenanceRequestService.CreateAsync(studentId, dto);
            return CreatedAtAction(nameof(GetMy), new { }, new { Id = requestId });
        }
        catch (InvalidOperationException)
        {
            return BadRequest(new { message = "Selected category is invalid or inactive." });
        }
    }

    [HttpGet]
    [Authorize(Roles = $"{nameof(Role.MaintenanceStaff)},{nameof(Role.Admin)}")]
    public async Task<IActionResult> GetAll()
    {
        var requests = await _maintenanceRequestService.GetAllAsync();
        return Ok(requests);
    }

    [HttpGet("my")]
    [Authorize(Roles = nameof(Role.Student))]
    public async Task<IActionResult> GetMy()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var studentId))
            return Unauthorized(new { message = "Invalid user token." });

        var requests = await _maintenanceRequestService.GetMyAsync(studentId);
        return Ok(requests);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = nameof(Role.Student))]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateMaintenanceRequestDto dto)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var studentId))
            return Unauthorized(new { message = "Invalid user token." });

        try
        {
            var updated = await _maintenanceRequestService.UpdateAsync(id, studentId, dto);
            if (!updated)
            {
                return NotFound(new
                {
                    message = "Request not found, not owned by you, or cannot be updated in its current state."
                });
            }

            return NoContent();
        }
        catch (InvalidOperationException)
        {
            return BadRequest(new { message = "Selected category is invalid or inactive." });
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = nameof(Role.Student))]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var studentId))
            return Unauthorized(new { message = "Invalid user token." });

        var deleted = await _maintenanceRequestService.DeleteAsync(id, studentId);
        if (!deleted)
        {
            return NotFound(new
            {
                message = "Request not found, not owned by you, or cannot be deleted in its current state."
            });
        }

        return NoContent();
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = $"{nameof(Role.MaintenanceStaff)},{nameof(Role.Admin)}")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateMaintenanceRequestStatusDto dto)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        try
        {
            var updated = await _maintenanceRequestService.UpdateStatusAsync(id, dto);
            if (!updated)
                return NotFound(new { message = "Request not found." });

            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message is "staff_required" or "invalid_staff")
        {
            var message = ex.Message == "staff_required"
                ? "Assigned or in-progress status requires a maintenance staff or admin assignee (existing or in the request body)."
                : "Assignee must be an existing user with the MaintenanceStaff or Admin role.";

            return BadRequest(new { message });
        }
    }
}
