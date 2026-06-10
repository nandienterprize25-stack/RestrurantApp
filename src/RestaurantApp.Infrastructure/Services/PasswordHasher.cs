using System.Security.Cryptography;
using RestaurantApp.Core.Interfaces;

namespace RestaurantApp.Infrastructure.Services;

public class PasswordHasher : IPasswordHasher
{
    private const int Iterations = 100_000;
    private const int SaltSize = 16; // bytes
    private const int KeySize = 32; // bytes

    public string Hash(string password)
    {
        using var rng = RandomNumberGenerator.Create();
        var salt = new byte[SaltSize];
        rng.GetBytes(salt);

        using var derivator = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256);
        var key = derivator.GetBytes(KeySize);

        return Convert.ToBase64String(salt) + "." + Convert.ToBase64String(key);
    }

    public bool Verify(string password, string hashedPassword)
    {
        if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(hashedPassword))
            return false;

        var parts = hashedPassword.Split('.', 2, StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length != 2) return false;

        var salt = Convert.FromBase64String(parts[0]);
        var expectedKey = Convert.FromBase64String(parts[1]);

        using var derivator = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256);
        var actualKey = derivator.GetBytes(KeySize);

        return CryptographicOperations.FixedTimeEquals(actualKey, expectedKey);
    }
}
