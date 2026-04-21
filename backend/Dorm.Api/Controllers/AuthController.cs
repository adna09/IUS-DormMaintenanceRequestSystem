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

    public AuthController(IAuthService authService)
    {
        _authService = authService;
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
}
