# Documento de Arquitetura de Software (Revisão 1.1)

**Sistema de Inscrição em Creches — Censo Anual de Demanda**

**Versão:** 1.1  
**Data:** Setembro de 2026  
**Licença:** GNU General Public License (GPL)  
**Alteração principal:** Desnormalização das tabelas `responsaveis` e `criancas` para uma única tabela `inscricoes`.

---

## Sumário

1. [Introdução](#1-introdução)  
   1.1 Finalidade  
   1.2 Escopo  
   1.3 Definições e Siglas  
   1.4 Referências  
   1.5 Visão Geral do Documento

2. [Decisões Arquiteturais](#2-decisões-arquiteturais)  
   2.1 Stack Tecnológica  
   2.2 Padrão Arquitetural  
   2.3 Estrutura do Projeto  
   2.4 Camadas Lógicas

3. [Componentes do Sistema](#3-componentes-do-sistema)  
   3.1 Componentes Principais  
   3.2 Fluxo de Execução  
   3.3 Interação com Banco de Dados  
   3.4 Geração de PDF e JSON  
   3.5 Backup Automático

4. [Persistência e Modelo de Dados](#4-persistência-e-modelo-de-dados)  
   4.1 Banco de Dados  
   4.2 Migrações  
   4.3 Modelo de Dados Desnormalizado  
   4.4 Acesso a Dados

5. [Segurança](#5-segurança)  
   5.1 Autenticação  
   5.2 Autorização  
   5.3 Proteção CSRF  
   5.4 Senha e Hash  
   5.5 Bloqueio por Tentativas

6. [Configuração e Ambiente](#6-configuração-e-ambiente)  
   6.1 Arquivo config.py  
   6.2 Variáveis de Ambiente  
   6.3 Modo Debug

7. [Logging e Tratamento de Erros](#7-logging-e-tratamento-de-erros)  
   7.1 Logging  
   7.2 Tratamento de Erros  
   7.3 Página de Erro Amigável

8. [Testes](#8-testes)  
   8.1 Estratégia  
   8.2 Ferramentas  
   8.3 Execução

9. [Implantação e Execução](#9-implantação-e-execução)  
   9.1 Requisitos de Ambiente  
   9.2 Instalação  
   9.3 Execução  
   9.4 Manutenção

10. [Considerações de Desempenho e Escalabilidade](#10-considerações-de-desempenho-e-escalabilidade)

11. [Evolução Futura](#11-evolução-futura)

---

## 1. Introdução

### 1.1 Finalidade

Este documento descreve a arquitetura de software do **Sistema de Inscrição em Creches — Censo Anual de Demanda**, definindo as decisões técnicas, componentes, fluxos, persistência, segurança e demais aspectos estruturais que orientam o desenvolvimento e a manutenção do sistema.

### 1.2 Escopo

O sistema é uma aplicação web local, executada em uma única máquina na Secretaria Municipal de Educação. Seu escopo funcional abrange:

- Autenticação de operador.
- Cadastro de unidades e turmas (restrito ao suporte).
- Registro e edição de inscrições durante a campanha anual (setembro a outubro).
- Verificação de duplicidade por CPF no ano vigente.
- Cálculo de idade e sugestão/bloqueio de turma.
- Reutilização de dados para irmãos.
- Geração de comprovante PDF e JSON de backup.
- Consulta de inscrições e geração de relatórios.
- Backup automático diário do banco.

### 1.3 Definições e Siglas

| Sigla | Descrição |
|-------|-----------|
| DAS | Documento de Arquitetura de Software |
| SRS | Software Requirements Specification |
| PRD | Product Requirements Document |
| MVC | Model-View-Controller |
| ORM | Object-Relational Mapping |
| PDF | Portable Document Format |
| JSON | JavaScript Object Notation |
| CSS | Cascading Style Sheets |
| HTML | HyperText Markup Language |
| CSRF | Cross-Site Request Forgery |

### 1.4 Referências

- SRS — Sistema de Inscrição em Creches, versão 1.0, setembro de 2026 (a ser revisado para refletir a desnormalização).
- PRD — Sistema de Inscrição em Creches, versão 5.1, setembro de 2026.

### 1.5 Visão Geral do Documento

As seções seguintes detalham as decisões arquiteturais, componentes, persistência, segurança, configuração, logging, testes e implantação.

---

## 2. Decisões Arquiteturais

### 2.1 Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| **Backend** | Python 3.10+ | Linguagem simples, grande ecossistema de bibliotecas |
| **Framework Web** | Flask | Leve, flexível, ideal para aplicações locais de pequeno porte |
| **Frontend** | HTML + CSS + Jinja2 templates | Renderização server-side, sem necessidade de SPA |
| **Banco de Dados** | PostgreSQL | Robusto, suporte a migrações, adequado para dados relacionais |
| **Servidor de Aplicação** | Servidor embutido do Flask (Waitress) | Sem instalação de servidor externo, execução local simples |
| **ORM** | SQLAlchemy | Integração com Flask, facilita migrações e consultas |
| **Migrações** | Flask-Migrate (Alembic) | Controle de versão do esquema do banco |
| **Gerenciamento de Dependências** | pip + requirements.txt | Simples e amplamente adotado |
| **Autenticação** | Flask-Login | Gerenciamento de sessão de usuário |
| **Hash de Senha** | bcrypt | Seguro, com custo configurável |
| **Formulários** | Flask-WTF | Validação e proteção CSRF integradas |
| **Geração de PDF** | ReportLab | Permite proteção por senha, sem dependências externas |
| **Backup Automático** | APScheduler + pg_dump | Agendamento interno, dump SQL plain |
| **Logging** | logging + RotatingFileHandler | Log em arquivo com rotação por tamanho |
| **Testes** | pytest | Testes unitários e de integração |

### 2.2 Padrão Arquitetural

Adota-se o padrão **Model-View-Controller (MVC)** adaptado para aplicações Flask, com separação explícita em camadas:

- **Models**: representam as tabelas do banco e encapsulam a lógica de acesso a dados (SQLAlchemy). Inclui um modelo principal `Inscricao` que agrega todos os dados de responsável e criança.
- **Views/Templates**: páginas HTML renderizadas com Jinja2.
- **Controllers/Routes**: funções que recebem as requisições HTTP, invocam serviços e retornam respostas.
- **Services**: camada intermediária que implementa as regras de negócio (validações, cálculos, geração de comprovantes, etc.), mantendo as rotas enxutas.
- **Utils**: funções auxiliares (máscaras, validação de CPF, geração de JSON, etc.).

### 2.3 Estrutura do Projeto

```
/sicrem
│
├── /app
│   ├── /models          # Classes SQLAlchemy
│   │   ├── __init__.py
│   │   ├── unidade.py
│   │   ├── turma.py
│   │   ├── inscricao.py   # Contém todos os dados de responsável e criança
│   │   ├── historico.py
│   │   └── usuario.py     # Para autenticação do operador e suporte
│   ├── /routes          # Blueprints Flask
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── inscricao.py
│   │   ├── consulta.py
│   │   ├── relatorio.py
│   │   └── suporte.py
│   ├── /services        # Regras de negócio
│   │   ├── __init__.py
│   │   ├── validador_cpf.py
│   │   ├── calculo_idade.py
│   │   ├── inscricao_service.py
│   │   ├── comprovante_service.py
│   │   └── backup_service.py
│   ├── /templates       # Páginas Jinja2
│   │   ├── base.html
│   │   ├── login.html
│   │   ├── inscricao/
│   │   ├── consulta/
│   │   └── relatorio/
│   ├── /static          # CSS, JS, imagens
│   │   ├── css/
│   │   ├── js/
│   │   └── img/
│   ├── /utils           # Funções utilitárias
│   │   ├── __init__.py
│   │   ├── mascaras.py
│   │   └── json_utils.py
│   └── __init__.py      # Criação do app e extensões
│
├── /instance            # Dados de instância (arquivos locais)
│
├── /backups             # Diretório para JSONs (definido na instalação)
│   └── inscricao_CPF_ANO.json
│
├── /backups_banco       # Diretório para backups do banco (definido na instalação)
│   └── backup_YYYYMMDD_HHMM.sql
│
├── config.py            # Configurações da aplicação
├── requirements.txt     # Dependências Python
├── run.py               # Script de inicialização
└── pytest.ini           # Configuração dos testes
```

### 2.4 Camadas Lógicas

- **Route Layer (Controllers)**:  
  Responsável por receber as requisições, validar dados de entrada (via Flask-WTF), chamar serviços e renderizar templates.

- **Service Layer (Business Logic)**:  
  Contém as regras de negócio, tais como:
  - Verificação de CPF duplicado no ano.
  - Cálculo de idade em meses.
  - Sugestão e bloqueio de turma.
  - Geração de comprovante PDF e JSON.
  - Inativação/reativação com justificativa.
  - Backup do banco.

- **Model Layer (Data Access)**:  
  Define as classes SQLAlchemy e métodos de consulta. O modelo `Inscricao` concentra os dados antes espalhados em `Responsavel` e `Crianca`. Não contém regras de negócio, apenas persistência.

- **Utils**:  
  Funções reutilizáveis (máscaras, validação de CPF, manipulação de arquivos).

---

## 3. Componentes do Sistema

### 3.1 Componentes Principais

| Componente | Responsabilidade |
|------------|------------------|
| **AuthController** | Login/logout, bloqueio por tentativas |
| **InscricaoController** | Fluxo de inscrição (formulário único, resumo, confirmação) |
| **ConsultaController** | Busca e visualização de inscrições |
| **RelatorioController** | Geração e exportação de relatórios |
| **SuporteController** | Rota oculta para gerenciar unidades e turmas |
| **InscricaoService** | Regras de inscrição (duplicidade, cálculo, sugestão, persistência) |
| **ComprovanteService** | Geração de PDF e JSON |
| **BackupService** | Backup automático do banco |
| **ValidadorCPF** | Validação de CPF |
| **CalculoIdade** | Cálculo de idade em meses |
| **Models** | Classes de persistência (SQLAlchemy) |
| **Templates** | Páginas HTML |
| **Utils** | Funções auxiliares |

### 3.2 Fluxo de Execução

Fluxo de inscrição (exemplo principal):

1. Operador acessa rota `/inscricao/nova`.
2. `InscricaoController` exibe formulário de CPF da criança.
3. Ao submeter, `InscricaoService.verificar_duplicidade(cpf, ano)` consulta `Inscricao` model por `cpf_crianca` e `ano_referencia`.
4. Se não houver duplicidade, controller redireciona para o formulário único de inscrição.
5. O formulário único contém todas as seções: dados do responsável, dados da criança, situação socioeconômica, documentos, unidade, turma e turno.
6. Ao submeter, `InscricaoService` valida todos os campos, calcula idade, verifica compatibilidade de turma.
7. Se válido, persiste a nova `Inscricao` no banco com `status='ativa'`.
8. `ComprovanteService` gera PDF e JSON a partir do objeto `Inscricao`.
9. Controller exibe mensagem de sucesso e link para o comprovante.

### 3.3 Interação com Banco de Dados

- Utiliza-se SQLAlchemy ORM para todas as operações.
- As consultas são realizadas nos models, especialmente `Inscricao`.
- As transações são controladas pelo Flask-SQLAlchemy (commit automático ao final da request).
- Migrações via Flask-Migrate/Alembic.

### 3.4 Geração de PDF e JSON

- O `ComprovanteService` recebe o objeto `Inscricao` persistido.
- Gera PDF com ReportLab:
  - Define senha de abertura = CPF da criança (somente dígitos).
  - Salva em `backups/comprovante_CPF_ANO.pdf`.
- Gera JSON com todos os campos da inscrição (incluindo nulos):
  - Utiliza `json.dumps` sobre os atributos do objeto.
  - Salva em `backups/inscricao_CPF_ANO.json`.
- Em caso de edição da inscrição, os arquivos são sobrescritos.

### 3.5 Backup Automático

- O `BackupService` usa APScheduler para agendar tarefa diária às 11:00.
- Executa comando `pg_dump` (formato plain SQL) no banco configurado.
- Salva o arquivo em `backups_banco/backup_YYYYMMDD_HHMM.sql`.
- Não exibe mensagens ao operador.

---

## 4. Persistência e Modelo de Dados

### 4.1 Banco de Dados

- PostgreSQL local.
- Credenciais configuradas em `config.py` (ou variáveis de ambiente).
- Banco criado previamente pelo suporte.

### 4.2 Migrações

- Flask-Migrate (Alembic) para versionamento.
- Comandos:
  - `flask db init`
  - `flask db migrate -m "descrição"`
  - `flask db upgrade`

### 4.3 Modelo de Dados Desnormalizado

A principal característica desta versão é a **desnormalização** das entidades `responsavel` e `crianca`. Todos os seus campos são incorporados na tabela `inscricoes`, eliminando a necessidade de junções para consultas e simplificando o fluxo de cadastro.

#### Tabela `unidades` (permanece separada)

| Campo | Tipo | Observações |
|-------|------|-------------|
| id | SERIAL PK | |
| nome | VARCHAR(150) | Obrigatório |
| endereco | VARCHAR(300) | Obrigatório |
| ativo | BOOLEAN | Default TRUE |

#### Tabela `turmas` (permanece separada)

| Campo | Tipo | Observações |
|-------|------|-------------|
| id | SERIAL PK | |
| id_unidade | INTEGER FK | Referência a unidades.id |
| nome | VARCHAR(100) | Ex.: "Berçário I" |
| idade_min_meses | INTEGER | Obrigatório |
| idade_max_meses | INTEGER | Obrigatório |
| ativo | BOOLEAN | Default TRUE |

#### Tabela `inscricoes` (tabela única com todos os dados)

| Campo | Tipo | Observações |
|-------|------|-------------|
| id | SERIAL PK | |
| ano_referencia | INTEGER | Obrigatório (ex.: 2027) |
| numero | INTEGER | Sequencial por ano, gerado automaticamente |
| data_registro | TIMESTAMP | Data/hora da criação |
| status | VARCHAR(20) | 'ativa' ou 'inativada' (default 'ativa') |
| justificativa_status | TEXT | Usado na inativação/reativação |
| **Dados do Responsável** | | |
| resp_nome | VARCHAR(150) | Obrigatório |
| resp_cpf | CHAR(11) | Obrigatório |
| resp_rg | VARCHAR(20) | |
| resp_parentesco | VARCHAR(50) | Obrigatório |
| resp_telefone | VARCHAR(20) | Obrigatório |
| end_logradouro | VARCHAR(150) | |
| end_numero | VARCHAR(10) | |
| end_complemento | VARCHAR(50) | |
| end_bairro | VARCHAR(100) | |
| end_municipio | VARCHAR(100) | |
| end_uf | CHAR(2) | |
| end_cep | CHAR(8) | |
| end_referencia | VARCHAR(150) | |
| sit_mae_vinculo | BOOLEAN | Default FALSE |
| sit_demonstrativo_credito | BOOLEAN | Default FALSE |
| sit_loas_bpc | BOOLEAN | Default FALSE |
| sit_trabalhador_autonomo | BOOLEAN | Default FALSE |
| sit_mae_matriculada | BOOLEAN | Default FALSE |
| sit_vulnerabilidade | BOOLEAN | Default FALSE |
| sit_declaracao_mae_adolescente | BOOLEAN | Default FALSE |
| renda_per_capita | DECIMAL(10,2) | Obrigatório |
| **Dados da Criança** | | |
| cri_nome | VARCHAR(150) | Obrigatório |
| cri_data_nascimento | DATE | Obrigatório |
| cri_cpf | CHAR(11) | Obrigatório |
| cri_nome_pai | VARCHAR(150) | |
| cri_nome_mae | VARCHAR(150) | |
| doc_certidao_sem_pai_mae | BOOLEAN | Default FALSE |
| doc_irmao_matriculado | BOOLEAN | Default FALSE |
| enc_vara_familia | BOOLEAN | Default FALSE |
| enc_conselho_tutelar | BOOLEAN | Default FALSE |
| enc_cras | BOOLEAN | Default FALSE |
| enc_creas | BOOLEAN | Default FALSE |
| enc_casa_acolhimento | BOOLEAN | Default FALSE |
| saude_nis | VARCHAR(20) | |
| saude_cartao_sus | VARCHAR(20) | |
| saude_laudo_deficiencia | BOOLEAN | Default FALSE |
| saude_laudo_intolerancia | BOOLEAN | Default FALSE |
| saude_laudo_neurodivergencia | BOOLEAN | Default FALSE |
| **Solicitação de Vaga** | | |
| id_unidade | INTEGER FK | Referência a unidades.id |
| id_turma | INTEGER FK | Referência a turmas.id |
| turno | VARCHAR(10) | 'manhã', 'tarde', 'integral' (obrigatório) |

#### Tabela `historico` (permanece separada)

| Campo | Tipo | Observações |
|-------|------|-------------|
| id | SERIAL PK | |
| data_hora | TIMESTAMP | |
| entidade | VARCHAR(30) | 'inscricao', 'unidade', 'turma' |
| registro_id | INTEGER | ID do registro alterado |
| campo | VARCHAR(50) | |
| valor_anterior | TEXT | |
| valor_novo | TEXT | |
| operador | VARCHAR(20) | 'operador' |

#### Tabela `usuarios` (para autenticação)

| Campo | Tipo | Observações |
|-------|------|-------------|
| id | SERIAL PK | |
| username | VARCHAR(50) | 'operador' (ou 'suporte') |
| senha_hash | VARCHAR(128) | Hash bcrypt |
| role | VARCHAR(20) | 'operador' ou 'suporte' |

> **Nota:** A tabela `usuarios` é necessária para o login do operador e do suporte, já que a autenticação exige senha. O suporte pode acessar a rota oculta com suas credenciais.

### 4.4 Acesso a Dados

- SQLAlchemy ORM.
- Models principais: `Unidade`, `Turma`, `Inscricao`, `Historico`, `Usuario`.
- Relacionamentos:
  - Unidade 1—N Turma
  - Inscricao N—1 Unidade (via `id_unidade`)
  - Inscricao N—1 Turma (via `id_turma`)
  - Histórico registra alterações em `Inscricao`, `Unidade`, `Turma` (registro genérico).

---

## 5. Segurança

### 5.1 Autenticação

- Flask-Login gerencia sessão do usuário (operador ou suporte).
- Tela de login valida nome de usuário e senha.
- Logout manual disponível.

### 5.2 Autorização

- **Operador**: acesso às rotas normais (inscrição, consulta, relatórios).
- **Suporte**: acesso à rota oculta `/suporte` e às rotas de gerenciamento de unidades/turmas. Ao acessar a URL sem autenticação, redireciona para login. Após login, se o usuário for `suporte`, solicita a senha de suporte (ou utiliza a senha do próprio usuário, dependendo da implementação). Para simplicidade, o login do suporte pode ser feito diretamente com as credenciais do usuário `suporte`, sem formulário adicional.

### 5.3 Proteção CSRF

- Flask-WTF com `CSRFProtect` habilitado.
- Todos os formulários incluem token CSRF.

### 5.4 Senha e Hash

- Senhas dos usuários armazenadas como hash bcrypt no banco.
- Custo do bcrypt configurável (padrão 12).

### 5.5 Bloqueio por Tentativas

- Após 5 tentativas inválidas consecutivas, bloqueia por 5 minutos.
- Implementação em memória (dicionário global).
- O bloqueio é resetado após expirar o tempo.

---

## 6. Configuração e Ambiente

### 6.1 Arquivo config.py

Contém:

- `SECRET_KEY`
- `SQLALCHEMY_DATABASE_URI`
- `SQLALCHEMY_TRACK_MODIFICATIONS`
- `BACKUP_JSON_DIR` (ex.: `/home/operador/sicrem/backups`)
- `BACKUP_BANCO_DIR` (ex.: `/home/operador/sicrem/backups_banco`)
- `DEBUG = True` (padrão)
- `TESTING = False`
- `BCRYPT_LOG_ROUNDS = 12`

### 6.2 Variáveis de Ambiente

- Possibilidade de sobrescrever via `os.environ.get()`.
- Ex.: `SECRET_KEY`, `DATABASE_URL`, `BACKUP_DIRS`.

### 6.3 Modo Debug

- Padrão `DEBUG=True` para desenvolvimento.
- Em produção, definir `DEBUG=False`.

---

## 7. Logging e Tratamento de Erros

### 7.1 Logging

- Configuração no `__init__.py`.
- `RotatingFileHandler` com tamanho máximo (ex.: 10 MB) e 5 backups.
- Arquivo: `app.log` na raiz do projeto.
- Níveis: INFO para eventos normais, ERROR para erros com traceback.

### 7.2 Tratamento de Erros

- Página de erro amigável para 404 e 500.
- Em 500, registrar traceback no log.
- Usuário vê mensagem genérica "Ocorreu um erro inesperado".

### 7.3 Página de Erro Amigável

- Templates `404.html` e `500.html`.
- Estilo consistente com o restante do sistema.

---

## 8. Testes

### 8.1 Estratégia

- Testes unitários para serviços (validação de CPF, cálculo de idade, regras de negócio).
- Testes de integração para rotas e persistência.
- Cobertura mínima desejada: 80% das linhas.

### 8.2 Ferramentas

- pytest
- Flask-Testing (ou pytest-flask)
- Banco de dados de teste (PostgreSQL separado ou SQLite em memória para testes isolados)

### 8.3 Execução

- Comando: `pytest`
- Configuração em `pytest.ini`.

---

## 9. Implantação e Execução

### 9.1 Requisitos de Ambiente

- Sistema operacional Linux (ou Windows com adaptações).
- Python 3.10+
- PostgreSQL instalado e configurado.
- Navegador web atualizado.

### 9.2 Instalação

1. Clonar repositório.
2. Criar ambiente virtual: `python -m venv venv`
3. Ativar: `source venv/bin/activate`
4. Instalar dependências: `pip install -r requirements.txt`
5. Configurar `config.py` com diretórios e credenciais.
6. Criar banco no PostgreSQL.
7. Executar migrações: `flask db upgrade`
8. Criar usuários `operador` e `suporte` (script de seed ou manual pelo suporte).
9. Configurar agendador de backup (APScheduler inicia com a aplicação).

### 9.3 Execução

- Comando: `python run.py` (ou `flask run`)
- Acessar via navegador em `http://127.0.0.1:5000`.

### 9.4 Manutenção

- Backup diário automático.
- Restauração manual via `psql -f backup.sql`.
- Reimportação de JSONs via ferramenta externa (suporte).

---

## 10. Considerações de Desempenho e Escalabilidade

- Volume baixo (< 400 inscrições/ano), não há necessidade de otimizações complexas.
- PostgreSQL local garante resposta rápida.
- Geração de PDF e JSON é síncrona e imediata, sem impacto perceptível.
- Backup diário pode levar alguns segundos; executado em background.
- A desnormalização reduz a necessidade de junções, acelerando consultas e simplificando relatórios.

---

## 11. Evolução Futura

- Importação de dados históricos (versão futura).
- Possibilidade de múltiplos operadores.
- Interface para configuração de campanha (em vez de banco direto).
- Migração para arquitetura cliente-servidor, se necessário.
- Se necessário, reavaliar a desnormalização caso surjam requisitos de integridade referencial mais rígidos.
