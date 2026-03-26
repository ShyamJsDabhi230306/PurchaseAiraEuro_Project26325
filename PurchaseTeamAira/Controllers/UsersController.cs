using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PurchaseTeamAira.Database;
using PurchaseTeamAira.Models.AllDto;
using PurchaseTeamAira.Models.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PurchaseTeamAira.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }


        [HttpGet]
        public async Task<ActionResult> GetUsers(int pageNumber = 1, int pageSize = 10)
        {
            var query = _context.Users
                .Where(u => !u.IsDeleted)
                .Select(u => new UserDto
                {
                    Id = u.UserId,
                    PersonName = u.PersonName,
                    UserName = u.UserName,
                    AllowLogin = u.AllowLogin,
                    UserContact = u.UserContact,
                    CreatedAt = u.CreatedAt,
                    IsApproved = u.IsApproved,
                    IsDeleted = u.IsDeleted,
                    CompanyId = u.CompanyId,
                    CompanyName = u.Company != null ? u.Company.CompanyName : null,
                    UserTypeId = u.UserTypeId,
                    UserTypeName = u.UserType != null ? u.UserType.TypeName : null
                });

            var pagedResult = await PaginationHelper.PaginateAsync(query, pageNumber, pageSize);

            return Ok(pagedResult);
        }

        // GET: api/Users
        //[HttpGet]
        //public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        //{
        //    var users = await _context.Users
        //        .Include(u => u.UserType)
        //        .Include(u => u.Company)
        //        .Where(u => !u.IsDeleted)
        //        .Select(u => new UserDto
        //        {
        //            Id = u.UserId,
        //            PersonName = u.PersonName,
        //            UserName = u.UserName,
        //            AllowLogin = u.AllowLogin,
        //            UserContact = u.UserContact,
        //            CreatedAt = u.CreatedAt,
        //            IsApproved = u.IsApproved,
        //            IsDeleted = u.IsDeleted,
        //            CompanyId = u.CompanyId,
        //            CompanyName = u.Company.CompanyName,  // assuming Company has Name
        //            UserTypeId = u.UserTypeId,
        //            UserTypeName = u.UserType.TypeName
        //        })
        //        .ToListAsync();

        //    return Ok(users);
        //}

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.UserType)
                .Include(u => u.Company)
                .Where(u => u.UserId == id && !u.IsDeleted)
                .Select(u => new UserDto
                {
                    Id = u.UserId,
                    PersonName = u.PersonName,
                    UserName = u.UserName,
                    AllowLogin = u.AllowLogin,
                    UserContact = u.UserContact,
                    CreatedAt = u.CreatedAt,
                    IsApproved = u.IsApproved,
                    IsDeleted = u.IsDeleted,
                    CompanyId = u.CompanyId,
                    CompanyName = u.Company.CompanyName,
                    UserTypeId = u.UserTypeId,
                    UserTypeName = u.UserType.TypeName
                })
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound();

            return Ok(user);
        }

        // POST: api/Users
        [HttpPost]
        public async Task<ActionResult<UserDto>> CreateUser(CreateUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = new User
            {
                PersonName = dto.PersonName,
                UserName = dto.UserName,
                Password = dto.Password, // In production, hash passwords!
                AllowLogin = dto.AllowLogin,
                UserContact = dto.UserContact,
                CreatedAt = DateTime.UtcNow,
                IsApproved = dto.IsApproved,
                IsDeleted = dto.IsDeleted,
                CompanyId = dto.CompanyId,
                UserTypeId = dto.UserTypeId
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            await AllowPermissionForPages(user.UserId);

            // Load navigation properties for response
            await _context.Entry(user).Reference(u => u.UserType).LoadAsync();
            await _context.Entry(user).Reference(u => u.Company).LoadAsync();

            var responseDto = new UserDto
            {
                Id = user.UserId,
                PersonName = user.PersonName,
                UserName = user.UserName,
                AllowLogin = user.AllowLogin,
                UserContact = user.UserContact,
                CreatedAt = user.CreatedAt,
                IsApproved = user.IsApproved,
                IsDeleted = user.IsDeleted,
                CompanyId = user.CompanyId,
                CompanyName = user.Company?.CompanyName ?? string.Empty,
                UserTypeId = user.UserTypeId,
                UserTypeName = user.UserType?.TypeName ?? string.Empty
            };

            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, responseDto);
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserDto dto)
        {
            if (id != dto.UserId)
                return BadRequest("ID mismatch.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.FindAsync(id);
            if (user == null || user.IsDeleted)
                return NotFound();

            user.PersonName = dto.PersonName;
            user.UserName = dto.UserName;

            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                user.Password = dto.Password; // In production, hash passwords!
            }

            user.AllowLogin = dto.AllowLogin;
            user.UserContact = dto.UserContact;
            user.IsApproved = dto.IsApproved;
            user.IsDeleted = dto.IsDeleted;
            user.CompanyId = dto.CompanyId;

            user.UserTypeId = dto.UserTypeId;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Users/5 (Soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null || user.IsDeleted)
                return NotFound();

            user.IsDeleted = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }
        private async Task AllowPermissionForPages(int id)
        {
            var allPages =  await _context.Pages.ToListAsync();

            foreach(var page in allPages)
            {
                await _context.PagePermissions.AddAsync(new PagePermission
                {
                    PageId = page.PageId,
                    UserId = id,
                    IsAllowed = false,
                });
            }
            await _context.SaveChangesAsync();
        }
    }

}