🚀 Step 1: Environment Optimization & Initialization Sequence
Open your terminal workspace split windows and run the following explicit environment initialization workflows:

1. Backend Initialization (.NET 9)
Navigate to the directory containing your backend solution file (or root project containing .csproj layers):

# Navigate to the backend or root folder
dotnet restore
dotnet build

2. Frontend Initialization (Angular Standalone)
Navigate directly into your client interface workspace directory (where package.json is located):

🗄️ Step 3: EF Core PostgreSql Database Migration Guide
Your .csproj files indicate that your Data Context Configuration lives inside the RestaurantApp.Infrastructure project, while your execution entry pipeline lives inside RestaurantApp.Api.

Because you are using PostgreSQL (Npgsql.EntityFrameworkCore.PostgreSQL), follow these terminal routing paths to execute Entity Framework migrations cleanly.

Prerequisites (Run Once globally)
If you do not have the Entity Framework Core CLI tool engine installed, run this first:

Bash
dotnet tool install --global dotnet-ef

Command 1: Add a New Database Migration
When you create new entities, model classes, or update structures, run this command from the directory containing your main solution (.sln) file:

dotnet ef migrations add InitialRestaurantDbSchema --project RestaurantApp.Infrastructure --startup-project RestaurantApp.Api

Command 2: Apply Changes to Your Live PostgreSQL Instance
To execute the migration layout updates directly against your specified connection target (Database=RestaurantApp), run:

dotnet ef database update --project RestaurantApp.Infrastructure --startup-project RestaurantApp.Api

📦 Step 4: Package Installation CLI Guidelines
Whenever you require additional runtime tools or component packages, use these strict context commands depending on the environment.

A. Installing Packages to the Backend (.NET Projects)
To install packages via the terminal, navigate to the folder containing the specific project file (.csproj) and execute:

# Example: If you need to add a package to the Web Api layer
dotnet add package NameOfPackage

# Specifying a targeted release version if needed:
dotnet add package NameOfPackage --version 9.0.0

B. Installing Dependencies to the Frontend (Angular Node ecosystem)
Navigate to your client app root folder (where package.json sits) and run:

Bash

# For runtime execution utilities (saved in dependencies):
npm install name-of-package

# For developer environment building blocks (saved in devDependencies):
npm install name-of-package --save-dev
