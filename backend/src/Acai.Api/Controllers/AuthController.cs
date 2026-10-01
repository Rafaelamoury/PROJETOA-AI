using System.Security.Claims;
using Acai.Api.Contracts;
using Acai.Api.Data;
using Acai.Api.Domain;
using Acai.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Acai.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, TokenService tokens) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<LoginResposta>> Login(LoginPedido body, CancellationToken ct)
    {
        var cpf = Cpf.Normalizar(body.Cpf);
        var user = await db.Usuarios.FirstOrDefaultAsync(u => u.Cpf == cpf, ct);
        if (user is null) return Unauthorized(new { erro = "CPF ou senha invalidos." });

        var hasher = new PasswordHasher<Usuario>();
        var result = hasher.VerifyHashedPassword(user, user.PasswordHash, body.Senha ?? "");
        if (result == PasswordVerificationResult.Failed)
            return Unauthorized(new { erro = "CPF ou senha invalidos." });

        return new LoginResposta(tokens.Criar(user), user.Nome, user.Cpf, user.IsAdmin);
    }

    [HttpGet("me")]
    public async Task<ActionResult<UsuarioResposta>> Me(CancellationToken ct)
    {
        var id = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var user = await db.Usuarios.AsNoTracking().FirstAsync(u => u.Id == id, ct);
        return new UsuarioResposta(user.Id, user.Nome, user.Cpf, user.IsAdmin);
    }
}

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/usuarios")]
public class UsuariosController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UsuarioResposta>>> List(CancellationToken ct) =>
        await db.Usuarios.AsNoTracking().OrderBy(u => u.Nome)
            .Select(u => new UsuarioResposta(u.Id, u.Nome, u.Cpf, u.IsAdmin))
            .ToListAsync(ct);

    [HttpPost]
    public async Task<ActionResult<UsuarioResposta>> Create(CriarUsuarioPedido body, CancellationToken ct)
    {
        var cpf = Cpf.Normalizar(body.Cpf);
        if (!Cpf.EhValido(cpf)) return BadRequest(new { erro = "CPF deve ter 11 numeros." });
        if (string.IsNullOrWhiteSpace(body.Nome)) return BadRequest(new { erro = "Nome obrigatorio." });
        if (string.IsNullOrWhiteSpace(body.Senha) || body.Senha.Length < 6)
            return BadRequest(new { erro = "Senha deve ter ao menos 6 caracteres." });
        if (await db.Usuarios.AnyAsync(u => u.Cpf == cpf, ct))
            return Conflict(new { erro = "Ja existe usuario com este CPF." });

        var user = new Usuario
        {
            Nome = body.Nome.Trim(),
            Cpf = cpf,
            IsAdmin = body.IsAdmin
        };
        var hasher = new PasswordHasher<Usuario>();
        user.PasswordHash = hasher.HashPassword(user, body.Senha);
        db.Usuarios.Add(user);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(List), new UsuarioResposta(user.Id, user.Nome, user.Cpf, user.IsAdmin));
    }

    [HttpPut("{id:int}/admin")]
    public async Task<ActionResult<UsuarioResposta>> AlterarAdmin(int id, AlterarAdminPedido body, CancellationToken ct)
    {
        var user = await db.Usuarios.FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user is null) return NotFound();

        var meuId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (!body.IsAdmin && user.Id == meuId)
            return BadRequest(new { erro = "Voce nao pode tirar o seu proprio acesso de administrador." });

        if (!body.IsAdmin && user.IsAdmin)
        {
            var admins = await db.Usuarios.CountAsync(u => u.IsAdmin && u.Id != user.Id, ct);
            if (admins == 0)
                return BadRequest(new { erro = "Precisa existir ao menos um administrador." });
        }

        user.IsAdmin = body.IsAdmin;
        await db.SaveChangesAsync(ct);
        return new UsuarioResposta(user.Id, user.Nome, user.Cpf, user.IsAdmin);
    }
}
