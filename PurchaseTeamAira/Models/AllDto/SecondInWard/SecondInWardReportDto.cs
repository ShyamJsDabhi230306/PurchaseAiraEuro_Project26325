namespace PurchaseTeamAira.Models.AllDto.SecondInWard
{
    public class SecondInWardReportDto
    {
        public int SecondInwardId { get; set; }
        public string? ItemName { get; set; }
        public string? ContractorName { get; set; }
        public string? PersonName { get; set; }
        public string? StatusName { get; set; }
        public string? DepartmentName { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsApproved { get; set; }
    }
}
