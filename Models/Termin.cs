using PAPI.Helpers;

namespace PAPI.Models
{
    public class Termin
    {
        public DateTime Datum { get; set; }
        public required string KlijentId { get; set; }
        public StatusTermina Status { get; set; } = StatusTermina.Zakazan;
    }
}
