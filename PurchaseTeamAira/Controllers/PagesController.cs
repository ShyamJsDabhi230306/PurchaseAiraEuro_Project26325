using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PurchaseTeamAira.Database;
using PurchaseTeamAira.Models.AllDto.PagesDto;
using PurchaseTeamAira.Models.Entities;

namespace PurchaseTeamAira.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PagesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
     

        public PagesController(ApplicationDbContext context)
        {
            _context = context;
            
        }

        // GET: api/Pages
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PageDto>>> GetPages()
        {
            var pages = await _context.Pages
                                      .Where(p => !p.IsDeleted)
                                      .ToListAsync();

            return Ok(pages);
        }

        // GET: api/Pages/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PageDto>> GetPage(int id)
        {
            var page = await _context.Pages.FindAsync(id);

            if (page == null || page.IsDeleted)
                return NotFound();

            return Ok();
        }

        // POST: api/Pages
        [HttpPost]
        public async Task<ActionResult<PageDto>> PostPage(PageDto dto)
        {
            var data  = new Page()
            {

               PageName = dto.PageName,
               PageRout = dto.PageRout,
               Module = dto.Module,
               
            };
           await _context.Pages.AddAsync(data);
            await _context.SaveChangesAsync();
            return Ok();
            
        }

        // PUT: api/Pages/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPage(int id, PageDto dto)
        {
            if (id != dto.PageId)
                return BadRequest("Page ID mismatch.");

            var page = await _context.Pages.FindAsync(id);
            if (page == null || page.IsDeleted)
                return NotFound();

            // ✅ Manually update fields one by one
            page.PageName = dto.PageName;
            page.PageRout = dto.PageRout;
            page.Module = dto.Module;

            // Optionally skip this if you don’t want external control of deletion
            // page.IsDeleted = dto.IsDeleted; 

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Pages.Any(e => e.PageId == id))
                    return NotFound();

                throw;
            }

            return NoContent();
        }

        // DELETE: api/Pages/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePage(int id)
        {
            var page = await _context.Pages.FindAsync(id);

            if (page == null || page.IsDeleted)
                return NotFound();

            // Soft delete
            page.IsDeleted = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
