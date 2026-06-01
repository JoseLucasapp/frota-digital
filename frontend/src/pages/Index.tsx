import { useState } from "react";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  Car,
  CheckCircle,
  FileText,
  Fuel,
  LockKeyhole,
  MapPin,
  Menu,
  Shield,
  Users,
  Wrench,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const navLinks = [
  { label: "Recursos", href: "#recursos" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Para quem é", href: "#perfis" },
  { label: "Segurança", href: "#seguranca" },
];

const painPoints = [
  "Registros manuais de abastecimento",
  "Falta de histórico de manutenção",
  "Documentos vencidos sem alerta",
  "Dificuldade para saber onde está cada veículo",
  "Pouca transparência operacional",
  "Relatórios demorados ou incompletos",
];

const features: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: "Gestão de veículos",
    description: "Cadastro completo, documentos, status, histórico e visão centralizada da frota.",
    icon: Car,
  },
  {
    title: "Motoristas",
    description: "Vínculo com veículos, registros de uso, documentos e acesso próprio para operação.",
    icon: Users,
  },
  {
    title: "Oficinas e mecânicos",
    description: "Ordens de serviço, atualização de status, custos e envio de comprovantes.",
    icon: Wrench,
  },
  {
    title: "Abastecimentos",
    description: "Controle por veículo, quilometragem, litros, valor, posto e comprovantes.",
    icon: Fuel,
  },
  {
    title: "Manutenções",
    description: "Histórico completo, prioridade, acompanhamento, custos e rastreabilidade.",
    icon: FileText,
  },
  {
    title: "Rastreamento",
    description: "Última localização, histórico de movimentação e status operacional dos veículos.",
    icon: MapPin,
  },
  {
    title: "Empréstimos de veículos",
    description: "Cessão, devolução, responsável, período de uso e controle de disponibilidade.",
    icon: Building2,
  },
  {
    title: "Relatórios",
    description: "Visão de gastos, consumo, manutenção, operação e exportações para análise.",
    icon: BarChart3,
  },
];

const steps = [
  "Cadastre sua instituição e usuários",
  "Adicione veículos, motoristas e oficinas",
  "Registre abastecimentos, manutenções e movimentações",
  "Acompanhe tudo pelo painel e relatórios",
];

const profiles: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: "Administrador",
    description: "Controle total da frota, usuários, relatórios, notificações e operações.",
    icon: Shield,
  },
  {
    title: "Motorista",
    description: "Registra abastecimentos, envia comprovantes, reporta problemas e acompanha o veículo atribuído.",
    icon: Car,
  },
  {
    title: "Mecânico/Oficina",
    description: "Recebe manutenções, atualiza status, informa custos e envia notas ou comprovantes.",
    icon: Wrench,
  },
];

const securityItems = [
  "Controle de acesso por perfil",
  "Separação de dados por instituição",
  "Logs e auditoria das operações",
  "Upload seguro de documentos",
];

const benefits = [
  "Menos retrabalho operacional",
  "Mais transparência nos gastos",
  "Histórico centralizado da frota",
  "Decisões com dados reais",
  "Redução de falhas por documentos vencidos",
  "Melhor comunicação entre gestão, motoristas e oficinas",
];

const metrics = [
  { label: "Veículos ativos", value: "128", icon: Car },
  { label: "Motoristas", value: "74", icon: Users },
  { label: "Combustível no mês", value: "R$ 42,8 mil", icon: Fuel },
  { label: "Manutenções pendentes", value: "12", icon: Wrench },
];

