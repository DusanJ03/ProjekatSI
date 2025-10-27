namespace PAPI.Models
{
    public class RegisterUserRequest
    {
        
            public string Username { get; set; } = null!;
            public string Password { get; set; } = null!;
            public string Name { get; set; } = null!;
            public string Surname { get; set; } = null!;
            public string Email { get; set; } = null!;

            // Polja za psihoterapeuta, opcionalna
            public string? Faks { get; set; }
            public int? Staz { get; set; }
            public string? Specijalizacija { get; set; }

            public string Role { get; set; } = "User"; // ili "Psihoterapeut"
        
    }
}
