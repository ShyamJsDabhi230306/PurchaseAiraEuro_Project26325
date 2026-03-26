using PurchaseTeamAira.Models.Entities.GeneralEnties;

namespace PurchaseTeamAira.Models.Entities
{
    public class Contractor
    {
        public int ContractorId { get; set; }
        public string? ContractorName { get; set; }
        public ICollection<OutWards> OutWards { get; set; }
        public ICollection<InWards> InWards { get; set; }
        public ICollection<Operator>? Operator { get; set; }
    }
}
