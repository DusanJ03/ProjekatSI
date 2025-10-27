using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
namespace PAPI.Models
{
    public class Psihoterapeut : Users
    {
        
        [BsonElement("faks")]
        [JsonPropertyName("faks")]
        public string Faks { get; set; } = null!;

        [BsonElement("staz")]
        [JsonPropertyName("staz")]
        public int Staz { get; set; }

        [BsonElement("specijalizacija")]
        [JsonPropertyName("specijalizacija")]
        public string Specijalizacija { get; set; } = null!;

        public override string Role => "Terapeut";

        [BsonElement("grad")]
        [JsonPropertyName("grad")]
        public string Grad { get; set; } = null!;

        [BsonElement("opis")]
        [JsonPropertyName("opis")]
        public string Opis { get; set; } = null!;

        [BsonElement("recenzije")]
        [JsonPropertyName("recenzije")]
        public List<Recenzija> Recenzije{ get; set; } = new List<Recenzija>();

        [BsonElement("termini")]
        [JsonPropertyName("termini")]
        public List<Termin> Termini { get; set; } = new List<Termin>();

        [BsonElement("slug")]
        [JsonPropertyName("slug")]
        public string? Slug { get; set; }

        public void DodajTermin(Termin d)
        {
            Termini.Add(d);
        }

        public void DeleteTermin(Termin d)
        {
            Termini.Remove(d);
        }
        
    }
}
    