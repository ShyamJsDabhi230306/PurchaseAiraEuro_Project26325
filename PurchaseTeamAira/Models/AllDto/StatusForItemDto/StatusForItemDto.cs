namespace PurchaseTeamAira.Models.AllDto.StatusForItemDto
{
    public class StatusForItemDto
    {
        public int ItemStatusId { get; set; }
        public string? ItemStatusName { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool IsApproved { get; set; }
        public bool IsDeleted { get; set; }
    }
}
