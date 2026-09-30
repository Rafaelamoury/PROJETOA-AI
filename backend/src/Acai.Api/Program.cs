using System.Text;
using System.Text.Json.Serialization;
using Acai.Api.Data;
using Acai.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
builder.Services.AddOpenApi();

var volume = Environment.GetEnvironmentVariable("RAILWAY_VOLUME_MOUNT_PATH");
var sqlite = !string.IsNullOrEmpty(volume)
    ? $"Data Source={Path.Combine(volume, "acai.db")}"
    : (builder.Configuration.GetConnectionString("Default") ?? "Data Source=acai.db");
var dataFile = sqlite.Replace("Data Source=", "", StringComparison.OrdinalIgnoreCase).Trim().TrimEnd(';');
var dataDir = Path.GetDirectoryName(dataFile);
if (!string.IsNullOrWhiteSpace(dataDir))
    Directory.CreateDirectory(dataDir);

builder.Services.AddDbContext<AppDbContext>(opt => opt.UseSqlite(sqlite));
builder.Services.AddSingleton<TokenService>();
var jwtKey = builder.Configuration["Jwt:Key"] ?? "sitio-acai-chave-dev-minimo-32-caracteres!";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "Acai.Api",
            ValidAudience = builder.Configuration["Jwt:Issuer"] ?? "Acai.Api",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });
builder.Services.AddAuthorization(o =>
{
    o.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("frontend", p => p
        .SetIsOriginAllowed(_ => true)
        .AllowAnyHeader()
        .AllowAnyMethod());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await SchemaPatch.ApplyAsync(db);
    await DbInitializer.SeedAsync(db);
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
