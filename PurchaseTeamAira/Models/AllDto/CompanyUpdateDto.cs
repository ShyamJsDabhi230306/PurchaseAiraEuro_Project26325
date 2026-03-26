namespace PurchaseTeamAira.Models.AllDto
{
    public class CompanyUpdateDto
    {
        //public int CompanyId { get; set; }
        public string CompanyName { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool isApproved { get; set; }
        public bool isDeleted { get; set; }
    }
}
