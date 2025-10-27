namespace PAPI.Models.DTOs
{
    public class RecommendedTherapistDto
    {
        public required string Id { get; set; }
        public required string Name { get; set; }
        public required string Surname { get; set; }
        public string? Specijalizacija { get; set; }
        public int Staz { get; set; }
        public required string Slug { get; set; } 
    }
}
