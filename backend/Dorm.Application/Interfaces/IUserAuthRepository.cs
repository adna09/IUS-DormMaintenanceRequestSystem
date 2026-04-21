using Dorm.Domain.Entities;

namespace Dorm.Application.Interfaces;

public interface IUserAuthRepository
{
    Task<bool> ExistsByNormalizedEmailAsync(string normalizedEmail);
    Task<User?> GetByNormalizedEmailAsync(string normalizedEmail);
    Task AddAsync(User user);
    Task SaveChangesAsync();
}
