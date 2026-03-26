using PurchaseTeamAira.Models.Entities.GeneralEnties;

namespace PurchaseTeamAira.Models.Entities
{
    public class SecondInWard:DateDeleteApproved
    {
        public int SecondInwardId { get; set; }
        public int OutWardId { get; set; }
        public int StatusId { get; set; }
        //public int OperatorId { get; set; }

        // making relation for navigation 

        public virtual OutWards? OutWard { get; set; }
        public virtual Status? Status { get; set; }
        
        //public Operator? Operators { get; set; }



    }
}
