using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PurchaseTeamAira.Database;
using PurchaseTeamAira.Models.AllDto.Contractor;
using PurchaseTeamAira.Models.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PurchaseTeamAira.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContractorsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ContractorsController(ApplicationDbContext context)
        {
            _context = context;
        }
        [HttpGet]
        public async Task<ActionResult<PagedResult<ContractorResponseDto>>> GetAll(int pageNumber = 1, int pageSize = 10)
        {
            var query = _context.Contractors
                // Optional: if you have soft deletes
                .Select(c => new ContractorResponseDto
                {
                    ContractorId = c.ContractorId,
                    ContractorName = c.ContractorName
                });

            var pagedResult = await PaginationHelper.PaginateAsync(query, pageNumber, pageSize);
            return Ok(pagedResult);
        }



        // GET: api/Contractor
        //[HttpGet]
        //public async Task<ActionResult<IEnumerable<ContractorResponseDto>>> GetAll()
        //{
        //    var data =   await _context.Contractors.ToListAsync();
        //    return Ok(data);
        //}

        // GET: api/Contractor/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<ContractorResponseDto>> GetById(int id)
        {
            var contractor = await _context.Contractors
                
                .Select(c => new ContractorResponseDto
                {
                    ContractorId = c.ContractorId,
                    ContractorName = c.ContractorName,
                   
                })
                .FirstOrDefaultAsync();

            if (contractor == null)
                return NotFound();

            return Ok(contractor);
        }

        // POST: api/Contractor
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] ContractorCreateDto dto)
        {
            if (dto == null)
                return BadRequest("Invalid data.");

            var contractor = new Contractor
            {
                ContractorName = dto.ContractorName,
              
            };

            await _context.Contractors.AddAsync(contractor);
            await _context.SaveChangesAsync();

            // Return created response with new resource URL and object
            return CreatedAtAction(nameof(GetById), new { id = contractor.ContractorId }, new ContractorResponseDto
            {
                ContractorId = contractor.ContractorId,
                ContractorName = contractor.ContractorName,
               
            });
        }

        // PUT: api/Contractor/{id}
        [HttpPut("{id:int}")]
        public async Task<ActionResult> Update(int id, [FromBody] ContractorCreateDto dto)
        {
            if (dto == null)
                return BadRequest("Invalid data.");

            var existing = await _context.Contractors.FindAsync(id);
            if (existing == null )
                return NotFound();

            existing.ContractorName = dto.ContractorName;
            
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Contractor/{id}
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete(int id)
        {
            var existing = await _context.Contractors.FindAsync(id);
            if (existing == null )
                return NotFound();

            // Soft delete (assuming DateDeleteApproved base class has IsDeleted and DeletedAt)
            _context.Contractors.Remove(existing);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
