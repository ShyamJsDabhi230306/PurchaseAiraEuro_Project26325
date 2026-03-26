using Microsoft.AspNetCore.Mvc;
using PurchaseTeamAira.Database;
using PurchaseTeamAira.Models.AllDto;
using PurchaseTeamAira.Models.Entities;

namespace PurchaseTeamAira.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LoginController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public IActionResult Login([FromBody] LoginDto loginDto)
        {
            if (string.IsNullOrWhiteSpace(loginDto.UserName) || string.IsNullOrWhiteSpace(loginDto.PassWord))
            {
                return BadRequest(new { message = "Username and password are required." });
            }

            var normalizedUsername = loginDto.UserName.Trim().ToLower();
            var inputPassword = loginDto.PassWord.Trim(); // case-sensitive match

            var user = _context.Users.FirstOrDefault(u =>
                u.UserName.ToLower() == normalizedUsername &&
                u.Password == inputPassword
            );

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid username or password." });
            }

            return Ok(new
            {
                message = "Login successful!",
                user = new
                {
                    user.UserId,
                    user.UserName,
                }
            });
        }
    }
}
