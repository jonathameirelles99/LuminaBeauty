using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace LuminaBeauty.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Coupons",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    Code = table.Column<string>(type: "TEXT", nullable: false),
                    DiscountType = table.Column<string>(type: "TEXT", nullable: false),
                    DiscountValue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    StartsAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EndsAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Active = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Coupons", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Category = table.Column<string>(type: "TEXT", nullable: false),
                    Subcategory = table.Column<string>(type: "TEXT", nullable: false),
                    ImageUrl = table.Column<string>(type: "TEXT", nullable: true),
                    Stock = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
                    FullName = table.Column<string>(type: "TEXT", nullable: false),
                    Phone = table.Column<string>(type: "TEXT", nullable: false),
                    Role = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    CustomerName = table.Column<string>(type: "TEXT", nullable: false),
                    CustomerEmail = table.Column<string>(type: "TEXT", nullable: false),
                    CustomerPhone = table.Column<string>(type: "TEXT", nullable: true),
                    ShippingAddress = table.Column<string>(type: "TEXT", nullable: true),
                    Cep = table.Column<string>(type: "TEXT", nullable: true),
                    Street = table.Column<string>(type: "TEXT", nullable: true),
                    Number = table.Column<string>(type: "TEXT", nullable: true),
                    Complement = table.Column<string>(type: "TEXT", nullable: true),
                    Neighborhood = table.Column<string>(type: "TEXT", nullable: true),
                    City = table.Column<string>(type: "TEXT", nullable: true),
                    State = table.Column<string>(type: "TEXT", nullable: true),
                    Subtotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Shipping = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Discount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CouponCode = table.Column<string>(type: "TEXT", nullable: true),
                    Total = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentMethod = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Orders_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OrderItems",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", nullable: false),
                    OrderId = table.Column<string>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Quantity = table.Column<int>(type: "INTEGER", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderItems_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Category", "CreatedAt", "Description", "ImageUrl", "Name", "Price", "Stock", "Subcategory" },
                values: new object[,]
                {
                    { "anel-ouro", "Acessórios", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Aro ajustável com brilho sutil para o dia a dia.", "anel-ouro.jpg", "Anel Dourado Essencial", 79.90m, 20, "anéis" },
                    { "base-pele", "Beleza", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Cobertura média com acabamento luminoso.", "base-pele.jpg", "Base Skin Glow", 119.90m, 30, "rosto" },
                    { "batom-rose", "Beleza", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Textura confortável com cor rosada sofisticada.", "batom-rose.jpg", "Batom Rose Velours", 59.90m, 34, "lábios" },
                    { "brincos-perola", "Acessórios", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Pérolas sintéticas com acabamento dourado leve.", "brincos-perola.jpg", "Brincos Pérola Aurora", 89.90m, 24, "brincos" },
                    { "colar-rose", "Acessórios", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Banho rosé delicado com ponto de luz central.", "colar-rose.jpg", "Colar Rosé Lumina", 129.90m, 18, "colares" },
                    { "hidratante", "Skincare", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Hidratação leve com toque aveludado.", "hidratante.jpg", "Hidratante Cloud Cream", 99.90m, 22, "hidratação" },
                    { "limpeza-facial", "Skincare", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Limpeza suave para rotina diária de skincare.", "limpeza-facial.jpg", "Gel de Limpeza Floral", 69.90m, 28, "limpeza" },
                    { "mascara-facial", "Skincare", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Máscara revitalizante para efeito glow imediato.", "mascara-facial.jpg", "Máscara Facial Radiance", 49.90m, 40, "máscaras" },
                    { "paleta-olhos", "Beleza", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Tons neutros, acetinados e matte para composições elegantes.", "paleta-olhos.jpg", "Paleta Nude Poésie", 149.90m, 15, "olhos" },
                    { "pinceis", "Beleza", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Kit versátil para pele, olhos e acabamento.", "pinceis.jpg", "Kit Pincéis Soft Touch", 179.90m, 12, "pincéis" },
                    { "protetor-solar", "Skincare", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "FPS alto com acabamento invisível e confortável.", "protetor-solar.jpg", "Protetor Solar Toque Seco", 84.90m, 26, "proteção solar" },
                    { "serum", "Skincare", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Sérum antioxidante para uniformizar o viço da pele.", "serum.jpg", "Sérum Vitamina C Lumi", 139.90m, 16, "séruns" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "FullName", "PasswordHash", "Phone", "Role" },
                values: new object[] { "seed-admin-001", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "gerencia@lumina.com.br", "Gerência Lumina", "$2a$11$Cl7dNWUpiUpqJ8f0kP2dOe6ZZJyC3xlWOEYcV6Xx.er8OEbMn6FwS", "", "admin" });

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_OrderId",
                table: "OrderItems",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_UserId",
                table: "Orders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Coupons");

            migrationBuilder.DropTable(
                name: "OrderItems");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
