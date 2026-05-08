using System.Security.Claims;
using Dorm.Application.DTOs.Auth;
using Dorm.Application.Interfaces;
using Dorm.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dorm.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IUserAuthRepository _users;

    public AuthController(IAuthService authService, IUserAuthRepository users)
    {
        _authService = authService;
        _users = users;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        try
        {
            var response = await _authService.RegisterAsync(dto);
            return Ok(response);
        }
        catch (ArgumentException)
        {
            return BadRequest(new { message = "Choose a valid account type (student or maintenance staff)." });
        }
        catch (InvalidOperationException)
        {
            return Conflict(new { message = "An account with this email already exists." });
        }
        catch
        {
            return BadRequest(new { message = "Registration failed." });
        }
    }

    [HttpPost("admin/create-user")]
    [Authorize(Roles = nameof(Role.Admin))]
    public async Task<IActionResult> CreatePrivilegedUser([FromBody] AdminCreateUserDto dto)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        try
        {
            var response = await _authService.CreatePrivilegedUserAsync(dto);
            return Ok(response);
        }
        catch (ArgumentException)
        {
            return BadRequest(new { message = "Role must be Admin or MaintenanceStaff." });
        }
        catch (InvalidOperationException)
        {
            return Conflict(new { message = "An account with this email already exists." });
        }
        catch
        {
            return BadRequest(new { message = "User creation failed." });
        }
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        try
        {
            var response = await _authService.LoginAsync(dto);
            return Ok(response);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }
        catch
        {
            return Unauthorized(new { message = "Login failed." });
        }
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        // Use ClaimTypes constants which map to the full namespace URIs
        var email = User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirstValue(ClaimTypes.Upn)
            ?? User.FindFirstValue(ClaimTypes.Name)
            ?? User.FindFirstValue("preferred_username")
            ?? User.FindFirstValue("upn")
            ?? User.FindFirstValue("unique_name");

        if (string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized(new
            {
                message = "No Microsoft email claim was found in the token."
            });
        }

        var normalizedEmail = email.Trim().ToLowerInvariant();
        var user = await _users.GetByNormalizedEmailAsync(normalizedEmail);

        if (user is null || !user.IsActive)
        {
            return Unauthorized(new
            {
                message = "Your Microsoft account is not linked to a user in this database. Ask an administrator to create an account with the same email address."
            });
        }

        return Ok(new
        {
            userId = user.Id,
            fullName = user.FullName,
            email = user.Email,
            role = user.Role.ToString()
        });
    }
}