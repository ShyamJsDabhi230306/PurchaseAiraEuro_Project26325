namespace PurchaseTeamAira.Models.AllDto.ItemsDtos
{
    public class NewDtoForItem
    {
        public int Id { get; set; }
        public int ProductType { get; set; } // enum as int
        public string? ItemName { get; set; }
        public string? ModelCode { get; set; }
        public int ItemStatusId { get; set; }
        public string? ItemStatusName { get; set; } // optional for output
        public DateTime Date { get; set; }
    }
}
