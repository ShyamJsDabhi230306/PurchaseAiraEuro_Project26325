using System.ComponentModel.DataAnnotations;

namespace PurchaseTeamAira.Models.AllDto
{
    public class PartyAccountCreateDto
    {
        [Required]
        public string PartyACName { get; set; }

        [Required]
        public string ContactPerson { get; set; }

        [Required]
        public string Address { get; set; }

        [Required]
        [Phone]
        public string WhatsAppNo { get; set; }

        [Required]
        [EmailAddress]
        public string EmailID { get; set; }

        [Required]
        public string PANNo { get; set; }

        [Required]
        public string GSTNo { get; set; }
    }

}
