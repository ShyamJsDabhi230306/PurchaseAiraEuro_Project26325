using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PurchaseTeamAira.Database;
using PurchaseTeamAira.Models.AllDto.UserRightDto;
using PurchaseTeamAira.Models.Entities;

[ApiController]
[Route("api/[controller]")]
public class UserRightsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UserRightsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(int pageNumber = 1, int pageSize = 10)
    {
        var query = _context.UserRights
            .Where(ur => !ur.IsDeleted)
            .Select(u => new UserRightsDto
            {
                UserRightsId = u.UserRightsId,
                UserId = u.UserId,
                UserName = u.User.PersonName,
                CompanyId = u.CompanyId,
                CompanyName = u.Company != null ? u.Company.CompanyName : null,
                LocationId = u.LocationId,
                LocationName = u.Location != null ? u.Location.LocationName : null,
                DepartmentId = u.DepartmentId,
                DepartmentName = u.Department != null ? u.Department.DepartmentName : null
            });

        var pagedResult = await PaginationHelper.PaginateAsync(query, pageNumber, pageSize);

        return Ok(pagedResult);
    }




    // GET: api/UserRights
    //[HttpGet]
    //public async Task<IActionResult> GetAll()
    //{
    //    var rights = await _context.UserRights
    //        .Include(ur => ur.User)
    //        .Include(ur => ur.Company)
    //        .Include(ur => ur.Location)
    //        .Include(ur => ur.Department)
    //        .Where(ur => !ur.IsDeleted)
    //        .Select(u => new UserRightsDto
    //        {
    //            UserRightsId = u.UserRightsId,
    //            UserId = u.UserId,
    //            UserName = u.User.PersonName,
    //            CompanyId = u.CompanyId,
    //            CompanyName = u.Company.CompanyName,
    //            LocationId = u.LocationId,
    //            LocationName = u.Location.LocationName,
    //            DepartmentId = u.DepartmentId,
    //            DepartmentName = u.Department.DepartmentName
    //        })
    //        .ToListAsync();

    //    return Ok(rights);
    //}

    // GET: api/UserRights/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var rights = await _context.UserRights
            .Include(ur => ur.User)
            .Include(ur => ur.Company)
            .Include(ur => ur.Location)
            .Include(ur => ur.Department)
            .FirstOrDefaultAsync(ur => ur.UserRightsId == id && !ur.IsDeleted);

        if (rights == null)
            return NotFound("User Right not found.");

        return Ok(new UserRightsDto
        {
            UserRightsId = rights.UserRightsId,
            UserId = rights.UserId,
            CompanyId = rights.CompanyId,
            LocationId = rights.LocationId,
            DepartmentId = rights.DepartmentId,
            UserName = rights.User?.PersonName,
            CompanyName = rights.Company?.CompanyName,
            LocationName = rights.Location?.LocationName,
            DepartmentName = rights.Department?.DepartmentName
        });
    }

    // POST: api/UserRights
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRightsDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest("Invalid data submitted.");

        try
        {
            var userRights = new UserRights
            {
                UserId = dto.UserId,
                CompanyId = dto.CompanyId,
                LocationId = dto.LocationId,
                DepartmentId = dto.DepartmentId,
                CreatedAt = DateTime.UtcNow,
                IsApproved = false,
                IsDeleted = false
            };

            _context.UserRights.Add(userRights);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = userRights.UserRightsId }, userRights);
        }
        catch (Exception ex)
        {
            // Log the exception (ideally with a logger, here we just return it)
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    // PUT: api/UserRights/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateUserRightsDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest("Invalid data submitted.");

        try
        {
            var existing = await _context.UserRights.FirstOrDefaultAsync(ur => ur.UserRightsId == id && !ur.IsDeleted);
            if (existing == null)
                return NotFound("User Right not found.");

            existing.UserId = dto.UserId;
            existing.CompanyId = dto.CompanyId;
            existing.LocationId = dto.LocationId;
            existing.DepartmentId = dto.DepartmentId;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    // DELETE: api/UserRights/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var existing = await _context.UserRights.FirstOrDefaultAsync(ur => ur.UserRightsId == id && !ur.IsDeleted);
            if (existing == null)
                return NotFound("User Right not found.");

            existing.IsDeleted = true;
            existing.CreatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}

