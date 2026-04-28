using Dorm.Application.DTOs.Categories;

namespace Dorm.Application.Interfaces;

public interface ICategoryService
{
    Task<Guid> CreateAsync(CreateCategoryDto dto);
    Task<IReadOnlyList<CategoryResponseDto>> GetAllAsync(bool includeInactive = false);
    Task<CategoryResponseDto?> GetByIdAsync(Guid id);
    Task<bool> UpdateAsync(Guid id, UpdateCategoryDto dto);
    Task<bool> DeleteAsync(Guid id);
}
