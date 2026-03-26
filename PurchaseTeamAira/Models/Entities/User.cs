using PurchaseTeamAira.Models.Entities.GeneralEnties;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PurchaseTeamAira.Models.Entities
{
    public class User: DateDeleteApproved
    {
        [Key]
        public int UserId { get; set; }

        [Required]
        public string PersonName { get; set; }

        [Required]
        public string UserName { get; set; }

        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; }

        public bool AllowLogin { get; set; }
        public string?  UserContact { get; set; }

        [ForeignKey("Company")]
        public int CompanyId { get; set; }

        public Company Company { get; set; }

        public int UserTypeId { get; set; }
        public UserType UserType { get; set; }
        public ICollection<UserRights> UserRights { get; set; }
        public virtual ICollection<PagePermission> PagePermissions { get; set; }
        //public ICollection<OutWard> OutWards { get; set; }
        //public ICollection<InWardIscod> InWardIscod { get; set; }


    }
}
