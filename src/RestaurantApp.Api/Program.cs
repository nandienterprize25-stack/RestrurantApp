using Microsoft.EntityFrameworkCore;
using RestaurantApp.Api.Extensions;
using RestaurantApp.Infrastructure.Data;

// 1. 👇 MUST BE FIRST: Clear default map BEFORE framework builder objects load assemblies
System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddRestaurantServices(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev", policyBuilder =>
    {
        policyBuilder
            .WithOrigins("http://localhost:4200", "http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

var app = builder.Build();
// ====== AUTOMATIC MIGRATION EXECUTION BLOCK ======
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<RestaurantDbContext>();
        // Automatically applies any missing migration scripts straight to SQL/PostgreSQL
        await context.Database.MigrateAsync();
        Console.WriteLine("🚀 Database schema checked and updated successfully!");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database schema.");
    }
}
// =================================================

app.UseMiddleware<RestaurantApp.Api.Middleware.ErrorHandlingMiddleware>();
app.UseCors("AllowAngularDev");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

try
{
    Console.WriteLine("🌱 Seeding baseline data records...");
    await DatabaseSeeder.SeedAsync(app.Services);
    Console.WriteLine("🎉 Database seeding completed successfully!");
}
catch (Exception ex)
{
    Console.WriteLine($"⚠️ Warning: Seeder bypassed or hit an issue: {ex.Message}");
    // The application will still run seamlessly even if your initial mock user profile isn't inserted yet
}

app.Run();
