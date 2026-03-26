using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PurchaseTeamAira.Database;
using PurchaseTeamAira.Models.AllDto.ItemsDtos;
using EnumProductType = PurchaseTeamAira.Models.Enum.ProductType;

namespace PurchaseTeamAira.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ItemController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ItemController(ApplicationDbContext context)
        {
            _context = context;
        }


        [HttpGet]
        public async Task<IActionResult> GetAllItems(int pageNumber = 2, int pageSize = 100)
        {
            var query = _context.Items
                .Where(i => !i.IsDeleted)
                .Include(i => i.StatusForItem)
                .Select(i => new NewDtoForItem
                {
                    Id = i.Id,
                    ProductType = (int)i.ProductType,
                    ItemName = i.ItemName,
                    ModelCode = i.ModelCode,
                    ItemStatusId = i.ItemStatusId,
                    ItemStatusName = i.StatusForItem != null ? i.StatusForItem.ItemStatusName : null,
                    Date = i.Date
                });

            var pagedResult = await PaginationHelper.PaginateAsync(query, pageNumber, pageSize);

            return Ok(pagedResult);
        }

        [HttpGet("/api/GetItemDropdown")]
        public async Task<ActionResult<IEnumerable<Item>>> GetItemDropdown()
        {
            var items = await _context.Items.Where(item =>
            item.StatusForItem.ItemStatusName == "Running"
                                    &&
                                    item.OutWards.All(o => o.Status.StatusName == "Received")).ToListAsync();

            return Ok(items);
        }

        // GET: api/Item
        //[HttpGet]
        //public async Task<ActionResult<IEnumerable<NewDtoForItem>>> GetAllItems()
        //{
        //    var items = await _context.Items
        //        .Where(i => !i.IsDeleted)
        //        .Include(i => i.StatusForItem)
        //        .ToListAsync();

        //    var dtos = items.Select(i => new NewDtoForItem
        //    {
        //        Id = i.Id,
        //        ProductType = (int)i.ProductType,
        //        ItemName = i.ItemName,
        //        ModelCode = i.ModelCode,
        //        ItemStatusId = i.ItemStatusId,
        //        ItemStatusName = i.StatusForItem?.ItemStatusName,
        //        Date = i.Date
        //    });

        //    return Ok(dtos);
        //}

        // GET: api/Item/5
        [HttpGet("{id}")]
        public async Task<ActionResult<NewDtoForItem>> GetItem(int id)
        {
            var item = await _context.Items
                .Include(i => i.StatusForItem)
                .FirstOrDefaultAsync(i => i.Id == id && !i.IsDeleted);

            if (item == null)
                return NotFound();

            var dto = new NewDtoForItem
            {
                Id = item.Id,
                ProductType = (int)item.ProductType,
                ItemName = item.ItemName,
                ModelCode = item.ModelCode,
                ItemStatusId = item.ItemStatusId,
                ItemStatusName = item.StatusForItem?.ItemStatusName,
                Date = item.Date
            };

            return Ok(dto);
        }

        // POST: api/Item
        [HttpPost]
        public async Task<ActionResult<NewDtoForItem>> CreateItem(NewDtoForItem dto)
        {
            var statusExists = await _context.StatusForItems.AnyAsync(s => s.ItemStatusId == dto.ItemStatusId && s.IsDeleted == false);

            if (!statusExists)
                return BadRequest("Invalid ItemStatusId");

            var item = new Item
            {
                ProductType = (EnumProductType)dto.ProductType,
                ItemName = dto.ItemName,
                ModelCode = dto.ModelCode,
                ItemStatusId = dto.ItemStatusId,
                Date = dto.Date,
                IsDeleted = false,
                IsApproved = false
            };

            _context.Items.Add(item);
            await _context.SaveChangesAsync();

            dto.Id = item.Id;

            return CreatedAtAction(nameof(GetItem), new { id = item.Id }, dto);
        }

        // PUT: api/Item/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateItem(int id, NewDtoForItem dto)
        {
            if (id != dto.Id)
                return BadRequest("ID mismatch");

            var item = await _context.Items.FindAsync(id);
            if (item == null || item.IsDeleted)
                return NotFound();

            item.ProductType = (EnumProductType)dto.ProductType;
            item.ItemName = dto.ItemName;
            item.ModelCode = dto.ModelCode;
            item.ItemStatusId = dto.ItemStatusId;
            item.Date = dto.Date;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Item/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            var item = await _context.Items.FindAsync(id);
            if (item == null || item.IsDeleted)
                return NotFound();

            item.IsDeleted = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
