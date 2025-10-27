using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PAPI.Helpers;
using PAPI.Models;
using PAPI.Services;
using System.Security.Claims;

namespace PAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TerminiController : ControllerBase
    {
        private readonly UserServices _userService;

        public TerminiController(UserServices userService)
        {
            _userService = userService;
        }

        [HttpPost("otkazi")] 
        public async Task<IActionResult> OtkaziTermin([FromBody] OtkaziTerminRequest request)
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserId)) return Unauthorized();

            var currentUser = await _userService.GetByIdAsync(currentUserId);
            if (currentUser == null) return Unauthorized();

            var (termin, terapeut) = await _userService.PronadjiTerminPoDatumuAsync(request.Datum);

            if (termin == null || terapeut == null)
            {
                return NotFound("Termin nije pronađen.");
            }

            if (termin.KlijentId != currentUserId && terapeut.Id != currentUserId)
            {
                return Forbid("Nemate pravo da otkažete ovaj termin.");
            }

            if (termin.Datum <= DateTime.UtcNow)
            {
                return BadRequest("Nije moguće otkazati termin koji je već prošao.");
            }
            if (termin.Status != StatusTermina.Zakazan)
            {
                return BadRequest("Ovaj termin je već otkazan ili završen.");
            }

            var noviStatus = currentUser.Role == "Klijent"
                ? StatusTermina.OtkazanOdStraneKlijenta
                : StatusTermina.OtkazanOdStraneTerapeuta;

            var uspeh = await _userService.OtkaziTerminAsync(terapeut.Id, termin.Datum, noviStatus);

            if (!uspeh)
            {
                return StatusCode(500, "Došlo je do greške prilikom otkazivanja termina.");
            }

            return Ok(new { Message = "Termin je uspešno otkazan." });
        }
    }

    public class OtkaziTerminRequest
    {
        public DateTime Datum { get; set; }
    }
}