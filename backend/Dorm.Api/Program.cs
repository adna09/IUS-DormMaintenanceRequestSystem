using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Dorm.Api.Authentication;
using Dorm.Application.Interfaces;
using Dorm.Application.Services;
using Dorm.Infrastructure;
using Dorm.Infrastructure.Data;
using Dorm.Infrastructure.Repositories;
using Dorm.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Dorm API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Use a local JWT from POST /api/auth/login or an Azure AD access token (api scope)."
    });
});

static string SelectAuthScheme(HttpContext context)
{
    var auth = context.Request.Headers.Authorization.ToString();
    if (string.IsNullOrEmpty(auth) || !auth.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        return "LocalJwt";

    var token = auth["Bearer ".Length..].Trim();
    if (string.IsNullOrEmpty(token))
        return "LocalJwt";

    try
    {
        var handler = new JwtSecurityTokenHandler();
        if (!handler.CanReadToken(token))
            return "LocalJwt";

        var jwt = handler.ReadJwtToken(token);
        var iss = jwt.Issuer;
        if (!string.IsNullOrEmpty(iss) &&
            (iss.Contains("login.microsoftonline.com", StringComparison.OrdinalIgnoreCase)
             || iss.Contains("sts.windows.net", StringComparison.OrdinalIgnoreCase)))
        {
            return "AzureAd";
        }
    }
    catch
    {
        return "LocalJwt";
    }

    return "LocalJwt";
}

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var signingKey = Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!);

builder.Services.AddAuthentication(options =>
    {
        options.DefaultScheme = "Smart";
        options.DefaultAuthenticateScheme = "Smart";
        options.DefaultChallengeScheme = "Smart";
    })
    .AddPolicyScheme("Smart", "Azure AD or local JWT", options =>
    {
        options.ForwardDefaultSelector = SelectAuthScheme;
    })
    .AddJwtBearer("LocalJwt", options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(signingKey)
        };
    })
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"), jwtBearerScheme: "AzureAd");

builder.Services.AddScoped<IClaimsTransformation, EntraUserClaimsTransformation>();

// CORS — allow Vite dev server
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserAuthRepository, UserAuthRepository>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IMaintenanceRequestService, MaintenanceRequestService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();

builder.Services.AddAuthorization();

var app = builder.Build();

// Initialize database with default data
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
    await DbInitializer.InitializeAsync(dbContext, passwordHasher);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
