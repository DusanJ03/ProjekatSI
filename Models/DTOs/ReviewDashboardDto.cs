namespace PAPI.Models.DTOs
{
    public class ReviewDashboardDto
    {
        public required string KlijentIme { get; set; }
        public string? KlijentID { get; set; }
        public required int Ocena { get; set; }
        public string ?Komentar { get; set; }
        public DateTime Datum { get; set; }
    }
}
