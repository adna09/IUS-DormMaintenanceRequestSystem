namespace Dorm.Application.DTOs.Analytics;

public class StaffWorkloadDto
{
    public Guid StaffId { get; set; }
    public string StaffName { get; set; } = string.Empty;
    public int AssignedRequests { get; set; }
    public int InProgressRequests { get; set; }
    public int ResolvedRequests { get; set; }
}
