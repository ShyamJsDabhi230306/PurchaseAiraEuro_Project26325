namespace PurchaseTeamAira.Models.AllDto.InwardDto
{
    public class InwardDto
    {
        public int InwardId { get; set; }
        public int ItemId { get; set; }
        public string? ItemName { get; set; }
        public int ContractorId { get; set; }
        public string? ContractorName { get; set; }
        public int StatusId { get; set; }
        public string? StatusName { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsApproved { get; set; }
        public bool IsDeleted { get; set; }
    }
}
