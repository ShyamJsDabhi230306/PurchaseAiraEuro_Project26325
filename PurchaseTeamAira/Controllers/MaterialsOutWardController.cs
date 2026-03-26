using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PurchaseTeamAira.Database;
using PurchaseTeamAira.Models.AllDto.OutWard;
using PurchaseTeamAira.Models.Entities;

namespace PurchaseTeamAira.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaterialsOutWardController : ControllerBase
    {

        private readonly ApplicationDbContext _context;

        public MaterialsOutWardController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Outward
        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            var list = await _context.MaterialsOutWard.ToListAsync();
            return Ok(list);
        }

        // GET: api/Outward/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<MaterialsOutWard>> GetById(int id)
        {
            var item = await _context.MaterialsOutWard.FindAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        // POST: api/Outward
        [HttpPost]
        public async Task<ActionResult> Create(OutwardDto dto)
        {
            var entity = new MaterialsOutWard
            {
                OutWardDate = dto.OutWardDate,
                OutwardBy = dto.OutwardBy,
                OutwardThrough = dto.OutwardThrough,
                OutwardDepartment = dto.OutwardDepartment,
                ReceiveBy = dto.ReceiveBy
            };

           await _context.MaterialsOutWard.AddAsync(entity);
            await _context.SaveChangesAsync();
            return Ok("data add successfully");
            // Return 201 with location header
            //return CreatedAtAction(nameof(GetById), new { id = entity.OutWardId }, entity);
        }

        // PUT: api/Outward/{id}
        [HttpPut("{id:int}")]
        public async Task<ActionResult> Update(int id, OutwardDto dto)
        {
            var existing = await _context.MaterialsOutWard.FindAsync(id);
            if (existing == null) return NotFound();

            // Update fields
            existing.OutWardDate = dto.OutWardDate;
            existing.OutwardBy = dto.OutwardBy;
            existing.OutwardThrough = dto.OutwardThrough;
            existing.OutwardDepartment = dto.OutwardDepartment;
            existing.ReceiveBy = dto.ReceiveBy;

            await _context.SaveChangesAsync();

            return NoContent(); // 204
        }

        // DELETE: api/Outward/{id}
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete(int id)
        {
            var existing = await _context.MaterialsOutWard.FindAsync(id);
            if (existing == null) return NotFound();

            _context.MaterialsOutWard.Remove(existing);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
