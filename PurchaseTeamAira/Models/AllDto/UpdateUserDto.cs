using System.ComponentModel.DataAnnotations;

public class UpdateUserDto
{
    [Required]
    public int UserId { get; set; }


    [Required]
    public string PersonName { get; set; }

    [Required]
    public string UserName { get; set; }

    public string Password { get; set; } // nullable

    public bool AllowLogin { get; set; }
    public string? UserContact { get; set; }
    public bool IsApproved { get; set; }
    public bool IsDeleted { get; set; }

    [Required]
    public int CompanyId { get; set; }

    [Required]
    public int UserTypeId { get; set; }
}
