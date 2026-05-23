using Microsoft.EntityFrameworkCore;
using LuminaBeauty.API.Models;

namespace LuminaBeauty.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Coupon> Coupons => Set<Coupon>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // User
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Order → User (many-to-one)
        modelBuilder.Entity<Order>()
            .HasOne(o => o.User)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // OrderItem → Order
        modelBuilder.Entity<OrderItem>()
            .HasOne(i => i.Order)
            .WithMany(o => o.Items)
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // Precisão decimal
        modelBuilder.Entity<Product>().Property(p => p.Price).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<Order>().Property(o => o.Subtotal).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<Order>().Property(o => o.Shipping).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<Order>().Property(o => o.Discount).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<Order>().Property(o => o.Total).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<OrderItem>().Property(i => i.Price).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<Coupon>().Property(c => c.DiscountValue).HasColumnType("decimal(18,2)");

        // Seed: admin
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = "seed-admin-001",
            Email = "gerencia@lumina.com.br",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Lumina123."),
            FullName = "Gerência Lumina",
            Phone = "",
            Role = "admin",
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });

        // Seed: produtos
        var now = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        modelBuilder.Entity<Product>().HasData(
            new Product { Id = "colar-rose",      Name = "Colar Rosé Lumina",         Description = "Banho rosé delicado com ponto de luz central.",            Price = 129.90m, Category = "Acessórios", Subcategory = "colares",          ImageUrl = "colar-rose.jpg",      Stock = 18, CreatedAt = now },
            new Product { Id = "brincos-perola",  Name = "Brincos Pérola Aurora",     Description = "Pérolas sintéticas com acabamento dourado leve.",           Price = 89.90m,  Category = "Acessórios", Subcategory = "brincos",          ImageUrl = "brincos-perola.jpg",  Stock = 24, CreatedAt = now },
            new Product { Id = "anel-ouro",       Name = "Anel Dourado Essencial",    Description = "Aro ajustável com brilho sutil para o dia a dia.",          Price = 79.90m,  Category = "Acessórios", Subcategory = "anéis",            ImageUrl = "anel-ouro.jpg",       Stock = 20, CreatedAt = now },
            new Product { Id = "base-pele",       Name = "Base Skin Glow",            Description = "Cobertura média com acabamento luminoso.",                  Price = 119.90m, Category = "Beleza",     Subcategory = "rosto",            ImageUrl = "base-pele.jpg",       Stock = 30, CreatedAt = now },
            new Product { Id = "paleta-olhos",    Name = "Paleta Nude Poésie",        Description = "Tons neutros, acetinados e matte para composições elegantes.", Price = 149.90m, Category = "Beleza",  Subcategory = "olhos",            ImageUrl = "paleta-olhos.jpg",    Stock = 15, CreatedAt = now },
            new Product { Id = "batom-rose",      Name = "Batom Rose Velours",        Description = "Textura confortável com cor rosada sofisticada.",           Price = 59.90m,  Category = "Beleza",     Subcategory = "lábios",           ImageUrl = "batom-rose.jpg",      Stock = 34, CreatedAt = now },
            new Product { Id = "pinceis",         Name = "Kit Pincéis Soft Touch",    Description = "Kit versátil para pele, olhos e acabamento.",              Price = 179.90m, Category = "Beleza",     Subcategory = "pincéis",          ImageUrl = "pinceis.jpg",         Stock = 12, CreatedAt = now },
            new Product { Id = "limpeza-facial",  Name = "Gel de Limpeza Floral",     Description = "Limpeza suave para rotina diária de skincare.",            Price = 69.90m,  Category = "Skincare",   Subcategory = "limpeza",          ImageUrl = "limpeza-facial.jpg",  Stock = 28, CreatedAt = now },
            new Product { Id = "hidratante",      Name = "Hidratante Cloud Cream",    Description = "Hidratação leve com toque aveludado.",                     Price = 99.90m,  Category = "Skincare",   Subcategory = "hidratação",       ImageUrl = "hidratante.jpg",      Stock = 22, CreatedAt = now },
            new Product { Id = "mascara-facial",  Name = "Máscara Facial Radiance",   Description = "Máscara revitalizante para efeito glow imediato.",         Price = 49.90m,  Category = "Skincare",   Subcategory = "máscaras",         ImageUrl = "mascara-facial.jpg",  Stock = 40, CreatedAt = now },
            new Product { Id = "serum",           Name = "Sérum Vitamina C Lumi",     Description = "Sérum antioxidante para uniformizar o viço da pele.",      Price = 139.90m, Category = "Skincare",   Subcategory = "séruns",           ImageUrl = "serum.jpg",           Stock = 16, CreatedAt = now },
            new Product { Id = "protetor-solar",  Name = "Protetor Solar Toque Seco", Description = "FPS alto com acabamento invisível e confortável.",         Price = 84.90m,  Category = "Skincare",   Subcategory = "proteção solar",   ImageUrl = "protetor-solar.jpg",  Stock = 26, CreatedAt = now }
        );
    }
}
