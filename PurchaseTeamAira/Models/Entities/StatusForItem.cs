using System.ComponentModel.DataAnnotations;

namespace PurchaseTeamAira.Models.Entities
{
    public class StatusForItem
    {
        [Key]
        public int ItemStatusId { get; set; }
        public string? ItemStatusName { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public bool? IsApproved { get; set; }
        public bool? IsDeleted { get; set; }
        public virtual ICollection<Item>?Items { get; set; }

    }
}
