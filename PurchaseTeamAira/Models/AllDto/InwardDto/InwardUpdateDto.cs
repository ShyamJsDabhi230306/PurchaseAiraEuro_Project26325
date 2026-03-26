namespace PurchaseTeamAira.Models.AllDto.InwardDto
{
    public class InwardUpdateDto
    {
        public int ItemId { get; set; }
        public int? ContractorId { get; set; }
        public int? StatusId { get; set; }
        public bool? IsApproved { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
