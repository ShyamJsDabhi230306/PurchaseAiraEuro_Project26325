using Microsoft.EntityFrameworkCore;

public static class PaginationHelper
{
    public static async Task<PagedResult<T>> PaginateAsync<T>(
        IQueryable<T> query,
        int pageNumber,
        int pageSize)
    {
        var totalItems = await query.CountAsync();
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<T>
        {
            Items = items,
            TotalItems = totalItems,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }
}

public class PagedResult<T>
{
    public List<T> Items { get; set; }
    public int TotalItems { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}
