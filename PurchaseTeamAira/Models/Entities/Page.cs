using System.ComponentModel.DataAnnotations;

namespace PurchaseTeamAira.Models.Entities
{
    public class Page
    {
        [Key]
        public int PageId { get; set; }
        public string? PageName { get; set; }
        public string? PageRout { get; set; }
        public string? Module { get; set; }
        public bool IsDeleted { get; set; }
        public virtual ICollection<PagePermission> Permissions { get; set; }
    }
}







































