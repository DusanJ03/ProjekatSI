namespace PAPI.Models.JWT;

using PAPI.Models;

public interface ITokenService
{
    string GenerateToken(Users user);
}
