namespace PurchaseTeamAira.Models.AllDto
{
    public class ItemResponseDto
    {
        public int Id { get; set; }

        public string? ItemName { get; set; }

        public string? ModelCode { get; set; }
        public int ItemStatusId { get; set; }
        public string? ItemStatusName { get; set; }

        public string? Description { get; set; }
    }

}
