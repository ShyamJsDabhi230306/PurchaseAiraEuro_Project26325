using System.ComponentModel.DataAnnotations;

namespace PurchaseTeamAira.Models.AllDto.SecondInWard
{
    public class SecondInWarddto
    {
        public int SecondInwardId { get; set; }
        public int OutWardId { get; set; }
        public int ItemId { get; set; }
        public string? ItemName { get; set; }
        public int ContractorId { get; set; }
        public string? ContractorName { get; set; }
        //public int UserId { get; set; }
        public int OperatorId { get; set; }
        public string? OperatorName { get; set; }
        //public string? PersonName { get; set; }
        public int StatusId { get; set; }
        public string? StatusName { get; set; }
        public int DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsApproved { get; set; }
        public bool IsDeleted { get; set; } = false;

    }
}
