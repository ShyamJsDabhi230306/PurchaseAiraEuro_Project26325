namespace PurchaseTeamAira.Models.Entities.GeneralEnties
{
    public class DateDeleteApproved
    {
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsApproved { get; set; }
        public bool IsDeleted { get; set; }
    }
}
