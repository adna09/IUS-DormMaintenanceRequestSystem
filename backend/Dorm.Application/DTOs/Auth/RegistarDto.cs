using Dorm.Domain.Enums;
namespace Dorm.Application.DTOs.Auth;

public class RegisterDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? DormRoom { get; set; }
    public Role Role { get; set; } = Role.Student;
}