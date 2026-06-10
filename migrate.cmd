@echo off
cd /d e:\Projects\RestrurantApp
echo Applying EF Core migrations...
"C:\Program Files\dotnet\dotnet.exe" ef database update --project src\RestaurantApp.Infrastructure\RestaurantApp.Infrastructure.csproj --startup-project src\RestaurantApp.Api\RestaurantApp.Api.csproj
if %ERRORLEVEL% EQU 0 (
    echo Migrations applied successfully!
) else (
    echo Migration failed with exit code %ERRORLEVEL%
)
pause
