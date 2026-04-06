using Dorm.Domain.Entities;
namespace Dorm.Domain.Entities;
public class AssignmentLog
{
    public Guid Id { get; set; }
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public string? Note { get; set; }

    
    public Guid RequestId { get; set; }
    public Guid AssignedById { get; set; }
    public Guid AssignedToId { get; set; }

    
    public MaintenanceRequest Request { get; set; } = null!;
    public User AssignedBy { get; set; } = null!;
    public User AssignedTo { get; set; } = null!;
}