namespace PurchaseTeamAira.Models.AllDto.OutWard
{
    public class OutWardCreateDto
    {
        public int ItemId { get; set; }
        public int ContractorId { get; set; }
        public int OperatorId { get; set; }
        //public int UserId { get; set; }
        //public int StatusId { get; set; }
        public int DepartmentId { get; set; }
        public bool IsApproved { get; set; }
    }
}
