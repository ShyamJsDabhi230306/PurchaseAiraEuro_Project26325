using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PurchaseTeamAira.Database;
using PurchaseTeamAira.Models.AllDto.PagesPermissions;
using PurchaseTeamAira.Models.Entities;

namespace PurchaseTeamAira.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PagePermissionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PagePermissionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/PagePermissions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PagePermissionDto>>> GetPagePermissions()
        {
            var permissions = await _context.PagePermissions
                .Where(p => !p.IsDeleted)
                .Include(p => p.User)
                .Include(p => p.Page)
                .ToListAsync();

            var dtoList = permissions.Select(p => new PagePermissionDto
            {
                UserId = p.UserId,
                PageId = p.PageId,
                IsAllowed = p.IsAllowed,
                UserName = p.User?.UserName,
                PageName = p.Page?.PageName,
                PageRout = p.Page?.PageRout,
                Module = p.Page?.Module
            });

            return Ok(dtoList);
        }

        [HttpGet("GetByUserId")]
        public async Task<ActionResult<IEnumerable<PagePermissionDto>>> GetPagePermissionByUserId(int userId)
        {
            var permissions = await _context.PagePermissions
                .Where(p => !p.IsDeleted && p.UserId == userId)
                .Include(p => p.User)
                .Include(p => p.Page)
                .ToListAsync();

            var dtoList = permissions.Select(p => new PagePermissionDto
            {
                UserId = p.UserId,
                PageId = p.PageId,
                IsAllowed = p.IsAllowed,
                UserName = p.User?.UserName,
                PageName = p.Page?.PageName,
                PageRout = p.Page?.PageRout,
                Module = p.Page?.Module
            });

            return Ok(dtoList);
        }

        // GET: api/PagePermissions/5  (all permissions for a user)
        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<PagePermissionDto>>> GetPagePermission(int id)
        {
            var permissions = await _context.PagePermissions
                .Where(p => p.UserId == id && !p.IsDeleted)
                .Include(p => p.User)
                .Include(p => p.Page)
                .ToListAsync();

            var dtoList = permissions.Select(p => new PagePermissionDto
            {
                UserId = p.UserId,
                PageId = p.PageId,
                IsAllowed = p.IsAllowed,
                UserName = p.User?.UserName,
                PageName = p.Page?.PageName,
                PageRout = p.Page?.PageRout,
                Module = p.Page?.Module
            });

            return Ok(dtoList);
        }

        // POST: api/PagePermissions  (UPSERT a single row by (UserId, PageId))
        [HttpPost]
        public async Task<ActionResult> PostPagePermission(PagePermissionDto dto)
        {
            var existing = await _context.PagePermissions
                .FirstOrDefaultAsync(x => !x.IsDeleted && x.UserId == dto.UserId && x.PageId == dto.PageId);

            if (existing == null)
            {
                var permission = new PagePermission
                {
                    UserId = dto.UserId,
                    PageId = dto.PageId,
                    IsAllowed = dto.IsAllowed,
                    IsDeleted = false
                };
                await _context.PagePermissions.AddAsync(permission);
            }
            else
            {
                existing.IsAllowed = dto.IsAllowed;
            }

            await _context.SaveChangesAsync();
            return Ok("Saved");
        }

        // BULK SAVE: api/PagePermissions/saveUserPermissions
        // Body: List<PagePermissionDto> where all rows are for the same user
        [HttpPost("saveUserPermissions")]
        public async Task<ActionResult> SaveUserPermissions([FromBody] List<PagePermissionDto> rows)
        {
            if (rows == null || rows.Count == 0) return BadRequest("Empty payload.");

            var userId = rows.First().UserId;

            // Load current (not deleted) permissions for user
            var current = await _context.PagePermissions
                .Where(p => !p.IsDeleted && p.UserId == userId)
                .ToListAsync();

            // Upsert each incoming row
            foreach (var dto in rows)
            {
                var existing = current.FirstOrDefault(x => x.PageId == dto.PageId);
                if (existing == null)
                {
                    _context.PagePermissions.Add(new PagePermission
                    {
                        UserId = userId,
                        PageId = dto.PageId,
                        IsAllowed = dto.IsAllowed,
                        IsDeleted = false
                    });
                }
                else
                {
                    existing.IsAllowed = dto.IsAllowed;
                }
            }

            await _context.SaveChangesAsync();
            return Ok("Bulk save complete");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutPagePermission(int id, PagePermissionDto dto)
        {
            var permission = await _context.PagePermissions.FindAsync(id);
            if (permission == null || permission.IsDeleted) return NotFound();

            permission.UserId = dto.UserId;
            permission.PageId = dto.PageId;
            permission.IsAllowed = dto.IsAllowed;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePagePermission(int id)
        {
            var permission = await _context.PagePermissions.FindAsync(id);
            if (permission == null || permission.IsDeleted) return NotFound();

            permission.IsDeleted = true;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
