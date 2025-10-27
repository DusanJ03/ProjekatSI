using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PAPI.Models;
using PAPI.Services;
using PAPI.Models.JWT;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using PAPI.Models.DTOs;

namespace PAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserServices _userService;
        private readonly PasswordHasher<Users> _passwordHasher;
        private readonly ITokenService _tokenService;

        public UsersController(UserServices userService, ITokenService tokenService)
        {
            _userService = userService;
            _tokenService = tokenService;
            _passwordHasher = new PasswordHasher<Users>();
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _userService.GetByEmailAsync(request.Email);
            if (user == null)
                return Unauthorized("Invalid credentials.");

            var result = _passwordHasher.VerifyHashedPassword(user, user.Password, request.Password);
            if (result == PasswordVerificationResult.Failed)
                return Unauthorized("Invalid credentials.");

            var terapeut = user as Psihoterapeut;
            var slug = terapeut?.Slug;

            var token = _tokenService.GenerateToken(user);

            return Ok(new
            {
                Message = "Login successful",
                token,
                role = user.Role,
                userName = user.UserName,
                id = user.Id,
                profileImage = user.ProfileImage,
                slug = slug
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAsync();
            return Ok(users);
        }

        [HttpGet("gradovi")]
        public IActionResult GetGradovi()
        {
            var gradovi = new List<string>
            {
            "Beograd", "Novi Sad", "Niš", "Kragujevac", "Subotica", "Zrenjanin", "Pančevo", "Čačak",
            "Kraljevo", "Smederevo", "Leskovac", "Užice", "Valjevo", "Pirot", "Kruševac", "Šabac",
            "Sombor", "Požarevac", "Vranje", "Zaječar", "Sremska Mitrovica", "Bor", "Prokuplje", "Jagodina","Razanj"
             };
            return Ok(gradovi.OrderBy(g => g));
        }

        [HttpPost("slika-profila")]
        [Authorize]
        public async Task<IActionResult> UploadProfileImage([FromForm] UploadProfileImageDto request)
        {
            var file = request.File;
            if (file == null || file.Length == 0)
                return BadRequest("Fajl nije poslat.");

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("Korisnik nije pronađen.");

            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
                return NotFound("Korisnik nije pronađen.");

            try
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profile-images");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                if (!string.IsNullOrEmpty(user.ProfileImage))
                {
                    var oldFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", user.ProfileImage.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }

                var fileExtension = Path.GetExtension(file.FileName);
                var fileName = $"{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var profileImagePath = $"/uploads/profile-images/{fileName}";
                user.ProfileImage = profileImagePath;

                if (user is Klijent)
                {
                    await _userService.UpdateClientProfileImageAsync(user.Id, profileImagePath);
                }
                else
                {
                    await _userService.UpdateTherapistProfileImageAsync(user.Id, profileImagePath);
                }

                return Ok(new { fileUrl = user.ProfileImage });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Greška pri uploadu: {ex.Message}");
            }
        }



    }
}
