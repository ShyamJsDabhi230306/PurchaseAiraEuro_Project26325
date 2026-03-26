namespace PurchaseTeamAira.Models.AllDto.Department
{
    public class ReadDepartmentDto
    {
        public int Id { get; set; }
        public string DepartmentName { get; set; }
        public int LocationId { get; set; }
        public string LocationName { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? CreatedAt { get; set; }
        public bool IsApproved { get; set; }
    }
}
