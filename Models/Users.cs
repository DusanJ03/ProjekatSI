using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
namespace PAPI.Models
{
    public abstract class Users
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        [JsonIgnore]
        public string? Id { get; set; }

        [BsonElement("username")]
        [JsonPropertyName("username")]
        public string UserName { get; set; } = null!;

        [BsonElement("Given Name")]
        public string Name { get; set; } = null!;
        [StringLength(50)]
        [BsonElement("Surname")]
        public string Surname { get; set; } = null!;

        [BsonElement("email")]
        public string Email { get; set; } = null!;
        [BsonElement("password")]
        public string Password { get; set; } = null!;

        [BsonElement("profileImage")]
        [JsonPropertyName("profileImage")]
        public string? ProfileImage { get; set; }

        [BsonIgnore]
        [JsonIgnore]
        public abstract string Role { get; }

    }
}
