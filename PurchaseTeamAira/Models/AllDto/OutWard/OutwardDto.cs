using System.ComponentModel.DataAnnotations;

namespace PurchaseTeamAira.Models.AllDto.OutWard
{
    public class OutwardDto
    {
        [Required]
        public DateTime OutWardDate { get; set; }

        [StringLength(50)]
        public string OutwardBy { get; set; }

        [StringLength(50)]
        public string OutwardThrough { get; set; }

        [StringLength(50)]
        public string OutwardDepartment { get; set; }

        [StringLength(50)]
        public string ReceiveBy{  get; set;  }
    }
}
