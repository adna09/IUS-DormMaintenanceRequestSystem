using Dorm.Application.DTOs.Categories;
using Dorm.Application.Interfaces;
using Dorm.Domain.Entities;
using Dorm.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Dorm.Interfaces.Services;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> CreateAsync(CreateCategoryDto dto)
    {
        var normalizedName = NormalizeName(dto.Name);

        var exists = await _context.Categories
            .AnyAsync(c => c.Name.ToLower() == normalizedName);

        if (exists)
            throw new InvalidOperationException("category_name_exists");

        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim() ?? string.Empty,
            IsActive = dto.IsActive
        };

        await _context.Categories.AddAsync(category);
        await _context.SaveChangesAsync();

        return category.Id;
    }

    public async Task<IReadOnlyList<CategoryResponseDto>> GetAllAsync(bool includeInactive = false)
    {
        var query = _context.Categories.AsNoTracking();

        if (!includeInactive)
            query = query.Where(c => c.IsActive);

        var categories = await query
            .OrderBy(c => c.Name)
            .Select(c => new CategoryResponseDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                IsActive = c.IsActive
            })
            .ToListAsync();

        return categories;
    }

    public async Task<CategoryResponseDto?> GetByIdAsync(Guid id)
    {
        return await _context.Categories
            .AsNoTracking()
            .Where(c => c.Id == id)
            .Select(c => new CategoryResponseDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                IsActive = c.IsActive
            })
            .FirstOrDefaultAsync();
    }

    public async Task<bool> UpdateAsync(Guid id, UpdateCategoryDto dto)
    {
        var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id);
        if (category is null)
            return false;

        var normalizedName = NormalizeName(dto.Name);

        var duplicateExists = await _context.Categories
            .AnyAsync(c => c.Id != id && c.Name.ToLower() == normalizedName);

        if (duplicateExists)
            throw new InvalidOperationException("category_name_exists");

        category.Name = dto.Name.Trim();
        category.Description = dto.Description?.Trim() ?? string.Empty;
        category.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id);
        if (category is null)
            return false;

        if (!category.IsActive)
            return true;

        category.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }

    private static string NormalizeName(string name)
    {
        var trimmed = name?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(trimmed))
            throw new ArgumentException("Category name is required.", nameof(name));

        if (trimmed.Length > 100)
            throw new ArgumentException("Category name must be 100 characters or fewer.", nameof(name));

        return trimmed.ToLower();
    }
}
