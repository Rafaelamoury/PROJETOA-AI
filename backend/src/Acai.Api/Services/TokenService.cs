using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Acai.Api.Domain;
using Microsoft.IdentityModel.Tokens;

namespace Acai.Api.Services;

public class TokenService(IConfiguration config)
{
    public string Criar(Usuario user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Nome),
            new Claim("cpf", user.Cpf),
            new Claim(ClaimTypes.Role, user.IsAdmin ? "Admin" : "User")
        };
        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Issuer"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
