using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PurchaseTeamAira.Database;
using PurchaseTeamAira.Migrations;
using PurchaseTeamAira.Models.AllDto.InwardOutwardRepoDto;
using PurchaseTeamAira.Models.AllDto.SecondInWard;
using PurchaseTeamAira.Models.Entities;

namespace PurchaseTeamAira.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SecondInWardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SecondInWardController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ---------------------------------------------------------
        // NEW: Base GET so /api/SecondInWard works (no 405)
        // Optional paging params; returns a simple list (non-paged)
        // ---------------------------------------------------------
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SecondInWarddto>>> Get()
        {
            var list = await _context.SecondInWard
                .Where(s => !s.IsDeleted)
                .Include(s => s.OutWard).ThenInclude(o => o.Item)
                .Include(s => s.OutWard).ThenInclude(o => o.Contractor)
                .Include(s => s.OutWard).ThenInclude(o => o.Operators)
                .Include(s => s.OutWard).ThenInclude(o => o.Department)
                .Include(s => s.Status) // << IMPORTANT: pull Status from SecondInWard.Status
                .Select(s => new SecondInWarddto
                {
                    SecondInwardId = s.SecondInwardId,
                    OutWardId = s.OutWardId,
                    ItemId = s.OutWard.ItemId,
                    ItemName = s.OutWard.Item.ItemName,
                    ContractorId = s.OutWard.ContractorId,
                    ContractorName = s.OutWard.Contractor.ContractorName,
                    OperatorId = s.OutWard.OperatorId,
                    OperatorName = s.OutWard.Operators.OperatorName,
                    StatusId = s.StatusId,              // << from SecondInWard
                    StatusName = s.Status.StatusName,   // << from SecondInWard
                    DepartmentId = s.OutWard.DepartmentId,
                    DepartmentName = s.OutWard.Department.DepartmentName,
                    CreatedAt = s.CreatedAt,
                    IsApproved = s.IsApproved,
                    IsDeleted = s.IsDeleted
                })
                .ToListAsync();

            return Ok(list);
        }

        // ---------------------------------------------------------
        // Your existing paged endpoint kept as-is
        // ---------------------------------------------------------
        [HttpGet("GetAll")]
        public async Task<ActionResult<PagedResult<SecondInWarddto>>> GetAll(
            int pageNumber = 1,
            int pageSize = 10)
        {
            var query = _context.SecondInWard
                .Where(s => !s.IsDeleted)
                .Select(s => new SecondInWarddto
                {
                    SecondInwardId = s.SecondInwardId,
                    OutWardId = s.OutWardId,
                    ItemId = s.OutWard.ItemId,
                    ItemName = s.OutWard.Item.ItemName,
                    ContractorId = s.OutWard.ContractorId,
                    ContractorName = s.OutWard.Contractor.ContractorName,
                    OperatorId = s.OutWard.OperatorId,
                    OperatorName = s.OutWard.Operators.OperatorName,
                    StatusId = s.StatusId,               // << from SecondInWard
                    StatusName = s.Status.StatusName,    // << from SecondInWard
                    DepartmentId = s.OutWard.DepartmentId,
                    DepartmentName = s.OutWard.Department.DepartmentName,
                    CreatedAt = s.CreatedAt,
                    IsApproved = s.IsApproved,
                    IsDeleted = s.IsDeleted
                });

            var pagedResult = await PaginationHelper.PaginateAsync(query, pageNumber, pageSize);
            return Ok(pagedResult);
        }

        // ---------------------------------------------------------
        // Helper for UI: OutWardIds that already have SecondInWard
        // GET /api/SecondInWard/existing-outward-ids
        // ---------------------------------------------------------
        [HttpGet("existing-outward-ids")]
        public async Task<ActionResult<IEnumerable<int>>> GetExistingOutWardIds()
        {
            var ids = await _context.SecondInWard
                .Where(s => !s.IsDeleted)
                .Select(s => s.OutWardId)
                .Distinct()
                .ToListAsync();

            return Ok(ids);
        }

        // ---------------------------------------------------------
        // Items used in any OutWard (kept)
        // ---------------------------------------------------------
        [HttpGet("Items")]
        public async Task<ActionResult<IEnumerable<ItemDto>>> GetItemsUsedInOutward()
        {
            var itemList = await _context.OutWards
                .Where(o => !o.IsDeleted)
                .Select(o => new
                {
                    o.Item.Id,
                    o.Item.ItemName
                })
                .Distinct()
                .ToListAsync();

            var items = itemList
                .Select(i => new ItemDto
                {
                    ItemId = i.Id,
                    ItemName = i.ItemName
                })
                .ToList();

            return Ok(items);
        }

        // ---------------------------------------------------------
        // GET by id
        // NOTE: Project Status from SecondInWard.Status, not OutWard.Status
        // ---------------------------------------------------------
        [HttpGet("{id}")]
        public async Task<ActionResult<SecondInWarddto>> GetById(int id)
        {
            var s = await _context.SecondInWard
                .Include(s => s.OutWard).ThenInclude(o => o.Item)
                .Include(s => s.OutWard).ThenInclude(o => o.Contractor)
                .Include(s => s.OutWard).ThenInclude(o => o.Operators)
                .Include(s => s.OutWard).ThenInclude(o => o.Department)
                .Include(s => s.Status)
                .FirstOrDefaultAsync(s => s.SecondInwardId == id && !s.IsDeleted);

            if (s == null)
                return NotFound();

            var dto = new SecondInWarddto
            {
                SecondInwardId = s.SecondInwardId,
                OutWardId = s.OutWardId,
                ItemId = s.OutWard?.Item?.Id ?? 0,
                ItemName = s.OutWard?.Item?.ItemName ?? "N/A",
                ContractorId = s.OutWard?.ContractorId ?? 0,
                ContractorName = s.OutWard?.Contractor?.ContractorName ?? "N/A",
                OperatorId = s.OutWard?.OperatorId ?? 0,
                OperatorName = s.OutWard?.Operators?.OperatorName ?? "N/A",
                StatusId = s.StatusId,                 // << from SecondInWard
                StatusName = s.Status?.StatusName ?? "N/A",
                DepartmentId = s.OutWard?.DepartmentId ?? 0,
                DepartmentName = s.OutWard?.Department?.DepartmentName ?? "N/A",
                CreatedAt = s.CreatedAt,
                IsApproved = s.IsApproved,
                IsDeleted = s.IsDeleted
            };

            return Ok(dto);
        }

        // ---------------------------------------------------------
        // POST (Create)
        // - set SecondInWard.StatusId
        // - mirror to OutWard.StatusId
        // ---------------------------------------------------------
        [HttpPost]
        public async Task<ActionResult<SecondInWard>> Create(SecondInWarddto dto)
        {
            var outward = await _context.OutWards.FindAsync(dto.OutWardId);
            if (outward == null) return BadRequest("OutWard not found");

            var entity = new SecondInWard
            {
                OutWardId = dto.OutWardId,
                StatusId = dto.StatusId,         // keep in SecondInWard
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false,
                IsApproved = dto.IsApproved
            };

            await _context.SecondInWard.AddAsync(entity);

            var item = await _context.Items.FindAsync(entity.OutWard.ItemId);
            if (item == null) return BadRequest("Item not found");
            var status = await _context.Status.FindAsync(entity.StatusId);

            // mirror to outward
            outward.StatusId = dto.StatusId;
            if(status != null &&(status.StatusName == "Missing" || status.StatusName == "Forgot"))
            {
                item.ItemStatusId = status.StatusName == "Missing"? 2 : 3;
            }

            await _context.SaveChangesAsync();

            // return full dto
            var created = await _context.SecondInWard
                .Include(s => s.OutWard).ThenInclude(o => o.Item)
                .Include(s => s.OutWard).ThenInclude(o => o.Contractor)
                .Include(s => s.OutWard).ThenInclude(o => o.Operators)
                .Include(s => s.OutWard).ThenInclude(o => o.Department)
                .Include(s => s.Status)
                .Where(s => s.SecondInwardId == entity.SecondInwardId)
                .Select(s => new SecondInWarddto
                {
                    SecondInwardId = s.SecondInwardId,
                    OutWardId = s.OutWardId,
                    ItemId = s.OutWard.ItemId,
                    ItemName = s.OutWard.Item.ItemName,
                    ContractorId = s.OutWard.ContractorId,
                    ContractorName = s.OutWard.Contractor.ContractorName,
                    OperatorId = s.OutWard.OperatorId,
                    OperatorName = s.OutWard.Operators.OperatorName,
                    StatusId = s.StatusId,
                    StatusName = s.Status.StatusName,
                    DepartmentId = s.OutWard.DepartmentId,
                    DepartmentName = s.OutWard.Department.DepartmentName,
                    CreatedAt = s.CreatedAt,
                    IsApproved = s.IsApproved,
                    IsDeleted = s.IsDeleted
                })
                .FirstAsync();

            return CreatedAtAction(nameof(GetById), new { id = created.SecondInwardId }, created);
        }

        // ---------------------------------------------------------
        // PUT (Update)
        // - DO NOT allow changing OutWard (locks item as per UX)
        // - Update SecondInWard.StatusId and mirror to OutWard.StatusId
        // ---------------------------------------------------------
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, SecondInWarddto dto)
        {
            if (id != dto.SecondInwardId) return BadRequest("Mismatch id");

            var entity = await _context.SecondInWard
                .Include(s => s.OutWard)
                .FirstOrDefaultAsync(s => s.SecondInwardId == id);

            if (entity == null || entity.IsDeleted) return NotFound();

            // lock OutWard: forbid changing item
            if (dto.OutWardId != entity.OutWardId)
                return BadRequest("OutWard cannot be changed for an existing SecondInWard");

            // update status in SecondInWard
            entity.StatusId = dto.StatusId;
            entity.IsApproved = dto.IsApproved;

            // mirror to outward
            if (entity.OutWard != null)
            {
                entity.OutWard.StatusId = dto.StatusId;
                _context.Entry(entity.OutWard).State = EntityState.Modified;
            }

            _context.Entry(entity).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ---------------------------------------------------------
        // DELETE (Soft)
        // ---------------------------------------------------------
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.SecondInWard.FindAsync(id);
            if (entity == null || entity.IsDeleted)
                return NotFound();

            entity.IsDeleted = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ---------------------------------------------------------
        // Inward/Outward unified report (kept, minor tidy)
        // ---------------------------------------------------------
        [HttpGet("InwardOutwardReport")]
        public async Task<ActionResult<IEnumerable<InwardOutwardReportDto>>> GetInwardOutwardReport()
        {
            var reportData = await (
                from OutWards in _context.OutWards join Second
                in _context.SecondInWard on  OutWards.OutWardId equals Second.OutWardId
                 into outwardSecond from Second in outwardSecond.DefaultIfEmpty()
                 select new InwardOutwardReportDto
                 {
                     OutwardId = OutWards.OutWardId,
                     OutwardDate = OutWards.CreatedAt,  
                     ItemName = OutWards.Item.ItemName,
                     ContractorName = OutWards.Contractor.ContractorName,
                     OperatorName = OutWards.Operators.OperatorName,
                     Department = OutWards.Department.DepartmentName,
                     StatusName = OutWards.Status.StatusName,

                     //SecondInwardWard data 
                     SecondInwardId  = Second != null ? Second.OutWardId : (int?)null,
                     InwardDate  = Second != null ? Second.CreatedAt : (DateTime?)null,
                     SecondInWardStatus  = Second != null ? Second.StatusId : (int?)null,


                     
                 }).ToListAsync();

                    return Ok(reportData);


            //var inwardData = await _context.OutWards
            //    .Include(o => o.Item)
            //    .Include(o => o.Contractor)
            //    .Include(o => o.Operators)
            //    .Include(o => o.Status)
            //    .Include(o => o.Department)
            //    .Include(o => o.SecondInwards)
            //    .ToListAsync();

            //var reportData = inwardData.Select(i => new InwardOutwardReportDto
            //{
            //    InwardDate = i.SecondInwards.,
            //    ItemName = i.Item?.ItemName,
            //    OutwardId = i.OutWardId,
            //    OutwardDate = i.CreatedAt,
            //    ContractorName = i.Contractor?.ContractorName,
            //    OperatorName = i.Operators?.OperatorName,
            //    Department = i.Department?.DepartmentName,
            //    StatusName = i.Status?.StatusName, // for the report it’s fine to show OutWard status name (mirrored)
            //}).ToList();

            //return Ok(reportData);
        }
    }
}
