using System.ComponentModel.DataAnnotations;

namespace PurchaseTeamAira.Models.AllDto
{
    public class CreateUserDto
    {
        [Required]
        public string PersonName { get; set; }

        [Required]
        public string UserName { get; set; }

        [Required]
        public string Password { get; set; }

        public bool AllowLogin { get; set; } = true;
        public string? UserContact { get; set; }
        public bool IsApproved { get; set; } = false;
        public bool IsDeleted { get; set; } = false ;

        [Required]
        public int CompanyId { get; set; }

        [Required]
        public int UserTypeId { get; set; }
    }
}
