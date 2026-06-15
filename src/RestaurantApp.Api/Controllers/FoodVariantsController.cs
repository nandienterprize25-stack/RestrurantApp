using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RestaurantApp.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FoodVariantsController : ControllerBase
    {
        // Mock temporary internal database context list to handle operations instantly before running entity migrations
        private static readonly List<FoodVariantDto> _localDatabaseStore = new List<FoodVariantDto>
        {
            new FoodVariantDto { Id = Guid.NewGuid(), MenuItemId = Guid.Parse("00000000-0000-0000-0000-000000000001"), Name = "Half Plate", Price = 140, DietaryType = "Veg", SpiceLevel = "Medium", IsActive = true, AllergenList = new List<string> { "nuts" } },
            new FoodVariantDto { Id = Guid.NewGuid(), MenuItemId = Guid.Parse("00000000-0000-0000-0000-000000000001"), Name = "Full Plate", Price = 240, DietaryType = "Veg", SpiceLevel = "Medium", IsActive = true, AllergenList = new List<string> { "nuts" } }
        };

        [HttpGet]
        public ActionResult<IEnumerable<FoodVariantDto>> GetAll()
        {
            // Maps perfectly to the frontend this.foodService.getFoodVariants() method stream
            return Ok(_localDatabaseStore);
        }

        [HttpGet("{id:guid}")]
        public ActionResult<FoodVariantDto> GetById(Guid id)
        {
            var variant = _localDatabaseStore.Find(x => x.Id == id);
            if (variant == null) return NotFound(new { message = "Food Variant setup choice not found." });
            return Ok(variant);
        }

        [HttpPost]
        public ActionResult<FoodVariantDto> Create([FromBody] CreateFoodVariantDto dto)
        {
            if (dto == null || string.IsNullOrEmpty(dto.Name) || dto.Price < 0)
            {
                return BadRequest(new { message = "Invalid data payload details submitted." });
            }

            var newVariant = new FoodVariantDto
            {
                Id = Guid.NewGuid(),
                MenuItemId = dto.MenuItemId,
                Name = dto.Name,
                Price = dto.Price,
                DietaryType = dto.DietaryType ?? "Veg",
                SpiceLevel = dto.SpiceLevel ?? "Medium",
                IsActive = dto.IsActive,
                AllergenList = dto.AllergenList ?? new List<string>()
            };

            _localDatabaseStore.Add(newVariant);
            return CreatedAtAction(nameof(GetById), new { id = newVariant.Id }, newVariant);
        }

        [HttpPut("{id:guid}")]
        public IActionResult Update(Guid id, [FromBody] UpdateFoodVariantDto dto)
        {
            var variant = _localDatabaseStore.Find(x => x.Id == id);
            if (variant == null) return NotFound(new { message = "Target Food Variant not found." });

            variant.MenuItemId = dto.MenuItemId;
            variant.Name = dto.Name;
            variant.Price = dto.Price;
            variant.DietaryType = dto.DietaryType;
            variant.SpiceLevel = dto.SpiceLevel;
            variant.IsActive = dto.IsActive;
            variant.AllergenList = dto.AllergenList ?? new List<string>();

            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        public IActionResult Delete(Guid id)
        {
            var variant = _localDatabaseStore.Find(x => x.Id == id);
            if (variant == null) return NotFound(new { message = "Target Variant row reference does not exist." });

            _localDatabaseStore.Remove(variant);
            return NoContent();
        }
    }

    // ==========================================
    // 🧱 DATA TRANSFER OBJECTS (DTOs)
    // ==========================================

    public class FoodVariantDto
    {
        public Guid Id { get; set; }
        public Guid MenuItemId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string DietaryType { get; set; } = "Veg";
        public string SpiceLevel { get; set; } = "Medium";
        public bool IsActive { get; set; } = true;
        public List<string> AllergenList { get; set; } = new List<string>();
    }

    public class CreateFoodVariantDto
    {
        public Guid MenuItemId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string DietaryType { get; set; } = "Veg";
        public string SpiceLevel { get; set; } = "Medium";
        public bool IsActive { get; set; } = true;
        public List<string> AllergenList { get; set; } = new List<string>();
    }

    public class UpdateFoodVariantDto
    {
        public Guid MenuItemId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string DietaryType { get; set; } = "Veg";
        public string SpiceLevel { get; set; } = "Medium";
        public bool IsActive { get; set; } = true;
        public List<string> AllergenList { get; set; } = new List<string>();
    }
}