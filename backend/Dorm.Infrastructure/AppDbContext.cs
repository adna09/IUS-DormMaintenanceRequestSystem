using Dorm.Domain.Entities;
using Dorm.Domain.Enums;
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

        // ── USER ──────────────────────────────────────────────
        builder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.Property(u => u.Id).ValueGeneratedOnAdd();
            e.Property(u => u.FullName).IsRequired().HasMaxLength(150);
            e.Property(u => u.Email).IsRequired().HasMaxLength(200);
            e.Property(u => u.NormalizedEmail).IsRequired().HasMaxLength(200);
            e.HasIndex(u => u.NormalizedEmail).IsUnique();
            e.Property(u => u.PasswordHash).IsRequired();
            e.Property(u => u.Role).HasConversion<string>();
            e.Property(u => u.PhoneNumber).HasMaxLength(20);
            e.Property(u => u.DormRoom).HasMaxLength(20);
        });

        // ── CATEGORY ──────────────────────────────────────────
        builder.Entity<Category>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Id).ValueGeneratedOnAdd();
            e.Property(c => c.Name).IsRequired().HasMaxLength(100);
            e.Property(c => c.Description).HasMaxLength(500);
        });

        // ── MAINTENANCEREQUEST ────────────────────────────────
        builder.Entity<MaintenanceRequest>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.Id).ValueGeneratedOnAdd();
            e.Property(r => r.Title).IsRequired().HasMaxLength(200);
            e.Property(r => r.Description).IsRequired();
            e.Property(r => r.Location).IsRequired().HasMaxLength(100);
            e.Property(r => r.Priority).HasConversion<string>();
            e.Property(r => r.Status).HasConversion<string>();

            // Student → može imati mnogo requestova
            e.HasOne(r => r.Student)
                .WithMany(u => u.SubmittedRequests)
                .HasForeignKey(r => r.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            // AssignedStaff → može imati mnogo assignovanih requestova
            e.HasOne(r => r.AssignedStaff)
                .WithMany(u => u.AssignedRequests)
                .HasForeignKey(r => r.AssignedStaffId)
                .OnDelete(DeleteBehavior.Restrict);

            // Category
            e.HasOne(r => r.Category)
                .WithMany(c => c.Requests)
                .HasForeignKey(r => r.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ── COMMENT ───────────────────────────────────────────
        builder.Entity<Comment>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Id).ValueGeneratedOnAdd();
            e.Property(c => c.Content).IsRequired();

            e.HasOne(c => c.Request)
                .WithMany(r => r.Comments)
                .HasForeignKey(c => c.RequestId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(c => c.Author)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ── ASSIGNMENTLOG ─────────────────────────────────────
        builder.Entity<AssignmentLog>(e =>
        {
            e.HasKey(a => a.Id);
            e.Property(a => a.Id).ValueGeneratedOnAdd();
            e.Property(a => a.Note).HasMaxLength(500);

            e.HasOne(a => a.Request)
                .WithMany(r => r.AssignmentLogs)
                .HasForeignKey(a => a.RequestId)
                .OnDelete(DeleteBehavior.Cascade);

            // AssignedBy
            e.HasOne(a => a.AssignedBy)
                .WithMany(u => u.AssignmentsMade)
                .HasForeignKey(a => a.AssignedById)
                .OnDelete(DeleteBehavior.Restrict);

            // AssignedTo
            e.HasOne(a => a.AssignedTo)
                .WithMany(u => u.AssignmentsReceived)
                .HasForeignKey(a => a.AssignedToId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ── RESOLUTIONLOG ─────────────────────────────────────
        builder.Entity<ResolutionLog>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.Id).ValueGeneratedOnAdd();
            e.Property(r => r.ResolutionNotes).IsRequired();
            e.Property(r => r.WorkDone).IsRequired();
            e.Property(r => r.PartsUsed).HasMaxLength(300);

            // Jedan request → jedan resolution log
            e.HasOne(r => r.Request)
                .WithOne(m => m.ResolutionLog)
                .HasForeignKey<ResolutionLog>(r => r.RequestId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(r => r.ResolvedBy)
                .WithMany(u => u.ResolutionsHandled)
                .HasForeignKey(r => r.ResolvedById)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}