using Dorm.Application.DTOs.Comments;

namespace Dorm.Application.Interfaces;

public interface ICommentService
{
    Task<Guid> CreateAsync(Guid authorId, CreateCommentDto dto);
    Task<IReadOnlyList<CommentResponseDto>> GetByRequestIdAsync(Guid requestId, bool includeInternal = false);
}
