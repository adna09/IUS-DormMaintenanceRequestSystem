namespace Dorm.Domain.Entities;
using Dorm.Domain.Enums;
public class User
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public Role Role { get; set; }
    public string? DormRoom { get; set; }
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    
    public ICollection<MaintenanceRequest> SubmittedRequests { get; set; } = new List<MaintenanceRequest>();
    public ICollection<MaintenanceRequest> AssignedRequests { get; set; } = new List<MaintenanceRequest>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<AssignmentLog> AssignmentsMade { get; set; } = new List<AssignmentLog>();
    public ICollection<AssignmentLog> AssignmentsReceived { get; set; } = new List<AssignmentLog>();
    public ICollection<ResolutionLog> ResolutionsHandled { get; set; } = new List<ResolutionLog>();
}
