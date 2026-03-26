namespace PurchaseTeamAira.Models.AllDto.PagesPermissions
{
    public class PagePermissionDto
    {
        public int UserId { get; set; }
        public int PageId { get; set; }
        public bool IsAllowed { get; set; }
        public string? UserName { get; set; }
        public string? PageName { get; set; }
        public string? PageRout { get; set; }   // NEW
        public string? Module { get; set; }     // NEW
    }
}
