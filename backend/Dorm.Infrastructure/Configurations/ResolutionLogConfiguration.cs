using Dorm.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dorm.Infrastructure.Configurations;

public class ResolutionLogConfiguration : IEntityTypeConfiguration<ResolutionLog>
{
    public void Configure(EntityTypeBuilder<ResolutionLog> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).ValueGeneratedOnAdd();
        
        builder.Property(r => r.ResolutionNotes)
            .IsRequired();
        
        builder.Property(r => r.WorkDone)
            .IsRequired();
        
        builder.Property(r => r.PartsUsed)
            .HasMaxLength(300);

        // Jedan request → jedan resolution log
        builder.HasOne(r => r.Request)
            .WithOne(m => m.ResolutionLog)
            .HasForeignKey<ResolutionLog>(r => r.RequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.ResolvedBy)
            .WithMany(u => u.ResolutionsHandled)
            .HasForeignKey(r => r.ResolvedById)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
