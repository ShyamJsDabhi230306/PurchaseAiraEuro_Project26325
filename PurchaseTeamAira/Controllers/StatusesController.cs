using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PurchaseTeamAira.Database;
using PurchaseTeamAira.Models.AllDto.Status;
using PurchaseTeamAira.Models.Entities;
using System;

namespace PurchaseTeamAira.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatusController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StatusController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Statuses
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StatusResponseDto>>> GetStatuses()
        {
            var statuses = await _context.Status
                .Where(s => !s.IsDeleted)
                .Select(s => new StatusResponseDto
                {
                    StatusId = s.StatusId,
                    StatusName = s.StatusName,
                    CreatedAt = s.CreatedAt,
                    IsApproved = s.IsApproved
                })
                .ToListAsync();

            return Ok(statuses);
        }

        // GET: api/Statuses/5
        [HttpGet("{id}")]
        public async Task<ActionResult<StatusResponseDto>> GetStatus(int id)
        {
            var status = await _context.Status
                .Where(s => s.StatusId == id && !s.IsDeleted)
                .Select(s => new StatusResponseDto
                {
                    StatusId = s.StatusId,
                    StatusName = s.StatusName,
                    CreatedAt = s.CreatedAt,
                    IsApproved = s.IsApproved
                })
                .FirstOrDefaultAsync();

            if (status == null)
                return NotFound();

            return Ok(status);
        }

        // POST: api/Statuses
        [HttpPost]
        public async Task<ActionResult<StatusResponseDto>> CreateStatus(StatusDto dto)
        {
            var status = new Status
            {
                StatusName = dto.StatusName,
                IsApproved = dto.IsApproved,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

           await _context.Status.AddAsync(status);
            await _context.SaveChangesAsync();

            var responseDto = new StatusResponseDto
            {
                StatusId = status.StatusId,
                StatusName = status.StatusName,
                CreatedAt = status.CreatedAt,
                IsApproved = status.IsApproved
            };
            return Ok(responseDto);
            //return CreatedAtAction(nameof(GetStatus), new { id = status.StatusId }, responseDto);
        }

        // PUT: api/Statuses/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStatus(int id, StatusDto dto)
        {
            var status = await _context.Status.FindAsync(id);

            if (status == null || status.IsDeleted)
                return NotFound();

            status.StatusName = dto.StatusName;
            status.IsApproved = dto.IsApproved;

            await _context.SaveChangesAsync();

            return Ok(status);
        }

        // DELETE: api/Statuses/5 (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStatus(int id)
        {
            var status = await _context.Status.FindAsync(id);

            if (status == null || status.IsDeleted)
                return NotFound();

            status.IsDeleted = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
