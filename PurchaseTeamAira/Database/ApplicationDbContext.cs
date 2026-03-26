using Microsoft.EntityFrameworkCore;
using PurchaseTeamAira.Models.Entities;

namespace PurchaseTeamAira.Database
{
    public class ApplicationDbContext:DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
        public DbSet<Division>Divisions { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserType> UserTypes { get; set; }
        public DbSet<Item> Items { get; set; }
        public DbSet<PartyAccount> PartyAccounts { get; set; }
        public DbSet<Login> Logins { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<Location> Locations { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<UserRights> UserRights { get; set; }
        public DbSet<Contractor> Contractors { get; set; }
        public DbSet<Status>Status { get; set; }
        public DbSet<OutWards> OutWards { get; set; }
        public DbSet<InWards> InWards { get; set; }     
        public DbSet<SecondInWard> SecondInWard { get; set; }   
        public DbSet<Operator> Operators { get; set; }   
        public DbSet<StatusForItem> StatusForItems { get; set; }   
        public DbSet<Page> Pages  { get; set; }   
        public DbSet<PagePermission>PagePermissions   { get; set; }   
        
        
        public DbSet<MaterialsOutWard> MaterialsOutWard { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasOne(u => u.Company)
                .WithMany(c => c.Users)
                .HasForeignKey(u => u.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);  // or Cascade, based on your logic

            base.OnModelCreating(modelBuilder);
        }


    }
}
