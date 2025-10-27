using System.Text.Json.Serialization;

namespace PAPI.Helpers
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum StatusTermina
    {
        Zakazan,
        OtkazanOdStraneKlijenta,
        OtkazanOdStraneTerapeuta,
        Zavrsen
    }
}
