using MongoDB.Driver;
using PAPI.Models;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using PAPI.Helpers;
using System.Linq.Expressions;
using PAPI.Models.DTOs;


namespace PAPI.Services
{
    public class UserServices
    {
        private readonly IMongoCollection<Users> _users;
        private readonly IMongoCollection<Psihoterapeut> _terapeuti;

        public UserServices(IOptions<ModelsDBSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DatabaseName);
            _users = database.GetCollection<Users>(settings.Value.UsersCollectionName);
            _terapeuti = database.GetCollection<Psihoterapeut>(settings.Value.UsersCollectionName);
        }

        public async Task<List<Users>> GetAsync() =>
            await _users.Find(_ => true).ToListAsync();

        public async Task<Users?> GetByIdAsync(string id)
        {
            return await _users.Find(u => u.Id == id).FirstOrDefaultAsync();
        }

        public async Task<Psihoterapeut?> GetTerapeutByIdAsync(string id)
        {
            return await _terapeuti.Find(t => t.Id == id).FirstOrDefaultAsync();
        }

        public async Task<Psihoterapeut?> GetTerapeutBySlugAsync(string slug)
        {
            return await _terapeuti.Find(t => t.Slug == slug).FirstOrDefaultAsync();
        }


        public async Task CreateAsync(Users user) =>
            await _users.InsertOneAsync(user);

        public async Task UpdateAsync(string id, Users userIn) =>
            await _users.ReplaceOneAsync(u => u.Id == id, userIn);

        public async Task DeleteAsync(string id) =>
            await _users.DeleteOneAsync(u => u.Id == id);

        public async Task<Users> GetByEmailAsync(string email)
        {
            return await _users.Find(u => u.Email == email).FirstOrDefaultAsync();
        }
        public async Task<Users?> AuthenticateAsync(string email, string password)
        {
            return await _users
                .Find(u => u.Email == email && u.Password == password)
                .FirstOrDefaultAsync();
        }
        public async Task<Users?> GetByUsernameAsync(string username)
        {
            return await _users.Find(u => u.UserName == username).FirstOrDefaultAsync();
        }
        public async Task<List<Psihoterapeut>> GetPsihoterapeutiByGradAsync(string grad)
        {
            var filter = Builders<Users>.Filter.Eq("grad", grad) &
                         Builders<Users>.Filter.Type("_t", BsonType.Array);

            var result = await _users.Find(filter).ToListAsync();

            return result.OfType<Psihoterapeut>().ToList(); 
        }

