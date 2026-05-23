using LuminaBeauty.API.Data;
using LuminaBeauty.API.DTOs;
using LuminaBeauty.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LuminaBeauty.API.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController(AppDbContext db) : ControllerBase
{
    // GET /api/orders  (admin: todos; customer: os seus)
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var isAdmin = User.IsInRole("admin");

        var q = db.Orders.Include(o => o.Items).AsQueryable();

        if (!isAdmin)
            q = q.Where(o => o.UserId == userId);

        var orders = await q.OrderByDescending(o => o.CreatedAt).ToListAsync();
        return Ok(orders.Select(ToDto));
    }

    // GET /api/orders/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var isAdmin = User.IsInRole("admin");

        var order = await db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return NotFound();
        if (!isAdmin && order.UserId != userId) return Forbid();

        return Ok(ToDto(order));
    }

    // POST /api/orders
    [HttpPost]
    public async Task<IActionResult> Create(CreateOrderRequest req)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var order = new Order
        {
            UserId = userId,
            CustomerName = req.CustomerName,
            CustomerEmail = req.CustomerEmail,
            CustomerPhone = req.CustomerPhone,
            Cep = req.Cep,
            Street = req.Street,
            Number = req.Number,
            Complement = req.Complement,
            Neighborhood = req.Neighborhood,
            City = req.City,
            State = req.State,
            Subtotal = req.Subtotal,
            Shipping = req.Shipping,
            Discount = req.Discount,
            CouponCode = req.CouponCode,
            Total = req.Total,
            PaymentMethod = req.PaymentMethod,
            Status = "pendente",
            Items = req.Items.Select(i => new OrderItem
            {
                Name = i.Name,
                Quantity = i.Quantity,
                Price = i.Price
            }).ToList()
        };

        db.Orders.Add(order);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = order.Id }, ToDto(order));
    }

    // PATCH /api/orders/{id}/status  (admin)
    [Authorize(Roles = "admin")]
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(string id, UpdateOrderStatusRequest req)
    {
        var order = await db.Orders.FindAsync(id);
        if (order == null) return NotFound();

        order.Status = req.Status;
        await db.SaveChangesAsync();

        return Ok(new { order.Id, order.Status });
    }

    private static OrderDto ToDto(Order o) => new(
        o.Id, o.CreatedAt, o.UserId,
        o.CustomerName, o.CustomerEmail, o.CustomerPhone,
        o.Cep, o.Street, o.Number, o.Complement, o.Neighborhood, o.City, o.State,
        o.Subtotal, o.Shipping, o.Discount, o.CouponCode, o.Total,
        o.PaymentMethod, o.Status,
        o.Items.Select(i => new OrderItemDto(i.Id, i.Name, i.Quantity, i.Price))
    );
}
