using PurchaseTeamAira.Models.Entities.GeneralEnties;
using System.ComponentModel.DataAnnotations;

namespace PurchaseTeamAira.Models.Entities
{
    public class OutWards
    {
        [Key]
        public int OutWardId { get; set; }
        public int ItemId { get; set; }
        public int ContractorId { get; set; }
        //public int UserId { get; set; }
        public int StatusId { get; set; }
        public int DepartmentId { get; set; }
        public int OperatorId { get; set; } // ✅ NEW

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsApproved { get; set; }
        public bool IsDeleted { get; set; } = false;
        public Item Item { get; set; }
        public Contractor Contractor { get; set; }
        //public User User { get; set; }
        public Operator? Operators { get; set; }
        public Status Status { get; set; }
        public Department Department { get; set; }
        public virtual ICollection<SecondInWard> SecondInwards { get; set; }

    }
}

