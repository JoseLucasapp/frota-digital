# 🟣 Frota Digital

> Sistema inteligente de gestão de frotas para Prefeituras e Empresas.

O **Frota Digital** é uma plataforma web moderna para administração completa de frotas veiculares, permitindo controle de veículos, motoristas, oficinas, abastecimentos, manutenções e rastreamento em tempo real.

Desenvolvido com foco em **usabilidade, simplicidade e eficiência operacional**, o sistema foi projetado para atender usuários com diferentes níveis de experiência digital.

---

## 🚀 Visão Geral

O Frota Digital resolve problemas comuns na gestão de frotas:

* Registros manuais em papel
* Falta de controle sobre abastecimentos
* Manutenção desorganizada
* Documentos vencidos
* Dificuldade de rastreamento
* Falta de transparência operacional

---

## 👥 Tipos de Usuários

### 🔹 Super Admin

Administra toda a plataforma:

* Criação de prefeituras/empresas
* Controle de planos
* Monitoramento global
* Logs e auditoria

### 🔹 Admin Institucional (Prefeitura/Empresa)

* Cadastro de veículos
* Cadastro de motoristas
* Aprovação de oficinas
* Gestão de abastecimentos
* Gestão de manutenções
* Relatórios operacionais

### 🔹 Mecânico / Oficina

* Recebe ordens de serviço
* Atualiza status de manutenção
* Registra custos e peças
* Envia notas fiscais

### 🔹 Motorista

* Registra abastecimentos
* Envia comprovantes
* Reporta problemas
* Visualiza veículo atribuído

---

## 🧩 Funcionalidades

### 🚗 Gestão de Veículos

* Cadastro completo
* Upload de documentos (CRLV, seguro, etc.)
* Alertas de vencimento
* Histórico de uso

### 🛢️ Controle de Abastecimentos

* Registro de combustível
* Upload de comprovantes
* Controle de consumo médio
* Detecção de inconsistências

### 🔧 Manutenção

* Ordem de serviço
* Custos estimados e finais
* Upload de notas fiscais
* Histórico por veículo

### 📍 Rastreamento em Tempo Real

* Visualização de veículos em mapa
* Status (em movimento, parado, desligado)
* Identificação do motorista atual
* Histórico de rotas

### 🔄 Empréstimo de Veículos

* Registro de cessão
* Checklist de devolução
* Histórico de uso por motorista

### 📊 Relatórios

* Gastos por período
* Consumo por km
* Custos por motorista
* Exportação CSV/PDF

### 🔔 Notificações Inteligentes

* Documento vencendo
* Manutenção preventiva
* Pendências operacionais
* Veículo parado tempo excessivo

---

## 🎨 Interface

* Design moderno em tons de roxo
* Modo escuro padrão
* Interface minimalista
* Mobile-first
* Totalmente responsivo
* Tipografia: Inter / Roboto
* Foco em acessibilidade (textos maiores, alto contraste)

---

## 🏗️ Estrutura do Projeto

```
/src
 ├── components
 ├── pages
 ├── services
 ├── hooks
 ├── utils
 ├── types
 ├── contexts
 └── assets
```

---

## 🧱 Modelagem de Dados

Principais entidades:

* User
* Institution
* Vehicle
* DriverDocument
* VehicleDocument
* FuelLog
* WorkOrder
* GPSData
* Loan
* Notification
* Attachment

---

## 📦 Tecnologias (exemplo)

* Frontend: React / Next.js
* Backend: Node.js
* Banco: PostgreSQL
* Auth: JWT / OAuth
* Mapas: API de mapas
* Upload: Storage cloud
* Deploy: Vercel / Cloud

*(Ajustar conforme stack real.)*

---

## 🔐 Segurança

* Autenticação baseada em roles
* Separação de dados por instituição (multi-tenant)
* Logs de auditoria
* Controle de permissões

---

## 📱 Responsividade

Compatível com:

* Desktop
* Tablet
* Mobile

---

## 🛣️ Roadmap Futuro

* IA para previsão de manutenção
* Controle de pneus
* Gestão de multas
* Integração com cartões de combustível
* Aplicativo mobile dedicado
* Telemetria avançada

---

## 📄 Licença

Projeto proprietário — Todos os direitos reservados.

---

## ✨ Frota Digital

**Gestão inteligente para frotas modernas.**