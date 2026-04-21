using Dorm.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace Dorm.Application.DTOs.Auth;

public class AdminCreateUserDto
{
    [Required]
    [MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public Role Role { get; set; }

    [MaxLength(20)]
    public string? DormRoom { get; set; }

    [Phone]
    [MaxLength(20)]
    public string? PhoneNumber { get; set; }
}
