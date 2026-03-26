namespace PurchaseTeamAira.Models.AllDto.Department
{
    public class UpdateDepartmentDto
    {
        public int Id { get; set; }
        public string DepartmentName { get; set; }
        public int LocationId { get; set; }
        public string? LocationName { get; set; }
    }
}
