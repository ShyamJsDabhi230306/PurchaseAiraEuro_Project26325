using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PurchaseTeamAira.Models.AllDto.Operator;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;
using PurchaseTeamAira.Database;
using PurchaseTeamAira.Models.Entities;

namespace YourProjectNamespace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OperatorController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OperatorController(ApplicationDbContext context)
        {
            _context = context;
        }
        [HttpGet]
        public async Task<ActionResult<PagedResult<OperatorDto>>> GetOperators(int pageNumber = 1, int pageSize = 10)
        {
            var query = _context.Operators
                .Where(o => !o.IsDeleted)
                .Include(o => o.Contractor)
                .Select(o => new OperatorDto
                {
                    OperatorId = o.OperatorId,
                    OperatorName = o.OperatorName,
                    OperatorContact = o.OperatorContact,
                    ContractorId = o.ContractorId,
                    CreatedAt = o.CreatedAt,
                    IsApproved = o.IsApproved,
                    IsDeleted = o.IsDeleted,
                    ContractorName = o.Contractor != null ? o.Contractor.ContractorName : null
                });

            var pagedResult = await PaginationHelper.PaginateAsync(query, pageNumber, pageSize);

            return Ok(pagedResult);
        }


        // GET: api/operator
        //[HttpGet]
        //public async Task<ActionResult<IEnumerable<OperatorDto>>> GetOperators()
        //{
        //    var operators = await _context.Operators
        //        .Where(o => !o.IsDeleted)
        //        .Include(o => o.Contractor) // If you want to include contractor data
        //        .ToListAsync();

        //    var dtoList = operators.Select(o => new OperatorDto
        //    {
        //        OperatorId = o.OperatorId,
        //        OperatorName = o.OperatorName,
        //        OperatorContact = o.OperatorContact,
        //        ContractorId = o.ContractorId,
        //        CreatedAt = o.CreatedAt,
        //        IsApproved = o.IsApproved,
        //        IsDeleted = o.IsDeleted,
        //        ContractorName = o.Contractor != null ? o.Contractor.ContractorName : null
        //    }).ToList();

        //    return Ok(dtoList);
        //}

        // GET: api/operator/5
        [HttpGet("{id}")]
        public async Task<ActionResult<OperatorDto>> GetOperator(int id)
        {
            var o = await _context.Operators
                .Include(op => op.Contractor)
                .FirstOrDefaultAsync(op => op.OperatorId == id && !op.IsDeleted);

            if (o == null)
                return NotFound();

            var dto = new OperatorDto
            {
                OperatorId = o.OperatorId,
                OperatorName = o.OperatorName,
                OperatorContact = o.OperatorContact,
                ContractorId = o.ContractorId,
                CreatedAt = o.CreatedAt,
                IsApproved = o.IsApproved,
                IsDeleted = o.IsDeleted,
                ContractorName = o.Contractor?.ContractorName
            };

            return Ok(dto);
        }

        // POST: api/operator
        [HttpPost]
        public async Task<ActionResult<OperatorDto>> CreateOperator(OperatorDto dto)
        {
            // Optional: Validate if OperatorContact is unique
            if (await _context.Operators.AnyAsync(o => o.OperatorContact == dto.OperatorContact && !o.IsDeleted))
                return Conflict("OperatorContact must be unique.");

            var oper = new Operator
            {
                OperatorName = dto.OperatorName,
                OperatorContact = dto.OperatorContact,
                ContractorId = dto.ContractorId,
                CreatedAt = dto.CreatedAt ?? DateTime.Now,
                IsApproved = dto.IsApproved,
                IsDeleted = false
            };

            _context.Operators.Add(oper);
            await _context.SaveChangesAsync();

            dto.OperatorId = oper.OperatorId;
            dto.CreatedAt = oper.CreatedAt;
            dto.IsDeleted = oper.IsDeleted;

            return CreatedAtAction(nameof(GetOperator), new { id = oper.OperatorId }, dto);
        }

        // PUT: api/operator/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOperator(int id, OperatorDto dto)
        {
            if (id != dto.OperatorId)
                return BadRequest("Operator ID mismatch");

            var oper = await _context.Operators.FindAsync(id);
            if (oper == null || oper.IsDeleted)
                return NotFound();

            // Optional: Check unique OperatorContact (excluding this record)
            if (await _context.Operators.AnyAsync(o => o.OperatorContact == dto.OperatorContact && o.OperatorId != id && !o.IsDeleted))
                return Conflict("OperatorContact must be unique.");

            oper.OperatorName = dto.OperatorName;
            oper.OperatorContact = dto.OperatorContact;
            oper.ContractorId = dto.ContractorId;
            oper.IsApproved = dto.IsApproved;
            // Usually CreatedAt is not updated here
            // Soft delete is handled separately

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/operator/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOperator(int id)
        {
            var oper = await _context.Operators.FindAsync(id);
            if (oper == null || oper.IsDeleted)
                return NotFound();

            oper.IsDeleted = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
