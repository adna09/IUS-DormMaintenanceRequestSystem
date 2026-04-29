using Dorm.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dorm.Infrastructure.Configurations;

public class AssignmentLogConfiguration : IEntityTypeConfiguration<AssignmentLog>
{
    public void Configure(EntityTypeBuilder<AssignmentLog> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).ValueGeneratedOnAdd();
        
        builder.Property(a => a.Note)
            .HasMaxLength(500);

        builder.HasOne(a => a.Request)
            .WithMany(r => r.AssignmentLogs)
            .HasForeignKey(a => a.RequestId)
            .OnDelete(DeleteBehavior.Cascade);

        // AssignedBy
        builder.HasOne(a => a.AssignedBy)
            .WithMany(u => u.AssignmentsMade)
            .HasForeignKey(a => a.AssignedById)
            .OnDelete(DeleteBehavior.Restrict);

        // AssignedTo
        builder.HasOne(a => a.AssignedTo)
            .WithMany(u => u.AssignmentsReceived)
            .HasForeignKey(a => a.AssignedToId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
