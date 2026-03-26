using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PurchaseTeamAira.Database;
using PurchaseTeamAira.Models.AllDto;
using PurchaseTeamAira.Models.Entities;

namespace PurchaseTeamAira.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompanyController : ControllerBase
    {
        private readonly ApplicationDbContext context;

        public CompanyController(ApplicationDbContext context)
        {
            this.context = context;
        }
        [HttpGet]
        public async Task<IActionResult> GetAllCompanies(int pageNumber = 1, int pageSize = 10)
        {
            var query = context.Companies.Where(c => !c.IsDeleted);

            var pagedResult = await PaginationHelper.PaginateAsync(query, pageNumber, pageSize);

            return Ok(pagedResult);
        }
        //[HttpGet]
        //public async Task<IActionResult> GetAllCompanies()  
        //{
        //    var data =  await context.Companies.
        //        Where(d => !d.IsDeleted).ToListAsync();
        //    return Ok(data);
        //}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCompnayById(int id)
        {
            var data = await context.Companies.FindAsync(id);
            if (data == null || data.IsDeleted)
            {
                return NotFound();
            }
            return Ok(data);
        }
        [HttpPost]
        public async Task<IActionResult> CreateCompany(CompanyCreateDto createDto)
        {
            var data = new Company()
            {
                CompanyName = createDto.CompanyName,
                CreatedAt = DateTime.UtcNow,
                IsApproved = createDto.isApproved,
                IsDeleted = false
            };
                await context.Companies.AddAsync(data);
                await context.SaveChangesAsync();
                return Ok(data);
            
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCompany(CompanyUpdateDto updateDto, int id)
        {
            var data = await context.Companies.FindAsync(id);
            if (data == null || data.IsDeleted)
            {
                return NotFound();
            }

            data.CompanyName = updateDto.CompanyName;
            data.IsApproved = updateDto.isApproved;
            context.Companies.Update(data);
            await context.SaveChangesAsync();

            return Ok("Company updated successfully.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> CompanyDeleted(int id)
        {
            var data = await context.Companies.FindAsync(id);
            if( data == null || id == 0)
            {
                return NotFound();
            }
            data.IsDeleted= true;
            await context.SaveChangesAsync();
            return Ok("Data Deleted Successfully");
        }


    }
}
