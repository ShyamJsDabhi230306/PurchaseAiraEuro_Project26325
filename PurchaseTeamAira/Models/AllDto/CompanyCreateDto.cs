namespace PurchaseTeamAira.Models.AllDto
{
    public class CompanyCreateDto
    {
        public string CompanyName { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool isApproved { get; set; }
        public bool isDeleted { get; set; }
    }
}
