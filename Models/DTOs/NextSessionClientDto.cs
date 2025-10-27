namespace PAPI.Models.DTOs
{
    public class NextSessionClientDto
    {
        public DateTime Datum { get; set; }
        public required string TerapeutIme { get; set; }
        public required string TerapeutSlug { get; set; }
    }
}
