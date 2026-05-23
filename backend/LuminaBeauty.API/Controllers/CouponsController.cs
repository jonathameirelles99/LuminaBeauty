using LuminaBeauty.API.Data;
using LuminaBeauty.API.DTOs;
using LuminaBeauty.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LuminaBeauty.API.Controllers;

[ApiController]
[Route("api/coupons")]
public class CouponsController(AppDbContext db) : ControllerBase
{
    // GET /api/coupons  (admin)
    [Authorize(Roles = "admin")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var coupons = await db.Coupons.OrderByDescending(c => c.CreatedAt).ToListAsync();
        return Ok(coupons.Select(ToDto));
    }

    // GET /api/coupons/apply?code=PROMO10  (autenticado)
    [Authorize]
    [HttpGet("apply")]
    public async Task<IActionResult> Apply([FromQuery] string code)
    {
        var c = code.Trim().ToUpper();
        if (string.IsNullOrEmpty(c)) return BadRequest(new { message = "Código inválido." });

        var coupon = await db.Coupons.FirstOrDefaultAsync(x => x.Code == c && x.Active);
        if (coupon == null) return NotFound(new { message = "Cupom não encontrado ou inativo." });

        var now = DateTime.UtcNow;
        if (coupon.StartsAt > now)
            return BadRequest(new { message = "Cupom ainda não está vigente." });
        if (coupon.EndsAt.HasValue && coupon.EndsAt.Value < now)
            return BadRequest(new { message = "Cupom expirado." });

        return Ok(new ApplyCouponResponse(
            coupon.Id, coupon.Code, coupon.DiscountType,
            coupon.DiscountValue, coupon.StartsAt, coupon.EndsAt, coupon.Active));
    }

    // POST /api/coupons  (admin)
    [Authorize(Roles = "admin")]
    [HttpPost]
    public async Task<IActionResult> Create(SaveCouponRequest req)
    {
        var code = req.Code.Trim().ToUpper();
        if (await db.Coupons.AnyAsync(c => c.Code == code))
            return Conflict(new { message = "Código já existe." });

        var coupon = new Coupon
        {
            Code = code,
            DiscountType = req.DiscountType,
            DiscountValue = req.DiscountValue,
            StartsAt = req.StartsAt,
            EndsAt = req.EndsAt,
            Active = req.Active
        };

        db.Coupons.Add(coupon);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = coupon.Id }, ToDto(coupon));
    }

    // PUT /api/coupons/{id}  (admin)
    [Authorize(Roles = "admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, SaveCouponRequest req)
    {
        var coupon = await db.Coupons.FindAsync(id);
        if (coupon == null) return NotFound();

        coupon.Code = req.Code.Trim().ToUpper();
        coupon.DiscountType = req.DiscountType;
        coupon.DiscountValue = req.DiscountValue;
        coupon.StartsAt = req.StartsAt;
        coupon.EndsAt = req.EndsAt;
        coupon.Active = req.Active;

        await db.SaveChangesAsync();
        return Ok(ToDto(coupon));
    }

    // DELETE /api/coupons/{id}  (admin)
    [Authorize(Roles = "admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var coupon = await db.Coupons.FindAsync(id);
        if (coupon == null) return NotFound();

        db.Coupons.Remove(coupon);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static CouponDto ToDto(Coupon c) =>
        new(c.Id, c.Code, c.DiscountType, c.DiscountValue, c.StartsAt, c.EndsAt, c.Active, c.CreatedAt);
}
