using PurchaseTeamAira.Models.Enum;
using System.ComponentModel.DataAnnotations;

namespace PurchaseTeamAira.Models.AllDto
{
    public class ItemCreateDto
    {
        [Required]
        public ProductType ProductType { get; set; }  // Change to enum type

        [Required]
        public string? ItemName { get; set; }

        public string? ModelCode { get; set; }
        public int ItemStatusId { get; set; }
        

    }
}
