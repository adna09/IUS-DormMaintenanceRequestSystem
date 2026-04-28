using Dorm.Domain.Entities;
using Dorm.Infrastructure.Configurations;
using Microsoft.EntityFrameworkCore;

namespace Dorm.Infrastructure;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<MaintenanceRequest> MaintenanceRequests => Set<MaintenanceRequest>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<AssignmentLog> AssignmentLogs => Set<AssignmentLog>();
    public DbSet<ResolutionLog> ResolutionLogs => Set<ResolutionLog>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfiguration(new UserConfiguration());
        builder.ApplyConfiguration(new CategoryConfiguration());
        builder.ApplyConfiguration(new MaintenanceRequestConfiguration());
        builder.ApplyConfiguration(new CommentConfiguration());
        builder.ApplyConfiguration(new AssignmentLogConfiguration());
        builder.ApplyConfiguration(new ResolutionLogConfiguration());
    }
}