using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using PAPI.Models;
using PAPI.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using PAPI.Models.DTOs;
using MongoDB.Bson;
using PAPI.Helpers;

namespace PAPI.Controllers
{
    [ApiController]
    [Route("api/terapeuti")]
    public class TherapistsController : ControllerBase
    {
        private readonly UserServices _userService;
        private readonly PasswordHasher<Users> _passwordHasher;

        public TherapistsController(UserServices userService)
        {
            _userService = userService;
            _passwordHasher = new PasswordHasher<Users>();
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterPsihoterapeut([FromBody] Psihoterapeut request)
        {
            if (string.IsNullOrWhiteSpace(request.UserName) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.Name) ||
                string.IsNullOrWhiteSpace(request.Surname) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Faks) ||
                request.Staz <= 0 ||
                string.IsNullOrWhiteSpace(request.Specijalizacija) ||
                string.IsNullOrWhiteSpace(request.Grad) ||
                string.IsNullOrWhiteSpace(request.Opis))
            {
                return BadRequest("Sva polja za psihoterapeuta su obavezna.");
            }

            var existingUser = await _userService.GetByUsernameAsync(request.UserName);
            if (existingUser != null)
                return BadRequest("Username je već zauzet.");

            var user = new Psihoterapeut
            {
                UserName = request.UserName,
                Password = _passwordHasher.HashPassword(null, request.Password),
                Name = request.Name,
                Surname = request.Surname,
                Email = request.Email,
                Faks = request.Faks,
                Staz = request.Staz,
                Specijalizacija = request.Specijalizacija,
                Grad = request.Grad,
                Opis = request.Opis,
                Slug = SlugHelper.GenerateSlug(request.Name + " " + request.Surname)
            };

            await _userService.CreateAsync(user);
            return Ok("Registracija psihoterapeuta uspešna.");
        }

        [HttpGet("pretraga")]
        public async Task<IActionResult> PretraziPoGradu([FromQuery] string? grad)
        {
            var filterGrad = string.IsNullOrEmpty(grad)
                ? Builders<Users>.Filter.Empty
                : Builders<Users>.Filter.Eq("grad", grad);

            var filterPsihoterapeut = Builders<Users>.Filter.AnyEq("_t", "Psihoterapeut");
            var filter = Builders<Users>.Filter.And(filterGrad, filterPsihoterapeut);

            var terapeuti = await _userService
                .GetCollection()
                .Find(filter)
                .ToListAsync();

            var samoPsihoterapeuti = terapeuti
                .OfType<Psihoterapeut>()
                .ToList();

            var terapeutiDto = samoPsihoterapeuti.Select(terapeut => new TerapeutPublicProfileDto
            {
                Id = terapeut.Id,
                Name = terapeut.Name,     
                Surname = terapeut.Surname, 
                Specijalizacija = terapeut.Specijalizacija,
                Staz = terapeut.Staz,
                ProfileImage = terapeut.ProfileImage,
                Email = terapeut.Email,
                Slug = terapeut.Slug,

                ProsecnaOcena = terapeut.Recenzije != null && terapeut.Recenzije.Any()
                        ? terapeut.Recenzije.Average(r => r.Ocena)
                        : 0 
            }).ToList();

            return Ok(terapeutiDto);
        }

        [Authorize(Roles = "Terapeut")]
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardData()
        {
            var terapeutId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(terapeutId))
            {
                return Unauthorized("Nije moguće identifikovati korisnika.");
            }

            var terapeut = await _userService.GetByIdAsync(terapeutId) as Psihoterapeut;
            if (terapeut == null)
            {
                return NotFound("Terapeut nije pronađen.");
            }

            var nextSession = terapeut.Termini
                .Where(t =>
                    !string.IsNullOrEmpty(t.KlijentId) &&
                    t.Datum > DateTime.UtcNow &&
                    t.Status == StatusTermina.Zakazan) 
                .OrderBy(t => t.Datum)
                .FirstOrDefault();

            TerminDashboardDto? nextSessionDto = null;

            if (nextSession != null)
            {
                var klijent = await _userService.GetByIdAsync(nextSession.KlijentId) as Klijent;

                if (klijent != null)
                {
                    nextSessionDto = new TerminDashboardDto
                    {
                        Datum = nextSession.Datum,
                        KlijentIme = klijent.Name,
                        Status = nextSession.Status
                    };
                }
            }

            var ProsecnaOcena = terapeut.Recenzije.Any()
            ? terapeut.Recenzije.Average(r => r.Ocena): 0;

            var recentReviews = terapeut.Recenzije
                .OrderByDescending(r => r.Datum)
                .Take(3)
                .Select(r => new ReviewDashboardDto
                {
                    KlijentID = r.KlijentId,
                    KlijentIme = r.ImeKlijenta,
                    Ocena = r.Ocena,
                    Komentar = r.Komentar
                })
                .ToList();
            

            var upcomingAppointmentsCount = terapeut.Termini
                .Count(t => t.KlijentId != null && t.KlijentId.Trim() != "" && 
                t.Datum > DateTime.UtcNow && t.Status == StatusTermina.Zakazan);

            var dashboardData = new TerapeutDashboardDto
            {
                NextSession = nextSessionDto,
                ProsecnaOcena = Math.Round(ProsecnaOcena, 1),
                RecentReviews = recentReviews,
                UpcomingAppointmentsCount = upcomingAppointmentsCount
            };

