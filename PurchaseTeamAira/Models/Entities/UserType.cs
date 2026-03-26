using System.ComponentModel.DataAnnotations;

namespace PurchaseTeamAira.Models.Entities
{
    public class UserType
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string TypeName { get; set; }

        // Navigation property (optional)
        public ICollection<User> Users { get; set; }
    }

}
