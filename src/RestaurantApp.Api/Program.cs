using RestaurantApp.Api.Extensions;
using RestaurantApp.Infrastructure.Data;

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

await DatabaseSeeder.SeedAsync(app.Services);

app.Run();
