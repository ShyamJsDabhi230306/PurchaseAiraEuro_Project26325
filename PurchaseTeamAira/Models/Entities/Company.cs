using PurchaseTeamAira.Models.Entities.GeneralEnties;
using System.ComponentModel.DataAnnotations;

namespace PurchaseTeamAira.Models.Entities
{
    public class Company : DateDeleteApproved
    {
        [Key]
        public int CompanyId { get; set; }

        [Required]
        public string CompanyName { get; set; }

        public ICollection<User> Users { get; set; }
        public ICollection<UserRights> UserRights { get; set; }

    }
}