            return Ok(dashboardData);
        }

        [HttpPost("{id}/termini")]
        public async Task<IActionResult> DodajTermin(string id, [FromBody] Termin termin)
        {
            var result = await _userService.DodajTerminAsync(id, termin);
            if (!result) return NotFound("Psihoterapeut nije pronađen.");
            return Ok("Termin dodat.");
        }

        [HttpDelete("{id}/termini")]
        public async Task<IActionResult> ObrisiTermin(string id, [FromBody] Termin termin)
        {
            var result = await _userService.ObrisiTerminAsync(id, termin);
            if (!result) return NotFound("Psihoterapeut ili termin nisu pronađeni.");
            return Ok("Termin obrisan.");
        }

        [HttpGet("{id}/termini")]
        public async Task<IActionResult> VratiTermine(string id)
        {
            var termini = await _userService.VratiTermineAsync(id);
            return Ok(termini);
        }

        [HttpGet("recommended")]
        public async Task<IActionResult> Index()
        {
            var SviTerapeuti = await _userService.VratiSveTerapeuteAsync();

            //  Ovde mozes dodati logiku za "preporuku" 
            //  npr. uzeti one sa najboljom prosecnom ocenom, ili nasumicne
            //  za sada, uzecemo prvih 6 kao primer
            var recommendedTherapists = SviTerapeuti.Take(6);

            var therapistsDto = recommendedTherapists.Select(t => new RecommendedTherapistDto
            {
                Id = t.Id,
                Name = t.Name,
                Surname = t.Surname,
                Specijalizacija = t.Specijalizacija,
                Staz = t.Staz,
                Slug = t.Slug 
            }).ToList();

            return Ok(therapistsDto);
        }

        [HttpPut("update")]
        [Authorize(Roles = "Terapeut")]
        public async Task<IActionResult> UpdateTherapistProfile([FromBody] UpdateTherapistProfileDto updatedData)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Nije moguće pronaći ID korisnika.");
            }

            var therapist = await _userService.GetByIdAsync(userId) as Psihoterapeut;
            if (therapist == null)
            {
                return NotFound("Terapeut nije pronađen.");
            }

            therapist.Name = updatedData.Name;
            therapist.Surname = updatedData.Surname;
            therapist.UserName = updatedData.UserName;
            therapist.Email = updatedData.Email;
            therapist.Faks = updatedData.Faks;
            therapist.Staz = updatedData.Staz;
            therapist.Specijalizacija = updatedData.Specijalizacija;
            therapist.Grad = updatedData.Grad;
            therapist.Opis = updatedData.Opis;
            therapist.ProfileImage = updatedData.ProfileImage;

            if (!string.IsNullOrEmpty(updatedData.Password))
            {
                therapist.Password = _passwordHasher.HashPassword(therapist, updatedData.Password);
            }

            await _userService.UpdateAsync(userId, therapist);

            return Ok(therapist);
        }


        [HttpGet("me")]
        [Authorize(Roles = "Terapeut")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("userId")?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized("Nije pronađen korisnik u tokenu.");

            var therapist = await _userService.GetTerapeutByIdAsync(userId);

            if (therapist == null)
                return NotFound("Terapeut nije pronađen.");

            var result = new
            {
                therapist.Id,
                therapist.Name,
                therapist.Surname,
                therapist.UserName,
                therapist.Email,
                therapist.Grad,
                therapist.Specijalizacija,
                therapist.Faks,
                therapist.Staz,
                therapist.Opis,
                therapist.Recenzije,
                therapist.ProfileImage,
            };

            return Ok(result);
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTerapeutById(string id)
        {
            var terapeut = await _userService.GetTerapeutByIdAsync(id);

            return await ProcessTerapeutProfileRequest(terapeut);
        }

        [AllowAnonymous]
        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetTerapeutBySlug(string slug)
        {
            var terapeut = await _userService.GetTerapeutBySlugAsync(slug);

            return await ProcessTerapeutProfileRequest(terapeut);
        }

        private async Task<IActionResult> ProcessTerapeutProfileRequest(Psihoterapeut? terapeut)
        {
            if (terapeut == null)
            {
                return NotFound("Terapeut nije pronađen.");
            }

            var reviewTasks = terapeut.Recenzije
                .OrderByDescending(r => r.Datum)
                .Select(async r =>
                {
                    var klijent = await _userService.GetByIdAsync(r.KlijentId) as Klijent;
                    return new ReviewDashboardDto
                    {
                        KlijentIme = klijent?.Name ?? "Nepoznat klijent",
                        KlijentID = klijent.Id,
                        Ocena = r.Ocena,
                        Komentar = r.Komentar,
                        Datum = r.Datum
                    };
                });

            var recenzijeDto = (await Task.WhenAll(reviewTasks)).ToList();

            var publicProfileDto = new TerapeutPublicProfileDto
            {
                Id = terapeut.Id,
                Name = terapeut.Name,
                Surname = terapeut.Surname,
                Email = terapeut.Email,
                Specijalizacija = terapeut.Specijalizacija,
                Opis = terapeut.Opis,
                Grad = terapeut.Grad,
                Faks = terapeut.Faks,
                Staz = terapeut.Staz,
                ProsecnaOcena = terapeut.Recenzije.Any()
                    ? Math.Round(terapeut.Recenzije.Average(r => r.Ocena), 2)
                    : 0,
                Recenzije = recenzijeDto,
                ProfileImage = terapeut.ProfileImage
            };

            return Ok(publicProfileDto);
        }



    }
}

