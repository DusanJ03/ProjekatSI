using PAPI.Helpers;
using System.Text.Json.Serialization;

namespace PAPI.Models.DTOs
{
    public class KlijentTerminDto
    {
        public DateTime Datum { get; set; }
        public string? TerapeutIme { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public StatusTermina Status { get; set; }
    }
}