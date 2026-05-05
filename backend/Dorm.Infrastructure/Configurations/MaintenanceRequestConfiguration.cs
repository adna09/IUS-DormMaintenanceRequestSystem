using Dorm.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dorm.Infrastructure.Configurations;

public class MaintenanceRequestConfiguration : IEntityTypeConfiguration<MaintenanceRequest>
{
    public void Configure(EntityTypeBuilder<MaintenanceRequest> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).ValueGeneratedOnAdd();
        
        builder.Property(r => r.Title)
            .IsRequired()
            .HasMaxLength(200);
        
        builder.Property(r => r.Description)
            .IsRequired();
        
        builder.Property(r => r.Location)
            .IsRequired()
            .HasMaxLength(100);
        
        builder.Property(r => r.Priority)
            .HasConversion<string>();
        
        builder.Property(r => r.Status)
            .HasConversion<string>();

        // Student → može imati mnogo requestova
        builder.HasOne(r => r.Student)
            .WithMany(u => u.SubmittedRequests)
            .HasForeignKey(r => r.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        // AssignedStaff → može imati mnogo assignovanih requestova
        builder.HasOne(r => r.AssignedStaff)
            .WithMany(u => u.AssignedRequests)
            .HasForeignKey(r => r.AssignedStaffId)
            .OnDelete(DeleteBehavior.Restrict);

        // Category
        builder.HasOne(r => r.Category)
            .WithMany(c => c.Requests)
            .HasForeignKey(r => r.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
