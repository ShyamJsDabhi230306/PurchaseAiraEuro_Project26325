using System.ComponentModel.DataAnnotations;

namespace PurchaseTeamAira.Models.Entities
{
    public class Operator
    {
      
            [Key]
            public int OperatorId { get; set; }

            [Required]
            [MaxLength(50)]
            public string? OperatorName { get; set; }

            [Required]
            [MaxLength(15)]
            public string? OperatorContact { get; set; }

            [Required]
            public int ContractorId { get; set; }

            public DateTime? CreatedAt { get; set; }

            public bool IsApproved { get; set; }

            public bool IsDeleted { get; set; }
            public virtual Contractor? Contractor { get; set; }
            public ICollection<OutWards>? OutWard { get; set; }
            //public ICollection<SecondInWard>? SecondInWard { get; set; }


    }
}
