namespace PAPI.Models.DTOs
{
    public class AddReviewRequestDto
    {
        public required string TerapeutID { get; set; }
        public int Ocena { get; set; }
        public string? Komentar { get; set; }
    }
}
