namespace Dorm.Application.DTOs.Analytics;

public class AnalyticsSummaryDto
{
    public int TotalRequests { get; set; }
    public int PendingRequests { get; set; }
    public int InProgressRequests { get; set; }
    public int ResolvedRequests { get; set; }
    public int ReopenedRequests { get; set; }
    public int OverdueRequests { get; set; }
}