const Index = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(252_100%_65%/0.18),transparent_34%),radial-gradient(circle_at_80%_20%,hsl(280_80%_55%/0.16),transparent_30%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--secondary)))]" />

      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="Página inicial do Frota Digital">
            <img src="/logo.png" alt="Logo Frota Digital" className="h-11 w-11 rounded-xl object-contain shadow-sm" />
            <span className="text-lg font-bold tracking-tight text-foreground">Frota Digital</span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Navegação principal">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <Button asChild variant="ghost">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild className="gradient-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-95">
              <Link to="/admin-login">Acesso Admin</Link>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            aria-controls="mobile-menu"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {isMobileMenuOpen && (
          <div id="mobile-menu" className="border-t border-border/60 bg-background/95 px-4 pb-5 pt-3 shadow-lg backdrop-blur-xl sm:hidden">
            <nav className="flex flex-col gap-1" aria-label="Navegação mobile">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="mailto:support@frota-digital.online"
                className="rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                onClick={closeMobileMenu}
              >
                Contato: support@frota-digital.online
              </a>
            </nav>

            <div className="mt-4 grid gap-3">
              <Button asChild variant="outline" className="h-11 rounded-xl" onClick={closeMobileMenu}>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild className="gradient-primary h-11 rounded-xl text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-95" onClick={closeMobileMenu}>
                <Link to="/admin-login">Acesso Admin</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      <section className="relative px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <Bell className="h-4 w-4" />
              Gestão inteligente para frotas modernas
            </div>

            <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Gestão de frotas pública e empresarial em <span className="text-gradient">um só lugar</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Controle veículos, motoristas, abastecimentos, manutenções, rastreamento e relatórios com uma plataforma simples,
              segura e feita para operação real.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gradient-primary h-12 rounded-xl px-7 text-base text-primary-foreground glow-primary hover:opacity-95">
                <Link to="/login">
                  Acessar plataforma
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-xl px-7 text-base">
                <Link to="/admin-login">Entrar como administrador</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-primary/20 blur-3xl" />
            <Card className="glass-card overflow-hidden rounded-3xl">
              <CardContent className="p-6 sm:p-8">
                <div className="mb-7 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Painel operacional</p>
                    <h2 className="text-2xl font-bold">Resumo da frota</h2>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {metrics.map((metric) => {
                    const Icon = metric.icon;

                    return (
                      <div key={metric.label} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{metric.label}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-2xl border border-border/70 bg-background/70 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="font-semibold">Alertas recentes</p>
                    <span className="rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning">Atenção</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 rounded-full bg-primary/20">
                      <div className="h-2 w-4/5 rounded-full gradient-primary" />
                    </div>
                    <div className="h-2 rounded-full bg-primary/15">
                      <div className="h-2 w-3/5 rounded-full gradient-primary" />
                    </div>
                    <div className="h-2 rounded-full bg-primary/10">
                      <div className="h-2 w-2/5 rounded-full gradient-primary" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Chega de planilhas, papéis e controle espalhado</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              O Frota Digital centraliza a rotina da operação e reduz falhas comuns na gestão veicular.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {painPoints.map((item) => (
              <Card key={item} className="glass-card rounded-2xl">
                <CardContent className="flex items-start gap-3 p-5">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="font-medium text-foreground">{item}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="recursos" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Recursos</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Tudo que a operação precisa para controlar a frota</h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card key={feature.title} className="glass-card group rounded-2xl transition-transform hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-border/60 bg-card/70 p-6 shadow-xl backdrop-blur-xl sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Como funciona</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Da implantação ao acompanhamento diário</h2>
              <p className="mt-4 text-muted-foreground">
                Um fluxo simples para organizar usuários, frota, registros e indicadores sem depender de planilhas soltas.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {steps.map((step, index) => (
                <div key={step} className="rounded-2xl border border-border/70 bg-background/70 p-5">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <p className="font-semibold text-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="perfis" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Para quem é</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Cada perfil com o acesso certo</h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {profiles.map((profile) => {
              const Icon = profile.icon;

              return (
                <Card key={profile.title} className="glass-card rounded-2xl">
                  <CardContent className="p-7">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold">{profile.title}</h3>
                    <p className="mt-3 leading-7 text-muted-foreground">{profile.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="seguranca" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Segurança</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Confiabilidade para dados sensíveis da operação</h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Controle por perfil, separação de informações por instituição e rastreabilidade para tornar a gestão mais segura e auditável.
            </p>
          </div>

          <Card className="glass-card rounded-3xl">
            <CardContent className="p-7">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary text-primary-foreground">
                <LockKeyhole className="h-7 w-7" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {securityItems.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl bg-background/70 p-4">
                    <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <p className="text-sm font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Benefícios diretos para a gestão</h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur-xl">
                <CheckCircle className="h-5 w-5 shrink-0 text-success" />
                <p className="font-semibold">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-primary/20 bg-primary/10 p-8 text-center shadow-xl backdrop-blur-xl sm:p-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Pronto para digitalizar a gestão da sua frota?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Leve controle, rastreabilidade e eficiência para sua operação veicular.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gradient-primary h-12 rounded-xl px-7 text-primary-foreground hover:opacity-95">
              <Link to="/login">Entrar na plataforma</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-xl px-7">
              <Link to="/admin-login">Acesso administrativo</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo Frota Digital" className="h-10 w-10 rounded-xl object-contain" />
            <div>
              <p className="font-bold">Frota Digital</p>
              <p className="text-sm text-muted-foreground">Gestão inteligente para frotas modernas.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-muted-foreground">
            <a href="mailto:support@frota-digital.online" className="hover:text-primary">support@frota-digital.online</a>
            <Link to="/login" className="hover:text-primary">Login</Link>
            <Link to="/admin-login" className="hover:text-primary">Admin Login</Link>
            <span>© {new Date().getFullYear()} Frota Digital</span>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Index;
