using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PurchaseTeamAira.Database;
using PurchaseTeamAira.Models.AllDto.InwardDto;
using PurchaseTeamAira.Models.Entities;
using System;

[ApiController]
[Route("api/[controller]")]
public class InwardsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public InwardsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Inwards
    [HttpGet]
    public async Task<ActionResult<IEnumerable<InwardDto>>> GetInwards()
    {
        var inwards = await _context.InWards
            .Include(i => i.Item)
            .Include(i => i.Contractor)
            .Include(i => i.Status)
            .Where(i => !i.IsDeleted)
            .Select(i => new InwardDto
            {
                InwardId = i.InwardId,
                ItemId = i.ItemId,
                ItemName = i.Item.ItemName,
                ContractorId = i.ContractorId,
                ContractorName = i.Contractor.ContractorName,
                StatusId = i.StatusId,
                StatusName = i.Status.StatusName,
                CreatedAt = i.CreatedAt,
                IsApproved = i.IsApproved,
                IsDeleted = i.IsDeleted
            })
            .ToListAsync();

        return Ok(inwards);
    }

    // GET: api/Inwards/5
    [HttpGet("{id}")]
    public async Task<ActionResult<InwardDto>> GetInward(int id)
    {
        var inward = await _context.InWards
            .Include(i => i.Item)
            .Include(i => i.Contractor)
            .Include(i => i.Status)
            .Where(i => i.InwardId == id && !i.IsDeleted)
            .Select(i => new InwardDto
            {
                InwardId = i.InwardId,
                ItemId = i.ItemId,
                ItemName = i.Item.ItemName,
                ContractorId = i.ContractorId,
                ContractorName = i.Contractor.ContractorName,
                StatusId = i.StatusId,
                StatusName = i.Status.StatusName,
                CreatedAt = i.CreatedAt,
                IsApproved = i.IsApproved,
                IsDeleted = i.IsDeleted
            })
            .FirstOrDefaultAsync();

        if (inward == null)
        {
            return NotFound();
        }

        return Ok(inward);
    }

    // POST: api/Inwards
    [HttpPost]
    public async Task<ActionResult<InwardDto>> CreateInward(InwardDto dto)
    {
        var data = new InWards()
        {
            ItemId = dto.ItemId,
            ContractorId = dto.ContractorId,
            StatusId = dto.StatusId,
            CreatedAt = dto.CreatedAt,
            IsApproved = false,
            IsDeleted = false,


        };

        _context.InWards.Add(data);
        await _context.SaveChangesAsync();
        return Ok(data);
    }

    // PUT: api/Inwards/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateInward(int id, InwardDto dto)
    {
        if (id != dto.InwardId)
        {
            return BadRequest();
        }

        var inward = await _context.InWards.FindAsync(id);
        if (inward == null || inward.IsDeleted)
        {
            return NotFound();
        }

        inward.ItemId = dto.ItemId;
        inward.ContractorId = dto.ContractorId;
        inward.StatusId = dto.StatusId;
        inward.CreatedAt = dto.CreatedAt;
        inward.IsApproved = dto.IsApproved;
        inward.IsDeleted = dto.IsDeleted;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/Inwards/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteInward(int id)
    {
        var inward = await _context.InWards.FindAsync(id);
        if (inward == null || inward.IsDeleted)
        {
            return NotFound();
        }

        inward.IsDeleted = true;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
