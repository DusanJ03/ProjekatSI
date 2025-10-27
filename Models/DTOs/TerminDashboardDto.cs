using PAPI.Helpers;
using System.Text.Json.Serialization;

namespace PAPI.Models.DTOs
{
    public class TerminDashboardDto
    {
        public DateTime Datum { get; set; }
        public string? KlijentIme { get; set; }
        public string? KlijentID { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public StatusTermina Status { get; set; }
    }
}
