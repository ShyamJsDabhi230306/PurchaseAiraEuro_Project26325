using PurchaseTeamAira.Models.Entities.GeneralEnties;

namespace PurchaseTeamAira.Models.Entities
{
    public class Department:DateDeleteApproved
    {
        public int DepartmentId  { get; set; }
        public string DepartmentName { get; set; }
        public int LocationId { get; set; }
        public virtual Location?  Locations { get; set; }
        public ICollection<UserRights> UserRights { get; set; }
        public ICollection<OutWards> OutWards { get; set; }
        //public ICollection<InWardIscod> InWardIscod { get; set; }


    }
}
