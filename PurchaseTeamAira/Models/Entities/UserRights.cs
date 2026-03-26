using PurchaseTeamAira.Models.Entities.GeneralEnties;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PurchaseTeamAira.Models.Entities
{
    public class UserRights:DateDeleteApproved
    {
        [Key]
        public int UserRightsId { get; set; }
        [ForeignKey("Id")]
        public int UserId { get; set; }

        [ForeignKey("CompanyId")]
        public int CompanyId { get; set; }
        [ForeignKey("LocationId")]
        public int LocationId { get; set; }
        [ForeignKey("DepartmentId")]
        public int DepartmentId { get; set; }
        public virtual User User { get; set; }
        public virtual Company Company { get; set; }
        public virtual Location Location { get; set; }
        public virtual Department Department { get; set; }
        
       
    }
}
