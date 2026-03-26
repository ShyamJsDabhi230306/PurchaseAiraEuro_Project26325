using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PurchaseTeamAira.Database;
using PurchaseTeamAira.Models.AllDto.OutWard;
using PurchaseTeamAira.Models.AllDto.OutWardDto;
using PurchaseTeamAira.Models.Entities;

namespace PurchaseTeamAira.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OutWardsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OutWardsController(ApplicationDbContext context)
        {
            _context = context;
        }


        [HttpGet]
        public async Task<ActionResult<PagedResult<OutWardDtoForAll>>> GetOutWards(int pageNumber = 1, int pageSize = 10)
        {
            var query = _context.OutWards
                .Include(o => o.Item)
                .Include(o => o.Contractor)
                .Include(o => o.Operators)
                .Include(o => o.Status)
                .Include(o => o.Department)
                .Select(o => new OutWardDtoForAll
                {
                    OutWardId = o.OutWardId,
                    ItemId = o.ItemId,
                    ItemName = o.Item.ItemName,
                    ContractorId = o.ContractorId,
                    ContractorName = o.Contractor.ContractorName,
                    OperatorId = o.OperatorId,
                    OperatorName = o.Operators.OperatorName,
                    StatusId = o.StatusId,
                    StatusName = o.Status.StatusName,
                    DepartmentId = o.DepartmentId,
                    DepartmentName = o.Department.DepartmentName,
                    CreatedAt = o.CreatedAt,
                    IsApproved = o.IsApproved,
                    IsDeleted = o.IsDeleted
                });

            //var pagedResult = await PaginationHelper.PaginateAsync(query, pageNumber, pageSize);

            return Ok(query);
        }
        //[HttpGet("GetItemDropdown")]
        //public async Task<IActionResult> GetItemDropdown()
        //{
        //    var data = await _context.OutWards.ToListAsync(); // ✅ Await the async call
        //    return Ok(data); // This now returns the actual data
        //}

        // GET: api/OutWards
        //[HttpGet]
        //public async Task<ActionResult<IEnumerable<OutWardDtoForAll>>> GetOutWards()
        //{
        //    var result = await _context.OutWards
        //        .Where(o => !o.IsDeleted)
        //        .Include(o => o.Item)
        //        .Include(o => o.Contractor)
        //        .Include(o => o.Operators)
        //        .Include(o => o.Status)
        //        .Include(o => o.Department)
        //        .Select(o => new OutWardDtoForAll
        //        {
        //            // IMPORTANT: include the key so the client can locate records
        //            OutWardId = o.OutWardId,

        //            ItemId = o.ItemId,
        //            ItemName = o.Item.ItemName,
        //            ContractorId = o.ContractorId,
        //            ContractorName = o.Contractor.ContractorName,
        //            //UserId = o.UserId,
        //            //PersonName = o.User.PersonName,
        //            OperatorId = o.OperatorId,
        //            OperatorName = o.Operators.OperatorName,
        //            StatusId = o.StatusId,
        //            StatusName = o.Status.StatusName,
        //            DepartmentId = o.DepartmentId,
        //            DepartmentName = o.Department.DepartmentName,
        //            CreatedAt = o.CreatedAt,
        //            IsApproved = o.IsApproved,
        //            IsDeleted = o.IsDeleted
        //        })
        //        .ToListAsync();

        //    return Ok(result);
        //}

        // NEW: GET: api/OutWards/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<OutWardDtoForAll>> GetOutWardById(int id)
        {
            var o = await _context.OutWards
                .Where(x => x.OutWardId == id && !x.IsDeleted)
                .Include(x => x.Item)
                .Include(x => x.Contractor)
                .Include(x => x.Operators)
                .Include(x => x.Status)
                .Include(x => x.Department)
                .Select(x => new OutWardDtoForAll
                {
                    OutWardId = x.OutWardId,
                    ItemId = x.ItemId,
                    ItemName = x.Item.ItemName,
                    ContractorId = x.ContractorId,
                    ContractorName = x.Contractor.ContractorName,
                    OperatorId = x.OperatorId,
                    OperatorName = x.Operators.OperatorName,
                    //UserId = x.UserId,
                    //PersonName = x.User.PersonName,
                    StatusId = x.StatusId,
                    StatusName = x.Status.StatusName,
                    DepartmentId = x.DepartmentId,
                    DepartmentName = x.Department.DepartmentName,
                    CreatedAt = x.CreatedAt,
                    IsApproved = x.IsApproved,
                    IsDeleted = x.IsDeleted
                })
                .FirstOrDefaultAsync();

            if (o == null) return NotFound("OutWard not found.");
            return Ok(o);
        }

        // OutWardsController.cs
        [HttpGet("PendingForInward")]
        public async Task<IActionResult> GetPendingForInward(int pageNumber = 1, int pageSize = 10)
        {
            // OutWards that do NOT have any non-deleted SecondInWard yet
            var baseQuery =
                from o in _context.OutWards
                where !o.IsDeleted
                      && !_context.SecondInWard.Any(si => !si.IsDeleted && si.OutWardId == o.OutWardId)
                orderby o.CreatedAt descending
                select new
                {
                    o.OutWardId,
                    ItemName = o.Item.ItemName,
                    ContractorName = o.Contractor.ContractorName,
                    OperatorName = o.Operators.OperatorName,
                    DepartmentName = o.Department.DepartmentName,
                    StatusName = o.Status.StatusName,
                    CreatedAt = o.CreatedAt
                };

            var total = await baseQuery.CountAsync();

            var items = await baseQuery
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new { totalItems = total, items });
        }



        // POST: api/OutWards
        [HttpPost]
        public async Task<ActionResult> CreateOutWard([FromBody] OutWardCreateDto dto)
        {
            
            var model = new OutWards
            {
                ItemId = dto.ItemId,
                ContractorId = dto.ContractorId,
                OperatorId = dto.OperatorId,
                //UserId = dto.UserId,
                StatusId = 2,
                DepartmentId = dto.DepartmentId,
                CreatedAt = DateTime.UtcNow,
                IsApproved = dto.IsApproved,
                IsDeleted = false
            };

            _context.OutWards.Add(model);
            await _context.SaveChangesAsync();

            return Ok("OutWard created successfully.");
        }

        // PUT: api/OutWards/5
        [HttpPut("{id:int}")]
        public async Task<ActionResult> UpdateOutWard(int id, [FromBody] OutWardDtoForAll dto)
        {
            var existing = await _context.OutWards.FirstOrDefaultAsync(o => o.OutWardId == id && !o.IsDeleted);
            if (existing == null) return NotFound("OutWard not found.");

            existing.ItemId = dto.ItemId;
            existing.ContractorId = dto.ContractorId;
            existing.OperatorId = dto.OperatorId;
            //existing.UserId = dto.UserId;
            existing.StatusId = dto.StatusId;
            existing.DepartmentId = dto.DepartmentId;
            existing.IsApproved = dto.IsApproved;

            await _context.SaveChangesAsync();
            return Ok("OutWard updated successfully.");
        }

        // DELETE: api/OutWards/5
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteOutWard(int id)
        {
            var record = await _context.OutWards.FirstOrDefaultAsync(o => o.OutWardId == id && !o.IsDeleted);
            if (record == null) return NotFound("OutWard not found.");

            record.IsDeleted = true;
            await _context.SaveChangesAsync();

            return Ok("OutWard deleted successfully.");
        }
    }
}
