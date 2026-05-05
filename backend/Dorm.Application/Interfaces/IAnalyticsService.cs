using Dorm.Application.DTOs.Analytics;

namespace Dorm.Application.Interfaces;

public interface IAnalyticsService
{
    Task<AnalyticsSummaryDto> GetSummaryAsync(DateTime? from = null, DateTime? to = null);
    Task<IReadOnlyList<RequestsOverTimeDto>> GetRequestsOverTimeAsync(DateTime from, DateTime to);
    Task<IReadOnlyList<StaffWorkloadDto>> GetStaffWorkloadAsync(DateTime? from = null, DateTime? to = null);
}
