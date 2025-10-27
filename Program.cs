using MongoDB.Bson.Serialization;
using PAPI.Models;
using PAPI.Models.JWT;
using PAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost3000", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// MongoDB BsonClassMap
BsonClassMap.RegisterClassMap<Users>(cm =>
{
    cm.AutoMap();
    cm.SetIsRootClass(true);
});

BsonClassMap.RegisterClassMap<Klijent>(cm => cm.AutoMap());
BsonClassMap.RegisterClassMap<Psihoterapeut>(cm => cm.AutoMap());

// MongoDB config
builder.Services.Configure<ModelsDBSettings>(
    builder.Configuration.GetSection("MongoDB"));

// JWT servis
builder.Services.AddScoped<ITokenService, TokenService>();

// User service
builder.Services.AddScoped<UserServices>();

// Kontroleri
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // 1. Definišemo naslov i verziju (ovo je opciono, ali lepo izgleda)
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "PAPI API",
        Version = "v1"
    });

    // 2. NAJVAŽNIJI DEO: Definišemo sigurnosnu šemu za JWT
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Molimo unesite 'Bearer' praćeno razmakom i JWT tokenom",
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    // 3. Govorimo Swaggeru da primeni ovu definiciju na sve zahteve
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[]{}
        }
    });
});

// --- JWT AUTENTIFIKACIJA ---
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])
        )
    };
});

builder.Services.AddAuthorization(); // obavezno

var app = builder.Build();

// Omogući statičke fajlove
app.UseStaticFiles(); // ovo omogućava wwwroot folder

// CORS
app.UseCors("AllowLocalhost3000");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

// VAŽNO: authentication pre authorization
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

// Mapiranje kontrolera
app.MapControllers();

app.Run();
