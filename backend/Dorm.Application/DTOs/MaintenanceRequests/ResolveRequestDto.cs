using System.ComponentModel.DataAnnotations;

namespace Dorm.Application.DTOs.MaintenanceRequests;

public class ResolveRequestDto
{
    [Required]
    public string ResolutionNotes { get; set; } = string.Empty;

    [Required]
    public string WorkDone { get; set; } = string.Empty;

    [MaxLength(300)]
    public string? PartsUsed { get; set; }
}
