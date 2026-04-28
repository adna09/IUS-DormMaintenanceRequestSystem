using System.ComponentModel.DataAnnotations;

namespace Dorm.Application.DTOs.Comments;

public class CreateCommentDto
{
    [Required]
    public Guid RequestId { get; set; }

    [Required]
    public string Content { get; set; } = string.Empty;

    public bool IsInternal { get; set; }
}
