using LuminaBeauty.API.Data;
using LuminaBeauty.API.DTOs;
using LuminaBeauty.API.Models;
using LuminaBeauty.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LuminaBeauty.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, JwtService jwt) : ControllerBase
{
    // POST /api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest req)
    {
        if (await db.Users.AnyAsync(u => u.Email.ToLower() == req.Email.ToLower()))
            return Conflict(new { message = "E-mail já cadastrado." });

        var user = new User
        {
            Email = req.Email.Trim().ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            FullName = req.FullName.Trim(),
            Phone = req.Phone.Trim(),
            Role = "customer"
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        var token = jwt.GenerateToken(user);
        return Ok(new AuthResponse(token, ToDto(user)));
    }

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == req.Email.ToLower());

        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new { message = "E-mail ou senha incorretos." });

        var token = jwt.GenerateToken(user);
        return Ok(new AuthResponse(token, ToDto(user)));
    }

    // GET /api/auth/me
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await db.Users.FindAsync(id);
        if (user == null) return NotFound();
        return Ok(ToDto(user));
    }

    // PUT /api/auth/me
    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile(UpdateProfileRequest req)
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await db.Users.FindAsync(id);
        if (user == null) return NotFound();

        user.FullName = req.FullName.Trim();
        user.Phone = req.Phone.Trim();
        await db.SaveChangesAsync();

        return Ok(ToDto(user));
    }

    private static UserDto ToDto(User u) =>
        new(u.Id, u.Email, u.FullName, u.Phone, u.Role);
}
