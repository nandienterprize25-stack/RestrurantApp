using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestaurantApp.Core.Entities
{
    [Table("MenuItemAddons")]
    public class MenuItemAddon
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid MenuItemId { get; set; }

        [Required]
        public Guid AddonId { get; set; }

        public int MinSelectionsRequired { get; set; } = 0;
        public int MaxChoicesAllowed { get; set; } = 1;
        public bool IsMandatory { get; set; } = false;
    }
}