using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace PAPI.Models
{
    public class Recenzija
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public required string Id { get; set; }
        public required string KlijentId { get; set; }
        public string? ImeKlijenta { get; set; }
        public int Ocena { get; set; }
        public string? Komentar { get; set; }
        public DateTime Datum { get; set; } = DateTime.UtcNow;
    }
}
