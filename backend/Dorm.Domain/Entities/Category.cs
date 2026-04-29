using Dorm.Domain.Enums;
namespace Dorm.Domain.Entities;

public class Category
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<MaintenanceRequest> Requests { get; set; } = new List<MaintenanceRequest>();
}