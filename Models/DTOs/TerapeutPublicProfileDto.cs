namespace PAPI.Models.DTOs
{
    public class TerapeutPublicProfileDto
    {
        public required string Id { get; set; }
        public required string Name { get; set; }
        public required string Surname { get; set; }
        public required string Email { get; set; }
        public string? Specijalizacija { get; set; }
        public string? Opis { get; set; }
        public string? Grad { get; set; }
        public string? Faks { get; set; }
        public int Staz { get; set; }
        public double ProsecnaOcena { get; set; }
        public List<ReviewDashboardDto> Recenzije { get; set; } = new List<ReviewDashboardDto>();
        public string? ProfileImage { get; set; }
        public string? Slug { get; set; }
    }
}
