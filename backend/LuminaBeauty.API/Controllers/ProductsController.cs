using LuminaBeauty.API.Data;
using LuminaBeauty.API.DTOs;
using LuminaBeauty.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO;

namespace LuminaBeauty.API.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController(AppDbContext db) : ControllerBase
{
    // GET /api/products
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? category,
        [FromQuery] string? subcategory,
        [FromQuery] string? search)
    {
        var q = db.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
            q = q.Where(p => p.Category == category);

        if (!string.IsNullOrWhiteSpace(subcategory))
            q = q.Where(p => p.Subcategory == subcategory);

        if (!string.IsNullOrWhiteSpace(search))
            q = q.Where(p =>
                p.Name.Contains(search) ||
                (p.Description != null && p.Description.Contains(search)));

        var products = await q.OrderByDescending(p => p.CreatedAt).ToListAsync();
        return Ok(products.Select(ToDto));
    }

    // GET /api/products/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var product = await db.Products.FindAsync(id);
        if (product == null) return NotFound();
        return Ok(ToDto(product));
    }

    // POST /api/products  (admin)
    [Authorize(Roles = "admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromForm] SaveProductRequest req, IFormFile? image)
    {
        string? imageUrl = null;

        if (image != null)
        {
            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

            if (!Directory.Exists(uploadsPath))
                Directory.CreateDirectory(uploadsPath);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
            var filePath = Path.Combine(uploadsPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            imageUrl = $"/uploads/{fileName}";
        }

        var product = new Product
        {
            Id = Guid.NewGuid().ToString(),
            Name = req.Name.Trim(),
            Description = req.Description?.Trim(),
            Price = req.Price,
            Category = req.Category,
            Subcategory = req.Subcategory,
            ImageUrl = imageUrl,
            Stock = req.Stock
        };

        db.Products.Add(product);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = product.Id }, ToDto(product));
    }

    // PUT /api/products/{id}  (admin)
    [Authorize(Roles = "admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromForm] SaveProductRequest req, IFormFile? image)
    {
        var product = await db.Products.FindAsync(id);
        if (product == null) return NotFound();

        product.Name = req.Name.Trim();
        product.Description = req.Description?.Trim();
        product.Price = req.Price;
        product.Category = req.Category;
        product.Subcategory = req.Subcategory;
        product.Stock = req.Stock;

        if (image != null)
        {
            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

            if (!Directory.Exists(uploadsPath))
                Directory.CreateDirectory(uploadsPath);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
            var filePath = Path.Combine(uploadsPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            product.ImageUrl = $"/uploads/{fileName}";
        }

        await db.SaveChangesAsync();

        return Ok(ToDto(product));
    }

    // DELETE /api/products/{id}  (admin)
    [Authorize(Roles = "admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var product = await db.Products.FindAsync(id);
        if (product == null) return NotFound();

        db.Products.Remove(product);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static ProductDto ToDto(Product p) =>
        new(p.Id, p.Name, p.Description, p.Price, p.Category, p.Subcategory, p.ImageUrl, p.Stock, p.CreatedAt);
}