using Dorm.Application.DTOs.Auth;
using Dorm.Application.Interfaces;
using Dorm.Domain.Entities;
using Dorm.Domain.Enums;

namespace Dorm.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserAuthRepository _userAuthRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public AuthService(
        IUserAuthRepository userAuthRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _userAuthRepository = userAuthRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        var normalizedEmail = NormalizeEmail(dto.Email);
        var exists = await _userAuthRepository.ExistsByNormalizedEmailAsync(normalizedEmail);
        if (exists)
            throw new InvalidOperationException("duplicate_email");

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = dto.FullName,
            Email = dto.Email.Trim(),
            NormalizedEmail = normalizedEmail,
            PasswordHash = _passwordHasher.HashPassword(dto.Password),
            Role = Role.Student,
            PhoneNumber = dto.PhoneNumber,
            DormRoom = dto.DormRoom,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _userAuthRepository.AddAsync(user);
        await _userAuthRepository.SaveChangesAsync();

        return ToAuthResponse(user);
    }

    public async Task<AuthResponseDto> CreatePrivilegedUserAsync(AdminCreateUserDto dto)
    {
        if (dto.Role is not Role.Admin and not Role.MaintenanceStaff)
            throw new ArgumentException("invalid_privileged_role");

        var normalizedEmail = NormalizeEmail(dto.Email);
        var exists = await _userAuthRepository.ExistsByNormalizedEmailAsync(normalizedEmail);
        if (exists)
            throw new InvalidOperationException("duplicate_email");

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = dto.FullName,
            Email = dto.Email.Trim(),
            NormalizedEmail = normalizedEmail,
            PasswordHash = _passwordHasher.HashPassword(dto.Password),
            Role = dto.Role,
            PhoneNumber = dto.PhoneNumber,
            DormRoom = dto.DormRoom,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _userAuthRepository.AddAsync(user);
        await _userAuthRepository.SaveChangesAsync();

        return ToAuthResponse(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var normalizedEmail = NormalizeEmail(dto.Email);
        var user = await _userAuthRepository.GetByNormalizedEmailAsync(normalizedEmail);

        if (user == null || !_passwordHasher.VerifyPassword(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("invalid_credentials");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("invalid_credentials");

        return ToAuthResponse(user);
    }

    private AuthResponseDto ToAuthResponse(User user)
    {
        return new AuthResponseDto
        {
            Token = _jwtTokenGenerator.GenerateToken(user),
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString(),
            UserId = user.Id
        };
    }

    private static string NormalizeEmail(string email)
    {
        return email.Trim().ToLowerInvariant();
    }
}