        public async Task<bool> DodajTerminAsync(string id, Termin termin)
        {
            termin.Status = StatusTermina.Zakazan;
            termin.KlijentId = "";
            var filter = Builders<Psihoterapeut>.Filter.Eq(x => x.Id, id);
            var update = Builders<Psihoterapeut>.Update.Push("Termini", termin);
            var result = await _terapeuti.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> ObrisiTerminAsync(string id, Termin termin)
        {
            var filter = Builders<Psihoterapeut>.Filter.Eq(x => x.Id, id);
            var update = Builders<Psihoterapeut>.Update.PullFilter("Termini",
                Builders<Termin>.Filter.Eq(t => t.Datum, termin.Datum) &
                Builders<Termin>.Filter.Eq(t => t.KlijentId, termin.KlijentId)
            );
            var result = await _terapeuti.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0;
        }

        public async Task<List<TerminDashboardDto>> VratiTermineAsync(string id)
        {
            var terapeut = await _terapeuti.Find(x => x.Id == id).FirstOrDefaultAsync();

            if (terapeut?.Termini == null || !terapeut.Termini.Any())
            {
                return new List<TerminDashboardDto>();
            }

            var klijentIds = terapeut.Termini
                .Where(t => !string.IsNullOrEmpty(t.KlijentId)) 
                .Select(t => t.KlijentId)
                .Distinct()
                .ToList();
            var klijentiFilter = Builders<Users>.Filter.In(k => k.Id, klijentIds);
            var klijenti = await _users.Find(klijentiFilter).ToListAsync();
            var klijentiMap = klijenti.ToDictionary(k => k.Id, k => $"{k.Name} {k.Surname}");

            var rezultat = terapeut.Termini.Select(termin => new TerminDashboardDto
            {
                Datum = termin.Datum,
                KlijentID = termin.KlijentId,
                Status = termin.Status,
                KlijentIme = !string.IsNullOrEmpty(termin.KlijentId) && klijentiMap.ContainsKey(termin.KlijentId)
                    ? klijentiMap[termin.KlijentId]
                    : null
            }).ToList();

            return rezultat;
        }

        public async Task<List<Psihoterapeut>> VratiSveTerapeuteAsync()
        {
            return await _users.OfType<Psihoterapeut>().Find(_ => true).ToListAsync();
        }

        public async Task<IzvucenTermin?> FindNextClientAppointmentAsync(string clientId)
        {
            var filter = Builders<Psihoterapeut>.Filter.ElemMatch(
                p => p.Termini,
                t => t.KlijentId == clientId
            );

            var terapeutiSaKlijentom = await _terapeuti.Find(filter).ToListAsync();

            if (!terapeutiSaKlijentom.Any())
            {
                return null;
            }

            var sledeciTerminInfo = terapeutiSaKlijentom
                .SelectMany(terapeut => terapeut.Termini.Select(termin => new { Terapeut = terapeut, Termin = termin }))
                .Where(x => 
                    x.Termin.KlijentId == clientId && 
                    x.Termin.Datum > DateTime.Now &&
                    x.Termin.Status == StatusTermina.Zakazan)
                .OrderBy(x => x.Termin.Datum)
                .FirstOrDefault();

            if (sledeciTerminInfo == null)
            {
                return null;
            }

            return new IzvucenTermin
            {
                Id = sledeciTerminInfo.Terapeut.Id,
                Name = sledeciTerminInfo.Terapeut.Name,
                Surname = sledeciTerminInfo.Terapeut.Surname,
                Slug = sledeciTerminInfo.Terapeut.Slug,
                Termin = sledeciTerminInfo.Termin
            };
        }

        public async Task<bool> ZakaziTerminAsync(string clientId, string therapistId, DateTime datum)
        {
            var terapeut = await GetTerapeutByIdAsync(therapistId);
            if (terapeut == null) return false; 

            var terminZaZakazivanje = terapeut.Termini.FirstOrDefault(t => t.Datum == datum);
            if (terminZaZakazivanje == null) return false;

            if (!string.IsNullOrEmpty(terminZaZakazivanje.KlijentId))
            {
                return false; 
            }

            terminZaZakazivanje.KlijentId = clientId;

            await _users.ReplaceOneAsync(u => u.Id == therapistId, terapeut);

            return true;
        }

        public async Task<RecenzijaOdgovor> AddReviewAsync(string clientId, string therapistId, int rating, string comment)
        {
            var klijent = await GetByIdAsync(clientId) as Klijent;
            if (klijent == null) return RecenzijaOdgovor.KlijentNotFound;

            var terapeut = await GetTerapeutByIdAsync(therapistId);
            if (terapeut == null) return RecenzijaOdgovor.TerapeutNotFound;

            if (terapeut.Recenzije.Any(r => r.KlijentId == clientId))
                return RecenzijaOdgovor.AlreadyReviewed;

            var novaRecenzija = new Recenzija
            {
                Id = ObjectId.GenerateNewId().ToString(),
                KlijentId = klijent.Id,
                ImeKlijenta = $"{klijent.Name} {klijent.Surname}",
                Ocena = rating,
                Komentar = comment,
                Datum = DateTime.UtcNow 
            };

            terapeut.Recenzije ??= new List<Recenzija>();
            terapeut.Recenzije.Add(novaRecenzija);

            await UpdateAsync(terapeut.Id, terapeut);

            return RecenzijaOdgovor.Success;
        }

        public async Task<bool> UpdateTherapistProfileImageAsync(string id, string imagePath)
        {
            var filter = Builders<Psihoterapeut>.Filter.Eq(t => t.Id, id);
            var update = Builders<Psihoterapeut>.Update.Set(t => t.ProfileImage, imagePath);
            var result = await _terapeuti.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateClientProfileImageAsync(string id, string imagePath)
        {
            var filter = Builders<Users>.Filter.Eq(c => c.Id, id);
            var update = Builders<Users>.Update.Set(c => c.ProfileImage, imagePath);
            var result = await _users.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0;
        }

        public async Task<(Termin? termin, Psihoterapeut? terapeut)> PronadjiTerminPoDatumuAsync(DateTime datumTermina)
        {
            var filter = Builders<Psihoterapeut>.Filter.ElemMatch(
                p => p.Termini,
                t => t.Datum == datumTermina
            );

            var terapeut = await _terapeuti.Find(filter).FirstOrDefaultAsync();
            if (terapeut == null)
            {
                return (null, null);
            }

            var termin = terapeut.Termini.FirstOrDefault(t => t.Datum == datumTermina);
            return (termin, terapeut);
        }


        public async Task<bool> OtkaziTerminAsync(string terapeutId, DateTime datum, StatusTermina noviStatus)
        {
            var filter = Builders<Psihoterapeut>.Filter.And(
                Builders<Psihoterapeut>.Filter.Eq(p => p.Id, terapeutId),
                Builders<Psihoterapeut>.Filter.ElemMatch(p => p.Termini, t => t.Datum == datum)
            );

            // $ je poseban MongoDB operator koji oznacava prvi element koji se poklopio sa ElemMatch
            var update = Builders<Psihoterapeut>.Update.Set("Termini.$.Status", noviStatus);

            var result = await _terapeuti.UpdateOneAsync(filter, update);

            return result.ModifiedCount > 0;
        }

        public IMongoCollection<Users> GetCollection() => _users;

    }
}
