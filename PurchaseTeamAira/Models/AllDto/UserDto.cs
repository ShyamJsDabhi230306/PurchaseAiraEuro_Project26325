namespace PurchaseTeamAira.Models.AllDto
{
    public class UserDto
    {
        public int Id { get; set; }

        public string PersonName { get; set; }
        public string UserName { get; set; }
        public bool AllowLogin { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsApproved { get; set; } = false;
        public bool IsDeleted { get; set; } = false;
        public string? UserContact { get; set; }

        public int CompanyId { get; set; }
        public string CompanyName { get; set; }

        public int UserTypeId { get; set; }
        public string UserTypeName { get; set; }
    }
}
