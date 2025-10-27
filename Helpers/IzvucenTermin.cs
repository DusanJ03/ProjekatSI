using PAPI.Models;

namespace PAPI.Helpers
{
    public class IzvucenTermin
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Slug { get; set; }

        public Termin Termin { get; set; }
    }
}
