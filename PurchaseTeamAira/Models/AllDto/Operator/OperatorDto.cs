namespace PurchaseTeamAira.Models.AllDto.Operator
{
    public class OperatorDto
    {
        public int OperatorId { get; set; }
        public string OperatorName { get; set; }
        public string OperatorContact { get; set; }
        public int ContractorId { get; set; }
        public DateTime? CreatedAt { get; set; }
        public bool IsApproved { get; set; }
        public bool IsDeleted { get; set; }
        public string? ContractorName { get; set; }
    }
}
