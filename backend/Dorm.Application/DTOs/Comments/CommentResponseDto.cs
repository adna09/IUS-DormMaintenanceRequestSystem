namespace Dorm.Application.DTOs.Comments;

public class CommentResponseDto
{
    public Guid Id { get; set; }
    public Guid RequestId { get; set; }
    public Guid AuthorId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsInternal { get; set; }
    public DateTime CreatedAt { get; set; }
}
