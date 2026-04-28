using Dorm.Application.DTOs.MaintenanceRequests;

namespace Dorm.Application.Interfaces;

public interface IMaintenanceRequestService
{
    Task<Guid> CreateAsync(Guid studentId, CreateMaintenanceRequestDto dto);
    Task<IReadOnlyList<MaintenanceRequestListItemDto>> GetAllAsync();
    Task<MaintenanceRequestListItemDto?> GetByIdAsync(Guid requestId);
    Task<IReadOnlyList<MaintenanceRequestListItemDto>> GetMyAsync(Guid studentId);
    Task<bool> UpdateAsync(Guid requestId, Guid studentId, UpdateMaintenanceRequestDto dto);
    Task<bool> DeleteAsync(Guid requestId, Guid studentId);
    Task<bool> AssignAsync(Guid requestId, Guid assignedById, AssignRequestDto dto);
    Task<bool> ResolveAsync(Guid requestId, Guid resolvedById, ResolveRequestDto dto);
    Task<bool> ReopenAsync(Guid requestId, Guid reopenedById, string? reason = null);
}
