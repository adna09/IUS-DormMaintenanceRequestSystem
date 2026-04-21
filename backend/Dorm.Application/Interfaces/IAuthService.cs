
namespace Dorm.Application.Interfaces;

using Dorm.Application.DTOs.Auth;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> CreatePrivilegedUserAsync(AdminCreateUserDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
}