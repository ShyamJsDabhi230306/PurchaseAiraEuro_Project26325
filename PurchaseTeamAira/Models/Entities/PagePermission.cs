using System.ComponentModel.DataAnnotations;

namespace PurchaseTeamAira.Models.Entities
{
    public class PagePermission
    {
        [Key] 
        public int PagePermissionId { get; set; }
        public int UserId { get; set; }
        public int PageId { get; set; }
        public bool IsAllowed { get; set; }
        public bool IsDeleted { get; set; }
        public User? User { get; set; }
        public Page? Page { get; set; }
    }
}
