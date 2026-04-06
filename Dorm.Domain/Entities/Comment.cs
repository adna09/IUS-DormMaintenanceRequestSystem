using Dorm.Domain.Entities;
namespace Dorm.Domain.Entities;
public class Comment
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsInternal { get; set; } = false; 
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    
    public Guid RequestId { get; set; }
    public Guid AuthorId { get; set; }

    
    public MaintenanceRequest Request { get; set; } = null!;
    public User Author { get; set; } = null!;
}