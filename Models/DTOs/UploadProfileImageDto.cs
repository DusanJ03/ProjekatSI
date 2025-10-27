using Microsoft.AspNetCore.Http;

namespace PAPI.Models.DTOs
{
    public class UploadProfileImageDto
    {
        public IFormFile File { get; set; } = null!;
    }
}
