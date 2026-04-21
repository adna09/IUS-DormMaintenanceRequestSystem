using Dorm.Domain.Entities;

namespace Dorm.Application.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
