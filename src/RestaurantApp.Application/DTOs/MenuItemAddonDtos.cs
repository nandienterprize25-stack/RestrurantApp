using System;
using System.Collections.Generic;

namespace RestaurantApp.Application.DTOs
{
    public class MenuItemAddonDto
    {
        public Guid Id { get; set; }
        public Guid MenuItemId { get; set; }
        public Guid AddonId { get; set; }
        public int MinSelectionsRequired { get; set; }
        public int MaxChoicesAllowed { get; set; }
        public bool IsMandatory { get; set; }
    }

    public class CreateMenuItemAddonDto
    {
        public Guid MenuItemId { get; set; }
        public List<Guid> AddonIds { get; set; } = new();
        public int MinSelectionsRequired { get; set; } = 0;
        public int MaxChoicesAllowed { get; set; } = 1;
        public bool IsMandatory { get; set; } = false;
    }
}