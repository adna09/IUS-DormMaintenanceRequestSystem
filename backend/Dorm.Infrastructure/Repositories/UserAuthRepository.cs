using Dorm.Application.Interfaces;
using Dorm.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dorm.Infrastructure.Repositories;

public class UserAuthRepository : IUserAuthRepository
{
    private readonly AppDbContext _context;

    public UserAuthRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> ExistsByNormalizedEmailAsync(string normalizedEmail)
    {
        return await _context.Users.AnyAsync(u => u.NormalizedEmail == normalizedEmail);
    }

    public async Task<User?> GetByNormalizedEmailAsync(string normalizedEmail)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail);
    }

    public async Task AddAsync(User user)
    {
        await _context.Users.AddAsync(user);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
