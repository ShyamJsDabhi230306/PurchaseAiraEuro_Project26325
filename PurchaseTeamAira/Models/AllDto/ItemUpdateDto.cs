namespace PurchaseTeamAira.Models.AllDto
{
    public class ItemUpdateDto
    {
        public int Id { get; set; }
        public int ProductType { get; set; }
        public string? ItemName { get; set; }
        public string? ModelCode { get; set; }
        public int ItemStatusId { get; set; }
        public string? ItemStatusName { get; set; }

    }
}
