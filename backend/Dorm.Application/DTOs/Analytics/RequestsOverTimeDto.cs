namespace Dorm.Application.DTOs.Analytics;

public class RequestsOverTimeDto
{
    public DateTime Date { get; set; }
    public int CreatedCount { get; set; }
    public int ResolvedCount { get; set; }
}
