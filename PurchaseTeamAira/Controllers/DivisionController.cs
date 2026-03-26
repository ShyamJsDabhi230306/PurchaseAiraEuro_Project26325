using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PurchaseTeamAira.Database;
using PurchaseTeamAira.Models.AllDto;
using PurchaseTeamAira.Models.Entities;

namespace PurchaseTeamAira.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DivisionController : ControllerBase
    {
        private readonly ApplicationDbContext context;

        public DivisionController(ApplicationDbContext context)
        {
            this.context = context;
        }

        // ✅ GET with pagination
        [HttpGet]
        public async Task<IActionResult> Division_Records(int pageNumber = 1, int pageSize = 10)
        {

          var data =   await context.Divisions.ToListAsync();
            return Ok(data);
        //    if (pageNumber <= 0 || pageSize <= 0)
        //        return BadRequest("Page number and size must be greater than zero.");

        //    var totalDivisions = await context.Divisions.CountAsync();

        //    var divisions = await context.Divisions
        //        .Skip((pageNumber - 1) * pageSize)
        //        .Take(pageSize)
        //        .ToListAsync();

        //    var response = new
        //    {
        //        TotalItems = totalDivisions,
        //        PageNumber = pageNumber,
        //        PageSize = pageSize,
        //        TotalPages = (int)Math.Ceiling(totalDivisions / (double)pageSize),
        //        Items = divisions
        //    };

        //    return Ok(response);
        }

        // ✅ GET all divisions (no pagination)
        [HttpGet("all")]
        public async Task<IActionResult> GetAllDivisions()
        {
            var divisions = await context.Divisions.ToListAsync();
            return Ok(divisions);
        }

        // ✅ POST - Create new division
        [HttpPost]
        public async Task<IActionResult> CreateDivision([FromBody] DivisionDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.DivisionName))
                return BadRequest("Division Name is required");

            var division = new Division
            {
                DivisionName = dto.DivisionName,
                Remarks = dto.Remarks
            };

            await context.Divisions.AddAsync(division);
            await context.SaveChangesAsync();

            return Ok(division);
        }



        // ✅ PUT - Update existing division
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateDivision(int id, [FromBody] DivisionDto dto)
        {
            var division = await context.Divisions.FindAsync(id);
            if (division == null)
                return NotFound();

            division.DivisionName = dto.DivisionName;
            division.Remarks = dto.Remarks;

            await context.SaveChangesAsync();

            return Ok(division);
        }


        // ✅ DELETE - Delete division
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteDivision(int id)
        {
            var existing = await context.Divisions.FindAsync(id);
            if (existing == null)
                return NotFound("Division not found");

            context.Divisions.Remove(existing);
            await context.SaveChangesAsync();

            return Ok("Division deleted successfully");
        }
    }
}
