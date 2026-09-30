using System.Text;

namespace Acai.Api.Domain;

public static class Cpf
{
    public static string Normalizar(string? valor)
    {
        if (string.IsNullOrWhiteSpace(valor)) return string.Empty;
        var sb = new StringBuilder(11);
        foreach (var c in valor)
        {
            if (char.IsDigit(c)) sb.Append(c);
        }
        return sb.ToString();
    }

    public static bool EhValido(string cpfNormalizado) =>
        cpfNormalizado.Length == 11 && cpfNormalizado.Any(c => c != '0');
}
