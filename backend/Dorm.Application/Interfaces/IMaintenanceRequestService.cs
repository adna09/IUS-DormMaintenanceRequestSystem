using Dorm.Application.DTOs.MaintenanceRequests;

namespace Dorm.Application.Interfaces;

public interface IMaintenanceRequestService
{
    Task<Guid> CreateAsync(Guid studentId, CreateMaintenanceRequestDto dto);
    Task<IReadOnlyList<MaintenanceRequestListItemDto>> GetMyAsync(Guid studentId);
    Task<IReadOnlyList<MaintenanceRequestListItemDto>> GetAllAsync();
    Task<bool> UpdateAsync(Guid requestId, Guid studentId, UpdateMaintenanceRequestDto dto);
    Task<bool> DeleteAsync(Guid requestId, Guid studentId);
    Task<bool> UpdateStatusAsync(Guid requestId, UpdateMaintenanceRequestStatusDto dto);
}
