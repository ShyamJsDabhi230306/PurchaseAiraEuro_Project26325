using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PurchaseTeamAira.Models.Entities
{
    public class MaterialsOutWard
    {
        [Key]
        public int OutWardId { get; set; }

        [Column(TypeName = "date")]
        public DateTime OutWardDate { get; set; }

        [StringLength(50)]
        public string OutwardBy { get; set; }

        [StringLength(50)]
        public string OutwardThrough { get; set; }

        [StringLength(50)]
        public string OutwardDepartment { get; set; }

        [StringLength(50)]
        public string ReceiveBy { get; set; }
    }
}
