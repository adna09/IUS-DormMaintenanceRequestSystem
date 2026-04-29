using Dorm.Domain.Enums;
using Dorm.Domain.Entities;
namespace Dorm.Domain.Entities;

public class MaintenanceRequest
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Priority Priority { get; set; }
    public RequestStatus Status { get; set; } = RequestStatus.Pending;
    public string Location { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }

    
    public Guid StudentId { get; set; }
    public Guid? AssignedStaffId { get; set; }
    public Guid CategoryId { get; set; }

    
    public User Student { get; set; } = null!;
    public User? AssignedStaff { get; set; }
    public Category Category { get; set; } = null!;
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<AssignmentLog> AssignmentLogs { get; set; } = new List<AssignmentLog>();
    public ResolutionLog? ResolutionLog { get; set; }
}