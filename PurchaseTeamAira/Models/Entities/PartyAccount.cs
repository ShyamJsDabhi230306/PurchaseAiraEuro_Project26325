using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PurchaseTeamAira.Models.Entities
{
    public class PartyAccount
    {
        [Key] // Marks this as the primary key
        public int Id { get; set; }

        [Required(ErrorMessage = "Party AC Name is required")]
        public string PartyACName { get; set; }

        [Required(ErrorMessage = "Contact Person is required")]
        public string ContactPerson { get; set; }

        [Required(ErrorMessage = "Address is required")]
        public string Address { get; set; }

        [Required(ErrorMessage = "WhatsApp No is required")]
        [Phone(ErrorMessage = "Invalid WhatsApp number")]
        public string WhatsAppNo { get; set; }

        [Required(ErrorMessage = "Email ID is required")]
        [EmailAddress(ErrorMessage = "Invalid Email address")]
        public string EmailID { get; set; }

        [Required(ErrorMessage = "PAN No is required")]
        public string PANNo { get; set; }

        [Required(ErrorMessage = "GST No is required")]
        public string GSTNo { get; set; }
    }
}
