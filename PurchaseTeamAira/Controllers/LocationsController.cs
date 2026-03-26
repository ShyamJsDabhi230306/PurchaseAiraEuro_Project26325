using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PurchaseTeamAira.Database;
using PurchaseTeamAira.Models.AllDto;
using PurchaseTeamAira.Models.AllDto.Location;
using PurchaseTeamAira.Models.Entities;
using System;

namespace PurchaseTeamAira.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LocationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LocationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/locations
      
    [HttpGet]
    public async Task<IActionResult> GetAllLocations(int pageNumber = 1, int pageSize = 10)
    {
        var query = _context.Locations.Where(c => !c.IsDeleted);

        var pagedResult = await PaginationHelper.PaginateAsync(query, pageNumber, pageSize);

        return Ok(pagedResult);
    }
        //public async Task<ActionResult<IEnumerable<LocationDto>>> GetLocations()
        //{
        //    var locations = await _context.Locations
        //        .Select(l => new LocationDto
        //        {
        //            LocationId = l.LocationId,
        //            LocationName = l.LocationName
        //        })
        //        .ToListAsync();

        //    return Ok(locations);
        //}

        // GET: api/locations/5
        [HttpGet("{id}")]
        public async Task<ActionResult<LocationDto>> GetLocation(int id)
        {
            var location = await _context.Locations.FindAsync(id);

            if (location == null) return NotFound();

            var locationDto = new LocationDto
            {
                LocationId = location.LocationId,
                LocationName = location.LocationName
            };

            return Ok(locationDto);
        }

        // POST: api/locations
        [HttpPost]
        public async Task<ActionResult<LocationDto>> CreateLocation(CreateLocationDto createDto)
        {
            var location = new Location
            {
                LocationName = createDto.LocationName
            };

            _context.Locations.Add(location);
            await _context.SaveChangesAsync();

            var locationDto = new LocationDto
            {
                LocationId = location.LocationId,
                LocationName = location.LocationName
            };

            return CreatedAtAction(nameof(GetLocation), new { id = location.LocationId }, locationDto);
        }

        // PUT: api/locations/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLocation(int id, UpdateLocatonDto updateDto)
        {
            if (id != updateDto.LocationId)
                return BadRequest("ID mismatch");

            var location = await _context.Locations.FindAsync(id);
            if (location == null)
                return NotFound();

            location.LocationName = updateDto.LocationName;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/locations/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLocation(int id)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location == null)
                return NotFound();

            location.IsDeleted = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
