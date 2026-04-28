using System.ComponentModel.DataAnnotations;

namespace Dorm.Application.DTOs.MaintenanceRequests;

public class AssignRequestDto
{
    [Required]
    public Guid StaffId { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }
}
