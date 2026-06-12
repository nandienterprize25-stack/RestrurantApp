using Microsoft.EntityFrameworkCore;
using RestaurantApp.Api.Extensions;
using RestaurantApp.Infrastructure.Data;

using Microsoft.OpenApi;
using Microsoft.Extensions.DependencyInjection;


// 1. 👇 MUST BE FIRST: Clear default map BEFORE framework builder objects load assemblies
System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddRestaurantServices(builder.Configuration);

//

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "Restaurant API", 
        Version = "v1" 
    });

    // 1. Define the Security Scheme configuration
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http, 
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token in this format: Bearer {your_token_here}"
    });

    // 2. Use the Swashbuckle v10 Document lambda syntax with a fresh List<string>
    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>() // 👈 Changed here
    });
});
//


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
