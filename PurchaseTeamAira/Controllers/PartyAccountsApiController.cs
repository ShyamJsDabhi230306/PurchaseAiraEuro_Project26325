using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PurchaseTeamAira.Database;
using PurchaseTeamAira.Models;
using PurchaseTeamAira.Models.AllDto;
using PurchaseTeamAira.Models.Entities;

namespace PurchaseTeamAira.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PartyAccountsApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PartyAccountsApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/PartyAccountsApi
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PartyAccount>>> GetPartyAccounts()
        {
            return await _context.PartyAccounts.ToListAsync();
        }

        // GET: api/PartyAccountsApi/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PartyAccount>> GetPartyAccount(int id)
        {
            var partyAccount = await _context.PartyAccounts.FindAsync(id);

            if (partyAccount == null)
            {
                return NotFound();
            }

            return partyAccount;
        }

        // POST: api/PartyAccountsApi
        [HttpPost]
        public async Task<ActionResult<PartyAccount>> PostPartyAccount(PartyAccountCreateDto createDto)
        {
            var data = new PartyAccount()
            {
                PartyACName = createDto.PartyACName,
                ContactPerson = createDto.ContactPerson,
                Address  = createDto.Address,
                WhatsAppNo = createDto.WhatsAppNo,
                EmailID = createDto.EmailID,
                PANNo = createDto.PANNo,
                GSTNo = createDto.GSTNo

            };
           await _context.PartyAccounts.AddAsync(data);
            await _context.SaveChangesAsync();
            return Ok("Data Add Successfully");
        }

        // PUT: api/PartyAccountsApi/5
        [HttpPut("{id}")]
       
        public async Task<IActionResult> PutPartyAccount(int id, PartyAccountResponseDto partyAccount)
        {
            var data = await _context.PartyAccounts.FindAsync(id);
            if (data == null)
            {
                return NotFound();
            }

            data.PartyACName = partyAccount.PartyACName;
            data.ContactPerson = partyAccount.ContactPerson;
            data.Address = partyAccount.Address;
            data.WhatsAppNo = partyAccount.WhatsAppNo;
            data.EmailID = partyAccount.EmailID;
            data.PANNo = partyAccount.PANNo;
            data.GSTNo = partyAccount.GSTNo;

            _context.PartyAccounts.Update(data);
            await _context.SaveChangesAsync();
            return Ok("Update Data Successfully");
        }


        // DELETE: api/PartyAccountsApi/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePartyAccount(int id)
        {
            var partyAccount = await _context.PartyAccounts.FindAsync(id);
            if (partyAccount == null)
            {
                return NotFound();
            }

            _context.PartyAccounts.Remove(partyAccount);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        //private bool PartyAccountExists(int id)
        //{
        //    return _context.PartyAccounts.Any(e => e.Id == id);
        //}
    }
}
