using System.ComponentModel.DataAnnotations;

namespace PurchaseTeamAira.Models.Entities
{
    public class Division
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [StringLength(50)]
        public string DivisionName { get; set; }
        [Required]
        [StringLength(50)]
        public string Remarks { get; set; }

    }
}
