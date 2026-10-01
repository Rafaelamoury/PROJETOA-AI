using Acai.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Acai.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<CaixaConfig> CaixaConfigs => Set<CaixaConfig>();
    public DbSet<Lancamento> Lancamentos => Set<Lancamento>();
    public DbSet<ServicoMaoObra> ServicosMaoObra => Set<ServicoMaoObra>();
    public DbSet<Produto> Produtos => Set<Produto>();
    public DbSet<ProducaoMensal> ProducoesMensais => Set<ProducaoMensal>();
    public DbSet<RetiradaCasa> RetiradasCasa => Set<RetiradaCasa>();
    public DbSet<EstoquePlantas> EstoquesPlantas => Set<EstoquePlantas>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<AtividadePlanejamento> AtividadesPlanejamento => Set<AtividadePlanejamento>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CaixaConfig>().Property(x => x.SaldoInicial).HasPrecision(18, 2);
        modelBuilder.Entity<ServicoMaoObra>().Property(x => x.Valor).HasPrecision(18, 2);
        modelBuilder.Entity<Produto>().Property(x => x.Valor).HasPrecision(18, 2);
        modelBuilder.Entity<Lancamento>().Property(x => x.Valor).HasPrecision(18, 2);
        modelBuilder.Entity<ProducaoMensal>().Property(x => x.QuantidadeLatas).HasPrecision(18, 2);
        modelBuilder.Entity<ProducaoMensal>().Property(x => x.ValorLata).HasPrecision(18, 2);
        modelBuilder.Entity<ProducaoMensal>().Property(x => x.CustosExtracao).HasPrecision(18, 2);
        modelBuilder.Entity<RetiradaCasa>().Property(x => x.Quantidade).HasPrecision(18, 2);
        modelBuilder.Entity<RetiradaCasa>().ToTable("RetiradasCasa");
        modelBuilder.Entity<ProducaoMensal>().Ignore(x => x.ValorProducao);
        modelBuilder.Entity<ProducaoMensal>().Ignore(x => x.CustoPorLata);
        modelBuilder.Entity<ProducaoMensal>().Ignore(x => x.ValorBruto);
        modelBuilder.Entity<ProducaoMensal>().Ignore(x => x.ValorLiquido);
        modelBuilder.Entity<Lancamento>()
            .HasOne(l => l.ProducaoMensal)
            .WithMany()
            .HasForeignKey(l => l.ProducaoMensalId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Usuario>().HasIndex(x => x.Cpf).IsUnique();
        modelBuilder.Entity<AtividadePlanejamento>().ToTable("AtividadesPlanejamento");
    }
}
