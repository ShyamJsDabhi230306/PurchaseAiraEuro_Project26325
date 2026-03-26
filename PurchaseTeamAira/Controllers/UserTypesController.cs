using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PurchaseTeamAira.Database;
using PurchaseTeamAira.Models.AllDto;
using PurchaseTeamAira.Models.Entities;

namespace PurchaseTeamAira.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserTypesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserTypesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/usertypes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserTypeDto>>> GetUserTypes()
        {
            var userTypes = await _context.UserTypes
                .Select(ut => new UserTypeDto
                {
                    UserTypeId = ut.Id,
                    TypeName = ut.TypeName
                })
                .ToListAsync();

            return Ok(userTypes);
        }

        // GET: api/usertypes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserTypeDto>> GetUserType(int id)
        {
            var userType = await _context.UserTypes.FindAsync(id);

            if (userType == null)
            {
                return NotFound();
            }

            var dto = new UserTypeDto
            {
                UserTypeId = userType.Id,
                TypeName = userType.TypeName
            };

            return Ok(dto);
        }

        // POST: api/usertypes
        [HttpPost]
        public async Task<ActionResult<UserTypeDto>> CreateUserType(UserTypeDto userTypeDto)
        {
            if (string.IsNullOrWhiteSpace(userTypeDto.TypeName))
            {
                return BadRequest("TypeName is required.");
            }

            var userType = new UserType
            {
                TypeName = userTypeDto.TypeName
            };

            _context.UserTypes.Add(userType);
            await _context.SaveChangesAsync();

            userTypeDto.UserTypeId = userType.Id;

            return CreatedAtAction(nameof(GetUserType), new { id = userType.Id }, userTypeDto);
        }

        // PUT: api/usertypes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUserType(int id, UserTypeDto userTypeDto)
        {
            if (id != userTypeDto.UserTypeId)
            {
                return BadRequest("ID mismatch.");
            }

            var userType = await _context.UserTypes.FindAsync(id);
            if (userType == null)
            {
                return NotFound();
            }

            userType.TypeName = userTypeDto.TypeName;

            _context.Entry(userType).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException) when (!_context.UserTypes.Any(e => e.Id == id))
            {
                return NotFound();
            }

            return NoContent();
        }

        // DELETE: api/usertypes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUserType(int id)
        {
            var userType = await _context.UserTypes.FindAsync(id);
            if (userType == null)
            {
                return NotFound();
            }

            _context.UserTypes.Remove(userType);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
