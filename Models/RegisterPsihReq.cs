namespace PAPI.Models
{
    public class RegisterPsihReq 
    {
        public string UserName { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Surname { get; set; } = null!;
        public string Email { get; set; } = null!;

        public string Faks { get; set; } = null!;
        public int Staz { get; set; }
        public string Specijalizacija { get; set; } = null!;
        public string Grad { get; set; } = null!;
    }
}
    