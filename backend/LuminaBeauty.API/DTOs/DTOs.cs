namespace LuminaBeauty.API.DTOs;

// ─── Auth ──────────────────────────────────────────────────────────────────────

public record RegisterRequest(string Email, string Password, string FullName, string Phone);

public record LoginRequest(string Email, string Password);

public record AuthResponse(string Token, UserDto User);

public record UserDto(string Id, string Email, string FullName, string Phone, string Role);

public record UpdateProfileRequest(string FullName, string Phone);

// ─── Products ──────────────────────────────────────────────────────────────────

public record ProductDto(
    string Id,
    string Name,
    string? Description,
    decimal Price,
    string Category,
    string Subcategory,
    string? ImageUrl,
    int Stock,
    DateTime CreatedAt
);

public record SaveProductRequest(
    string? Id,
    string Name,
    string? Description,
    decimal Price,
    string Category,
    string Subcategory,
    string? ImageUrl,
    int Stock
);

// ─── Orders ────────────────────────────────────────────────────────────────────

public record OrderItemDto(string? Id, string Name, int Quantity, decimal Price);

public record OrderDto(
    string Id,
    DateTime CreatedAt,
    string UserId,
    string CustomerName,
    string CustomerEmail,
    string? CustomerPhone,
    string? Cep,
    string? Street,
    string? Number,
    string? Complement,
    string? Neighborhood,
    string? City,
    string? State,
    decimal Subtotal,
    decimal Shipping,
    decimal Discount,
    string? CouponCode,
    decimal Total,
    string PaymentMethod,
    string Status,
    IEnumerable<OrderItemDto> Items
);

public record CreateOrderRequest(
    string CustomerName,
    string CustomerEmail,
    string? CustomerPhone,
    string? Cep,
    string? Street,
    string? Number,
    string? Complement,
    string? Neighborhood,
    string? City,
    string? State,
    decimal Subtotal,
    decimal Shipping,
    decimal Discount,
    string? CouponCode,
    decimal Total,
    string PaymentMethod,
    IEnumerable<OrderItemDto> Items
);

public record UpdateOrderStatusRequest(string Status);

// ─── Coupons ───────────────────────────────────────────────────────────────────

public record CouponDto(
    string Id,
    string Code,
    string DiscountType,
    decimal DiscountValue,
    DateTime StartsAt,
    DateTime? EndsAt,
    bool Active,
    DateTime CreatedAt
);

public record SaveCouponRequest(
    string? Id,
    string Code,
    string DiscountType,
    decimal DiscountValue,
    DateTime StartsAt,
    DateTime? EndsAt,
    bool Active
);

public record ApplyCouponResponse(
    string Id,
    string Code,
    string DiscountType,
    decimal DiscountValue,
    DateTime StartsAt,
    DateTime? EndsAt,
    bool Active
);
