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
}
