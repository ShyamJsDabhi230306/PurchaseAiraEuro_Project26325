namespace PurchaseTeamAira.Models.AllDto.UserRightDto
{
    public class UserRightsDto
    {
        public int UserRightsId { get; set; }

        public int UserId { get; set; }
        public string UserName { get; set; } // User.PersonName or UserName based on what you want

        public int CompanyId { get; set; }
        public string CompanyName { get; set; }

        public int LocationId { get; set; }
        public string LocationName { get; set; }

        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; }

        public DateTime CreatedAt { get; set; }
        public bool IsApproved { get; set; }
        public bool IsDeleted { get; set; }
    }

}
