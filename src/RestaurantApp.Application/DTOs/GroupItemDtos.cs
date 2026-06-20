using System;

namespace RestaurantApp.Application.DTOs
{
    public class GroupItemChildDto
    {
        public Guid Id { get; set; }
        public Guid ParentMenuItemId { get; set; }
        public Guid ChildMenuItemId { get; set; }
        public string ChildItemName { get; set; } = string.Empty;
        public int Quantity { get; set; }
    }

    public class CreateGroupItemChildDto
    {
        public Guid ParentMenuItemId { get; set; }
        public Guid ChildMenuItemId { get; set; }
        public int Quantity { get; set; }
    }

    public class UpdateGroupItemChildDto
    {
        public Guid ParentMenuItemId { get; set; }
        public Guid ChildMenuItemId { get; set; }
        public int Quantity { get; set; }
    }

    //     public class GroupItemChildDto
    // {
    //     public Guid Id { get; set; }
    //     public Guid ChildMenuItemId { get; set; }
    //     public string ChildMenuItemName { get; set; } = string.Empty;
    //     public int Quantity { get; set; }
    // }

    // public class CreateGroupItemChildDto
    // {
    //     public Guid ChildMenuItemId { get; set; }
    //     public int Quantity { get; set; }
    // }
}