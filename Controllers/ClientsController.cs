using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PAPI.Models;
using PAPI.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using PAPI.Models.DTOs;
using PAPI.Helpers;
using MongoDB.Driver;

namespace PAPI.Controllers
{
    [ApiController]
    [Route("api/klijenti")]
    public class ClientsController : ControllerBase
    {
        private readonly UserServices _userService;
        private readonly PasswordHasher<Users> _passwordHasher;

        public ClientsController(UserServices userService)
        {
            _userService = userService;
            _passwordHasher = new PasswordHasher<Users>();
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterKlijent([FromBody] Klijent request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) ||
                string.IsNullOrWhiteSpace(request.Surname) ||
                string.IsNullOrWhiteSpace(request.UserName) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Obavezna polja nisu popunjena.");
            }

            var existingUser = await _userService.GetByUsernameAsync(request.UserName);
            if (existingUser != null)
                return BadRequest("Username je već zauzet.");

            var user = new Klijent
            {
                UserName = request.UserName,
                Password = _passwordHasher.HashPassword(null, request.Password),
                Name = request.Name,
                Surname = request.Surname,
                Email = request.Email,
            };

            await _userService.CreateAsync(user);
            return Ok("Registracija klijenta uspešna.");
        }

        [HttpGet("me")]
        [Authorize(Roles = "Klijent")]
        public async Task<IActionResult> GetMyClientProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("Id")?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("Nije pronađen korisnik u tokenu.");

            var client = await _userService.GetByIdAsync(userId) as Klijent;
            if (client == null)
                return NotFound("Klijent nije pronađen.");

            var result = new
            {
                name = client.Name,
                surname = client.Surname,
                username = client.UserName,
                email = client.Email,
                profileimage = string.IsNullOrEmpty(client.ProfileImage)
                ? null
                : client.ProfileImage
            };

            return Ok(result);
        }

        [HttpPut("update")]
        [Authorize(Roles = "Klijent")]
        public async Task<IActionResult> UpdateMyClientProfile([FromBody] UpdateClientProfileDto updatedData)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("Nije pronađen korisnik u tokenu.");

            var client = await _userService.GetByIdAsync(userId) as Klijent;
            if (client == null)
                return NotFound("Klijent nije pronađen.");

            client.Name = updatedData.Name;
            client.Surname = updatedData.Surname;
            client.UserName = updatedData.UserName;
            client.Email = updatedData.Email;
            client.ProfileImage = updatedData.ProfileImage;

            if (!string.IsNullOrEmpty(updatedData.Password))
            {
                client.Password = _passwordHasher.HashPassword(client, updatedData.Password);
            }

            await _userService.UpdateAsync(userId, client);

            return Ok("Profil uspešno ažuriran.");
        }

        [HttpGet("termini")]
        [Authorize(Roles = "Klijent")]
        public async Task<IActionResult> GetMyAppointments()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("Nije pronađen korisnik u tokenu.");

                var filter = Builders<Psihoterapeut>.Filter.ElemMatch(p => p.Termini, t => t.KlijentId == userId);

                var relevantniTerapeuti = await _userService.GetCollection()
                    .OfType<Psihoterapeut>()
                    .Find(filter)
                    .ToListAsync();

                var mojiTermini = relevantniTerapeuti
                    .SelectMany(terapeut => terapeut.Termini
                        .Where(termin => termin.KlijentId == userId)
                        .Select(termin => new KlijentTerminDto
                        {
                            Datum = termin.Datum,
                            TerapeutIme = $"{terapeut.Name} {terapeut.Surname}",
                            Status = termin.Status 
                        }))
                    .OrderBy(t => t.Datum)
                    .ToList();

                return Ok(mojiTermini);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Došlo je do greške: {ex.Message}");
            }
        }


        [HttpGet("dashboard")]
        [Authorize(Roles = "Klijent")]
        public async Task<IActionResult> GetClientDashboard()
        {
            var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(clientId))
            {
                return Unauthorized();
            }

            var nextAppointment = await _userService.FindNextClientAppointmentAsync(clientId);
            NextSessionClientDto? nextSessionDto = null;

            if (nextAppointment != null)
            {
                nextSessionDto = new NextSessionClientDto
                {
                    Datum = nextAppointment.Termin.Datum,
                    TerapeutIme = $"{nextAppointment.Name} {nextAppointment.Surname}",
                    TerapeutSlug = nextAppointment.Slug
                };
            }

            var dashboardData = new ClientDashboardDto
            {
                NextSession = nextSessionDto
            };

            return Ok(dashboardData);
        }
        
        [HttpPut("zakazi-termin")]
        [Authorize(Roles = "Klijent")]
        public async Task<IActionResult> ZakaziTermin([FromBody] ZakaziTerminRequestDto request)
        {
            var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(clientId))
            {
                return Unauthorized();
            }

            var uspeh = await _userService.ZakaziTerminAsync(clientId, request.TherapistId, request.Datum);

            if (!uspeh)
                return BadRequest("Nije moguće zakazati termin. Možda je u međuvremenu zauzet ili terapeut nije pronađen.");

            return Ok(new { Message = "Termin je uspešno zakazan!" });
        }

        [HttpPost("ostavi-recenziju")]
        [Authorize(Roles = "Klijent")]
        public async Task<IActionResult> OstaviRecenziju([FromBody] AddReviewRequestDto request)
        {
            var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(clientId))
            {
                return Unauthorized();
            }

            if (request.Komentar == null)
            {
                request.Komentar = "";
            }
            else if (request.Komentar.Length > 500)
            {
                return BadRequest("Komentar ne sme biti duži od 500 karaktera.");
            }

            var uspeh = await _userService.AddReviewAsync(clientId, request.TerapeutID, request.Ocena, request.Komentar);

            if (uspeh== RecenzijaOdgovor.Success)
                return Ok("Recenzija je uspešno dodata!");
            else if(uspeh== RecenzijaOdgovor.AlreadyReviewed)
                return BadRequest("Već ste ostavili recenziju za ovog terapeuta.");
            else
                return BadRequest("Nije moguće dodati recenziju. Terapeut ili klijent nisu pronađeni.");
        }
    }
}
