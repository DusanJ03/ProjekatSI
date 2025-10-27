using System.ComponentModel.DataAnnotations;

namespace PAPI.Models.DTOs
{
    public class UpdateTherapistProfileDto
    {
        public required string Name { get; set; }
        public required string Surname { get; set; }
        public required string UserName { get; set; }
        public required string Email { get; set; }

        public string? Opis { get; set; }
        public string? Specijalizacija { get; set; }
        public string? Grad { get; set; }
        public string? Faks { get; set; }
        public int Staz { get; set; }
        public string? Password { get; set; }
        public string? ProfileImage { get; set; }
    }
}
