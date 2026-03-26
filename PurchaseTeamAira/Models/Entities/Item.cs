using PurchaseTeamAira.Models.Entities;
using PurchaseTeamAira.Models.Enum;
using System.ComponentModel.DataAnnotations.Schema;

public class Item
{
    public int Id { get; set; }

    public ProductType ProductType { get; set; }

    public string? ItemName { get; set; }

    public string? ModelCode { get; set; }

    [ForeignKey(nameof(StatusForItem))]
    public int ItemStatusId { get; set; }

    public DateTime Date { get; set; }

    public bool IsApproved { get; set; }

    public bool IsDeleted { get; set; }

    public StatusForItem? StatusForItem { get; set; }

    public ICollection<OutWards> OutWards { get; set; }

    public ICollection<InWards> InWards { get; set; }
}
