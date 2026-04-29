using Dorm.Domain.Entities;
namespace Dorm.Domain.Entities;
public class ResolutionLog
{
    public Guid Id { get; set; }
    public string ResolutionNotes { get; set; } = string.Empty;
    public string WorkDone { get; set; } = string.Empty;
    public string? PartsUsed { get; set; }
    public DateTime ResolvedAt { get; set; } = DateTime.UtcNow;

    
    public Guid RequestId { get; set; }
    public Guid ResolvedById { get; set; }

    
    public MaintenanceRequest Request { get; set; } = null!;
    public User ResolvedBy { get; set; } = null!;
}