using System.ComponentModel.DataAnnotations;

namespace PurchaseTeamAira.Models.Entities
{
    public class InWards
    {
        [Key]
        public int InwardId { get; set; }
        public int ItemId { get; set; }
        public int ContractorId { get; set; }
        public int StatusId { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsApproved { get; set; }
        public bool IsDeleted { get; set; }
       
        public Item Item { get; set; }
        public Contractor Contractor { get; set; }
        public Status Status { get; set; }
    }
}
