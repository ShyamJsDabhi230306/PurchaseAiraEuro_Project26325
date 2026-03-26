using PurchaseTeamAira.Models.Entities.GeneralEnties;

namespace PurchaseTeamAira.Models.Entities
{
    public class Location: DateDeleteApproved
    {
        public int LocationId { get; set; }
        public string LocationName { get; set; }
        public ICollection<Department> Departments { get; }
        public ICollection<UserRights> UserRights { get; set; }

    }
}
