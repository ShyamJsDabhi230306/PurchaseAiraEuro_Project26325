using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PurchaseTeamAira.Database;
using PurchaseTeamAira.Models.AllDto.StatusForItemDto;
using PurchaseTeamAira.Models.Entities;
using System;

namespace PurchaseTeamAira.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatusForItemController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StatusForItemController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/StatusForItem
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StatusForItemDto>>> GetStatuses()
        {
            var statuses = await _context.StatusForItems
                .Where(s => (bool)!s.IsDeleted)
                .ToListAsync();

            var dtos = statuses.Select(s => new StatusForItemDto
            {
                ItemStatusId = s.ItemStatusId,
                ItemStatusName = s.ItemStatusName
            });

            return Ok(dtos);
        }

        // GET: api/StatusForItem/5
        [HttpGet("{id}")]
        public async Task<ActionResult<StatusForItemDto>> GetStatus(int id)
        {
            var status = await _context.StatusForItems.FindAsync(id);

            if (status == null || (bool)status.IsDeleted)
                return NotFound();

            var dto = new StatusForItemDto
            {
                ItemStatusId = status.ItemStatusId,
                ItemStatusName = status.ItemStatusName
            };

            return Ok(dto);
        }

        // POST: api/StatusForItem
        [HttpPost]
        public async Task<ActionResult<StatusForItemDto>> CreateStatus(StatusForItemDto dto)
        {
            var entity = new StatusForItem
            {
                ItemStatusName = dto.ItemStatusName,
                CreatedDate = DateTime.UtcNow,
                IsDeleted = false,
                IsApproved = false
            };

            _context.StatusForItems.Add(entity);
            await _context.SaveChangesAsync();

            // Return created entity as DTO (with generated ID)
            return CreatedAtAction(nameof(GetStatus), new { id = entity.ItemStatusId }, new StatusForItemDto
            {
                ItemStatusId = entity.ItemStatusId,
                ItemStatusName = entity.ItemStatusName
            });
        }

        // PUT: api/StatusForItem/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStatus(int id, StatusForItemDto dto)
        {
            if (id != dto.ItemStatusId)
                return BadRequest("ID mismatch");

            var existing = await _context.StatusForItems.FindAsync(id);
            if (existing == null || (bool)existing.IsDeleted)
                return NotFound();

            existing.ItemStatusName = dto.ItemStatusName;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/StatusForItem/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStatus(int id)
        {
            var status = await _context.StatusForItems.FindAsync(id);
            if (status == null || (bool)status.IsDeleted)
                return NotFound();

            status.IsDeleted = true;
            

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
