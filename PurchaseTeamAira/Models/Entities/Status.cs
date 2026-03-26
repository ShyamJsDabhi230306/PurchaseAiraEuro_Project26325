using PurchaseTeamAira.Models.Entities.GeneralEnties;

namespace PurchaseTeamAira.Models.Entities
{
    public class Status:DateDeleteApproved
    {
        public int StatusId { get; set; }
        public string StatusName { get; set; }
        public ICollection<OutWards> OutWards { get; set; }
        public ICollection<InWards> InWards { get; set; }
        public ICollection<SecondInWard>? SecondInWard { get; set; }



    }
}
