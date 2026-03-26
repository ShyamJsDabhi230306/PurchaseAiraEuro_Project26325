using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PurchaseTeamAira.Database;
using PurchaseTeamAira.Models.AllDto.Department;
using PurchaseTeamAira.Models.AllDto.DepartmentDto;
using PurchaseTeamAira.Models.Entities;

[ApiController]
[Route("api/[controller]")] // -> /api/Department
public class DepartmentController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DepartmentController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET /api/Department?pageNumber=1&pageSize=10
    [HttpGet]
    public async Task<IActionResult> GetAll(int pageNumber = 1, int pageSize = 10)
    {
        var query = _context.Departments
            .Where(d => !d.IsDeleted)
            .Select(d => new
            {
                d.DepartmentId,
                d.DepartmentName,
                d.LocationId,
                LocationName = d.Locations != null ? d.Locations.LocationName : null
            });

        var pagedResult = await PaginationHelper.PaginateAsync(query, pageNumber, pageSize);
        return Ok(pagedResult); // { items, totalItems, pageNumber, pageSize }
    }

    // GET /api/Department/10
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var dept = await _context.Departments
            .Where(d => !d.IsDeleted && d.DepartmentId == id)
            .Select(d => new
            {
                d.DepartmentId,
                d.DepartmentName,
                d.LocationId,
                LocationName = d.Locations != null ? d.Locations.LocationName : null
            })
            .FirstOrDefaultAsync();

        if (dept == null) return NotFound();
        return Ok(dept);
    }

    // POST /api/Department
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] DepartmentDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var entity = new Department
        {
            DepartmentName = dto.DepartmentName,
            LocationId = dto.LocationId,
            IsDeleted = false
        };

        _context.Departments.Add(entity);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = entity.DepartmentId }, new
        {
            entity.DepartmentId,
            entity.DepartmentName,
            entity.LocationId
        });
    }

    // PUT /api/Department/10
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] DepartmentDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var entity = await _context.Departments.FirstOrDefaultAsync(d => d.DepartmentId == id && !d.IsDeleted);
        if (entity == null) return NotFound();

        entity.DepartmentName = dto.DepartmentName;
        entity.LocationId = dto.LocationId;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/Department/10  (soft delete)
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await _context.Departments.FirstOrDefaultAsync(d => d.DepartmentId == id && !d.IsDeleted);
        if (entity == null) return NotFound();

        entity.IsDeleted = true;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}


