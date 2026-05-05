using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Dorm.Application.Interfaces;
using Microsoft.AspNetCore.Authentication;

namespace Dorm.Api.Authentication;

public sealed class EntraUserClaimsTransformation : IClaimsTransformation
{
    private readonly IUserAuthRepository _users;

    public EntraUserClaimsTransformation(IUserAuthRepository users)
    {
        _users = users;
    }

    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        if (principal.Identity is not { IsAuthenticated: true })
            return principal;

        var issuer = principal.FindFirstValue(JwtRegisteredClaimNames.Iss);
        if (string.IsNullOrEmpty(issuer) ||
            !issuer.Contains("login.microsoftonline.com", StringComparison.OrdinalIgnoreCase))
        {
            return principal;
        }

        var email = principal.FindFirstValue(ClaimTypes.Email)
            ?? principal.FindFirstValue("preferred_username")
            ?? principal.FindFirstValue("upn")
            ?? principal.FindFirstValue("unique_name");

        if (string.IsNullOrWhiteSpace(email))
            return Unauthenticated();

        var normalized = email.Trim().ToLowerInvariant();
        var user = await _users.GetByNormalizedEmailAsync(normalized).ConfigureAwait(false);
        if (user is null || !user.IsActive)
            return Unauthenticated();

        var appIdentity = new ClaimsIdentity(
            new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
            },
            principal.Identity.AuthenticationType,
            ClaimTypes.Name,
            ClaimTypes.Role);

        return new ClaimsPrincipal(appIdentity);
    }

    private static ClaimsPrincipal Unauthenticated()
    {
        return new ClaimsPrincipal(new ClaimsIdentity());
    }
}
