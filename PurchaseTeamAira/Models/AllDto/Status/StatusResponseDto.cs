namespace PurchaseTeamAira.Models.AllDto.Status
{
    public class StatusResponseDto
    {
        public int StatusId { get; set; }
        public string StatusName { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsApproved { get; set; }
    }
}
