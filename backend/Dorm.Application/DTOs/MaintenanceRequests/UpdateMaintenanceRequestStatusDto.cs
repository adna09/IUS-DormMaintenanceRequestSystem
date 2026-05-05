using Dorm.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace Dorm.Application.DTOs.MaintenanceRequests;

public class UpdateMaintenanceRequestStatusDto
{
    [Required]
    public RequestStatus Status { get; set; }

    public Guid? AssignedStaffId { get; set; }
}
