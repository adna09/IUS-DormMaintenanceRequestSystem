using Dorm.Application.DTOs.MaintenanceRequests;

namespace Dorm.Application.Interfaces;

public interface IMaintenanceRequestService
{
    Task<Guid> CreateAsync(Guid studentId, CreateMaintenanceRequestDto dto);
    Task<IReadOnlyList<MaintenanceRequestListItemDto>> GetMyAsync(Guid studentId);
}
