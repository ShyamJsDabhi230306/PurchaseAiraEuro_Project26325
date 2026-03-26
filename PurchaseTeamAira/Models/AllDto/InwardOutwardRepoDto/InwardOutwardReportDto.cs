namespace PurchaseTeamAira.Models.AllDto.InwardOutwardRepoDto
{
    public class InwardOutwardReportDto
    {
        //SecondInWardDto
        public int? SecondInwardId { get; set; }
        public DateTime? InwardDate { get; set; }
        public int?  SecondInWardStatus { get; set; }

        //outWardDto

        public int? OutwardId { get; set; }
        public DateTime? OutwardDate { get; set; }
        public string? ItemName { get; set; }
        public string? ContractorName { get; set; }
        public string? OperatorName { get; set; }
        public string? Department { get; set; }
        public string? StatusName { get; set; }
    }
}
