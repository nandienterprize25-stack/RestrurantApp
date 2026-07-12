using Microsoft.EntityFrameworkCore;
using RestaurantApp.Core.Entities;

namespace RestaurantApp.Infrastructure.Data;

public class RestaurantDbContext : DbContext
{
   public RestaurantDbContext(DbContextOptions<RestaurantDbContext> options) : base(options)
    {
    }
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();

    public DbSet<FoodVariant> FoodVariants { get; set; }
    public DbSet<GroupItemChild> GroupItemChildren { get; set; }
    public DbSet<FoodAvailability> FoodAvailabilities { get; set; }

    public DbSet<MenuItemAddon> MenuItemAddons => Set<MenuItemAddon>();
    public DbSet<RestaurantTable> Tables => Set<RestaurantTable>();
    public DbSet<TableArea> TableAreas => Set<TableArea>();
 
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

// 🌟 NEW ENTITY SETS
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<ReservationItem> ReservationItems => Set<ReservationItem>();
    public DbSet<UnavailabilityDay> UnavailabilityDays => Set<UnavailabilityDay>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Username).IsUnique();
            entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Role).IsRequired().HasMaxLength(30);
            entity.Property(e => e.FullName).HasMaxLength(100);
        });

        // modelBuilder.Entity<Category>(entity =>
        // {
        //     entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
        //     entity.HasMany(e => e.MenuItems).WithOne(e => e.Category).HasForeignKey(e => e.CategoryId);
        // });

        // modelBuilder.Entity<MenuItem>(entity =>
        // {
        //     entity.Property(e => e.Name).IsRequired().HasMaxLength(120);
        //     entity.Property(e => e.Description).HasMaxLength(500);
        //     entity.Property(e => e.Price).HasPrecision(18, 2);
        // });

        // 1. Category Mapping Configuration
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
            // This stops PostgreSQL from accepting matching category names
            entity.HasIndex(c => c.Name).IsUnique();
            entity.HasOne(c => c.ParentCategory)
                  .WithMany(c => c.SubCategories)
                  .HasForeignKey(c => c.ParentCategoryId)
                  .OnDelete(DeleteBehavior.Restrict); // Prevents accidental cascading deletion loops
        });

        // 2. FoodItem Configuration
        modelBuilder.Entity<MenuItem>(entity =>
        {
            entity.HasKey(f => f.Id);
            entity.Property(f => f.Name).IsRequired().HasMaxLength(150);

            entity.HasOne(f => f.Category)
                  .WithMany(c => c.MenuItems)
                  .HasForeignKey(f => f.CategoryId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 3. FoodVariant Configuration
        modelBuilder.Entity<FoodVariant>(entity =>
        {
            entity.HasKey(v => v.Id);
            entity.Property(v => v.VariantName).IsRequired().HasMaxLength(100);
            entity.Property(v => v.Price).HasPrecision(18, 2);
            entity.Property(v => v.TaxPercentage).HasPrecision(5, 2);

            entity.HasOne(v => v.MenuItem)
                  .WithMany(f => f.Variants)
                  .HasForeignKey(v => v.FoodItemId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 4. Combo Pack Mapping Configuration (Self-Referential Bridge)
        modelBuilder.Entity<GroupItemChild>(entity =>
        {
            entity.HasKey(g => g.Id);

            entity.HasOne(g => g.ParentMenuItem)
                  .WithMany(m => m.GroupComponents)
                  .HasForeignKey(g => g.ParentMenuItemId)
                   .OnDelete(DeleteBehavior.Cascade); // If combo meal deleted, clear mapping associations

            entity.HasOne(g => g.ChildMenuItem)
                      .WithMany()
                      .HasForeignKey(g => g.ChildMenuItemId)
                      .OnDelete(DeleteBehavior.Restrict); // Retain reference tracking integrity
        });

        // 5. FoodAvailability Configuration
        modelBuilder.Entity<FoodAvailability>(entity =>
        {
            entity.HasKey(a => a.Id);

            entity.HasOne(a => a.MenuItem)
                  .WithMany(f => f.Availabilities)
                  .HasForeignKey(a => a.FoodItemId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TableArea>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.AreaName).IsRequired().HasMaxLength(100);
            entity.Property(a => a.Description).HasMaxLength(500);
        });

        modelBuilder.Entity<RestaurantTable>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.TableNumber).IsRequired().HasMaxLength(50);
            entity.Property(t => t.Status).IsRequired().HasMaxLength(30).HasDefaultValue("Available");

            // Relational Binding: One Area contains Multiple Restaurant Tables
            entity.HasOne(t => t.TableArea)
                  .WithMany(a => a.Tables)
                  .HasForeignKey(t => t.TableAreaId)
                  .OnDelete(DeleteBehavior.Restrict); // Keep referential tracking intact
        });

        // modelBuilder.Entity<Table>(entity =>
        // {
        //     entity.Property(e => e.Number).IsRequired();
        //     entity.Property(e => e.Capacity).IsRequired();
        //     entity.Property(e => e.Status).HasConversion<string>();
        // });

        modelBuilder.Entity<Order>(entity =>
{
    entity.HasKey(o => o.Id);
    entity.Property(o => o.InvoiceNo).IsRequired().HasMaxLength(50);
    entity.Property(o => o.SubTotal).HasPrecision(18, 2);
    entity.Property(o => o.TaxAmount).HasPrecision(18, 2);
    entity.Property(o => o.GrandTotal).HasPrecision(18, 2);
    entity.Property(o => o.OrderStatus).HasConversion<string>().HasMaxLength(30);
    entity.Property(o => o.PaymentMode).HasConversion<string>().HasMaxLength(30);
    entity.Property(o => o.PaymentStatus).HasConversion<string>().HasMaxLength(30);
});

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(oi => oi.Id);
            entity.Property(oi => oi.ItemName).IsRequired().HasMaxLength(150);
            entity.Property(oi => oi.VariantName).HasMaxLength(50);
            entity.Property(oi => oi.UnitPrice).HasPrecision(18, 2);
            entity.Property(oi => oi.TaxPercentage).HasPrecision(5, 2);
            entity.Property(oi => oi.TotalPrice).HasPrecision(18, 2);

            entity.HasOne(oi => oi.Order)
                  .WithMany(o => o.OrderItems)
                  .HasForeignKey(oi => oi.OrderId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 🌟 6. Reservation Entity Mapping
        modelBuilder.Entity<Reservation>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.CustomerName).IsRequired().HasMaxLength(150);
            entity.Property(r => r.PhoneNo).HasMaxLength(25);
            entity.Property(r => r.TableNo).HasMaxLength(50);
            entity.Property(r => r.Status).HasMaxLength(30);
            entity.Property(r => r.AdvancedAmount).HasPrecision(18, 2);
            entity.Property(r => r.TotalAmount).HasPrecision(18, 2);
            entity.Property(r => r.Type).HasConversion<string>().HasMaxLength(40);
        });

        // 🌟 7. Reservation Child Item Mapping
        modelBuilder.Entity<ReservationItem>(entity =>
        {
            entity.HasKey(ri => ri.Id);
            entity.Property(ri => ri.MenuName).IsRequired().HasMaxLength(150);
            entity.Property(ri => ri.Total).HasPrecision(18, 2);
            entity.HasOne<Reservation>()
                  .WithMany(r => r.Items)
                  .HasForeignKey(ri => ri.ReservationId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 🌟 8. Unavailability Schedule Mapping
        modelBuilder.Entity<UnavailabilityDay>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Status).HasMaxLength(30);
        });

        base.OnModelCreating(modelBuilder);
    }
}
