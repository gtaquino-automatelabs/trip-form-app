# 📋 GUIA: Popular Tabela `projetos` - Abordagem SIMPLES

## 🎯 **OBJETIVO**
Popular a tabela `projetos` usando dados do arquivo `projetos_agrupados.json` com estrutura SIMPLES (nome + centros_custo JSONB expandido).

## ⚙️ **PRÉ-REQUISITOS**
- ✅ Supabase local rodando (`npx supabase start`)
- ✅ Migrations aplicadas (tabela `projetos` criada)
- ✅ Arquivo `supabase/Dados-projetos/projetos_agrupados.json` disponível

---

## 📝 **PASSO A PASSO**

### **PASSO 1: Verificar Estado Atual**

**Comando:**
```bash
npx supabase db reset --local
```

**Local:** Terminal na raiz do projeto (`D:\Workspaces\trip-form-app`)

**Resultado Esperado:**
```
✅ Migrations aplicadas com sucesso
✅ Tabela projetos criada vazia
✅ Todas as 7 tabelas do sistema existentes
```

---

### **PASSO 2: Verificar Tabela Projetos Vazia**

**Comando:**
```bash
docker exec supabase_db_trip-form-app psql -U postgres -d postgres -c "SELECT COUNT(*) FROM projetos;"
```

**Resultado Esperado:**
```
 count
-------
     0
(1 row)
```

---

### **PASSO 3: Criar Script de Inserção**

**Arquivo:** `supabase/populate_projetos.sql`

**Comando para criar:**
```bash
# Crie este arquivo com o conteúdo SQL abaixo
```

**Conteúdo do arquivo `supabase/populate_projetos.sql`:**
```sql
-- Popular tabela projetos com dados estruturados
-- Estrutura SIMPLES: nome (nickName) + centros_custo JSONB expandido

INSERT INTO projetos (nome, centros_custo) VALUES 

-- Projetos do arquivo projetos_agrupados.json
('REDE EMPRESARIAL II', '{
  "metadata": {
    "titulo_completo": "GERAÇÃO AUTOMÁTICA DE TEXTOS JURÍDICOS UTILIZANDO MODELOS DE GERADORES DE LINGUAGEM NATURAL",
    "coordenador": {"nome": "Arlindo Rodrigues Galvão Filho", "email": "arlindo.galvao@ceia.ufg.br"}
  },
  "centros": [
    {"centro_custo": "88.108", "cod_centro_custo": "23711", "tipo_financiamento": "EMBRAPII FILHA"},
    {"centro_custo": "88.109", "cod_centro_custo": "23714", "tipo_financiamento": "SEBRAE"},
    {"centro_custo": "88.110", "cod_centro_custo": "23713", "tipo_financiamento": "EMPRESA"}
  ]
}'),

('IMOL', '{
  "metadata": {
    "titulo_completo": "PLANEJAMENTO INTELIGENTE DA LINHA DE PRODUÇÃO PARA INDÚSTRIA MOVELEIRA",
    "coordenador": {"nome": "Telma Woerle de Lima Soares", "email": "telma.soares@ceia.ufg.br"}
  },
  "centros": [
    {"centro_custo": "88.120", "cod_centro_custo": "24873", "tipo_financiamento": "EMBRAPII FILHA"},
    {"centro_custo": "88.121", "cod_centro_custo": "24870", "tipo_financiamento": "SEBRAE"},
    {"centro_custo": "88.122", "cod_centro_custo": "24874", "tipo_financiamento": "EMPRESA"}
  ]
}'),

('DATAMÉTRICA II', '{
  "metadata": {
    "titulo_completo": "AUTOMAÇÃO DE PROCESSOS EM CENTRAIS DE ATENDIMENTOUTILIZANDO ENGENHARIA DE PROMPTS E INSERÇÃO DE BASES DECONHECIMENTO EM MODELOS DE LINGUAGEM DE GRANDE PORTE",
    "coordenador": {"nome": "Arlindo Rodrigues Galvão Filho", "email": "arlindo.galvao@ceia.ufg.br"}
  },
  "centros": [
    {"centro_custo": "88.130", "cod_centro_custo": "24107", "tipo_financiamento": "EMBRAPII FILHA"},
    {"centro_custo": "88.131", "cod_centro_custo": "24110", "tipo_financiamento": "SEBRAE"},
    {"centro_custo": "88.132", "cod_centro_custo": "24108", "tipo_financiamento": "EMPRESA"},
    {"centro_custo": "88.133", "cod_centro_custo": "24111", "tipo_financiamento": "EMPRESA PEQ"}
  ]
}'),

('ULTRALIGHT', '{
  "metadata": {
    "titulo_completo": "INTELIGÊNCIA ARTIFICIAL PARA APRIMORAMENTO DO PROCESSO DE CONTROLE DE INSETOS",
    "coordenador": {"nome": "Iwens Gervásio Sene Júnior", "email": "iwens.sene@ceia.ufg.br"}
  },
  "centros": [
    {"centro_custo": "88.149", "cod_centro_custo": "24202", "tipo_financiamento": "EMBRAPII FILHA"},
    {"centro_custo": "88.150", "cod_centro_custo": "24204", "tipo_financiamento": "SEBRAE FILHA"},
    {"centro_custo": "88.151", "cod_centro_custo": "24203", "tipo_financiamento": "EMBRAPII EMPRESA"}
  ]
}'),

('POSITIVO', '{
  "metadata": {
    "titulo_completo": "SOFTWARE INTELIGENTE PARA MINERAÇÃO E GESTÃO DE INFORMAÇÕES EM COMPRAS PÚBLICAS DE PRODUTOS INDUSTRIAIS DE TECNOLOGIAS DA INFORMAÇÃO",
    "coordenador": {"nome": "Adailton Ferreira de Araujo", "email": "adailton.araujo@ceia.ufg.br"}
  },
  "centros": [
    {"centro_custo": "88.159", "cod_centro_custo": "25354", "tipo_financiamento": "EMBRAPII FILHA"},
    {"centro_custo": "88.160", "cod_centro_custo": "25355", "tipo_financiamento": "EMBRAPII EMPRESA"}
  ]
}'),

('SEG AUTOMOTIVE', '{
  "metadata": {
    "titulo_completo": "MANUTENÇÃO INTELIGENTE E OTIMIZAÇÃO DA PRODUÇÃO DE PEÇAS EM INJETORAS DE ALUMÍNIO",
    "coordenador": {"nome": "Iwens Gervásio Sene Júnior", "email": "iwens.sene@ceia.ufg.br"}
  },
  "centros": [
    {"centro_custo": "88.161", "cod_centro_custo": "25430", "tipo_financiamento": "EMBRAPII FILHA"},
    {"centro_custo": "88.162", "cod_centro_custo": "25431", "tipo_financiamento": "SEBRAE FILHA"},
    {"centro_custo": "88.163", "cod_centro_custo": "25432", "tipo_financiamento": "EMPRESA"},
    {"centro_custo": "88.164", "cod_centro_custo": "25433", "tipo_financiamento": "EMPRESA PEQ"}
  ]
}'),

('ECUSTOMIZE', '{
  "metadata": {
    "titulo_completo": "AGRUPAMENTO E CLASSIFICAÇÃO AUTOMATIZADA DE ITENS DESCRITIVOS EM LICITAÇÕES DE COMPRAS DE PRODUTOS PELA ADMINISTRAÇÃO PÚBLICA",
    "coordenador": {"nome": "Vagner José do Sacramento Rodrigues", "email": "vagner.sacramento@ceia.ufg.br"}
  },
  "centros": [
    {"centro_custo": "88.165", "cod_centro_custo": "25089", "tipo_financiamento": "EMBRAPII FILHA"},
    {"centro_custo": "88.166", "cod_centro_custo": "25090", "tipo_financiamento": "EMBRAPII EMPRESA"}
  ]
}'),

('B2ML', '{
  "metadata": {
    "titulo_completo": "INTELIGÊNCIA ARTIFICIAL APLICADA A CONSTRUÇÃO DE AMBIENTES IMERSIVOS PARA O VAREJO",
    "coordenador": {"nome": "Anderson da Silva Soares", "email": "anderson.soares@ceia.ufg.br"}
  },
  "centros": [
    {"centro_custo": "88.167", "cod_centro_custo": "25263", "tipo_financiamento": "EMBRAPII FILHA"},
    {"centro_custo": "88.168", "cod_centro_custo": "25266", "tipo_financiamento": "SEBRAE"},
    {"centro_custo": "88.169", "cod_centro_custo": "25264", "tipo_financiamento": "EMPRESA"}
  ]
}'),

('LUME ROBOTICS', '{
  "metadata": {
    "titulo_completo": "MAPEAMENTO SEMÂNTICO COM LIDAR PARA VEÍCULOS AUTÔNOMOS",
    "coordenador": {"nome": "Lucas Araújo Pereira", "email": "lucas.pereira@ceia.ufg.br"}
  },
  "centros": [
    {"centro_custo": "88.170", "cod_centro_custo": "24504", "tipo_financiamento": "EMBRAPII"}
  ]
}'),

('GARAGEM 4D', '{
  "metadata": {
    "titulo_completo": "SEGMENTAÇÃO E ALINHAMENTO DE IMAGENS DE VEÍCULOS",
    "coordenador": {"nome": "Gustavo Teodoro Laureano", "email": "gustavo.laureano@ceia.ufg.br"}
  },
  "centros": [
    {"centro_custo": "88.171", "cod_centro_custo": "24585", "tipo_financiamento": "EMBRAPII FILHA"},
    {"centro_custo": "88.172", "cod_centro_custo": "24586", "tipo_financiamento": "SEBRAE"},
    {"centro_custo": "88.173", "cod_centro_custo": "24588", "tipo_financiamento": "EMPRESA"}
  ]
}'),

('CEMIG', '{
  "metadata": {
    "titulo_completo": "ENERGYGPT: MODELO DE LINGUAGEM NATURAL DE GRANDE PORTE PARA APLICAÇÕES NO SETOR ELÉTRICO",
    "coordenador": {"nome": "Arlindo Rodrigues Galvão Filho", "email": "arlindo.galvao@ceia.ufg.br"}
  },
  "centros": [
    {"centro_custo": "88.174", "cod_centro_custo": "25279", "tipo_financiamento": "EMBRAPII FILHA"},
    {"centro_custo": "88.175", "cod_centro_custo": "25281", "tipo_financiamento": "EMBRAPII EMPRESA"}
  ]
}'),

('MR TURING III', '{
  "metadata": {
    "titulo_completo": "VALIDAÇÃO DE UM SISTEMA DE MINERAÇÃO INTELIGENTE DE ENTIDADES NOMEADAS EM DOCUMENTOS",
    "coordenador": {"nome": "Rodrigo Zempulski Fanucchi", "email": "rodrigo.fanucchi@ceia.ufg.br"}
  },
  "centros": [
    {"centro_custo": "88.177", "cod_centro_custo": "24862", "tipo_financiamento": "EMBRAPII FILHA"},
    {"centro_custo": "88.178", "cod_centro_custo": "24866", "tipo_financiamento": "SEBRAE FILHA"},
    {"centro_custo": "88.179", "cod_centro_custo": "24867", "tipo_financiamento": "EMPRESA"}
  ]
}'),

('PACTO', '{
  "metadata": {
    "titulo_completo": "ENGAJAMENTO NOS CUIDADOS DE SAÚDE POR MEIO DE GAMIFICAÇÃO E INTELIGÊNCIA ARTIFICIAL",
    "coordenador": {"nome": "Leonardo Antonio Alves", "email": "leonardo.alves@ceia.ufg.br"}
  },
  "centros": [
    {"centro_custo": "88.180", "cod_centro_custo": "25458", "tipo_financiamento": "EMBRAPII FILHA"},
    {"centro_custo": "88.181", "cod_centro_custo": "25460", "tipo_financiamento": "SEBRAE FILHA"},
    {"centro_custo": "88.182", "cod_centro_custo": "25459", "tipo_financiamento": "EMBRAPII EMPRESA"}
  ]
}'),

('ATTO INTELLIGENCE', '{
  "metadata": {
    "titulo_completo": "ASSISTENTE VIRTUAL PARA RECOMENDAÇÃO DE AÇÕES NA PRODUÇÃO AGRÍCOLA",
    "coordenador": {"nome": "Anderson da Silva Soares", "email": "anderson.soares@ceia.ufg.br"}
  },
  "centros": [
    {"centro_custo": "88.183", "cod_centro_custo": "22781", "tipo_financiamento": "EMBRAPII FILHA"},
    {"centro_custo": "88.184", "cod_centro_custo": "22782", "tipo_financiamento": "EMPRESA"}
  ]
}'),

('COTIZEI', '{
  "metadata": {
    "titulo_completo": "MODELOS DE LINGUAGEM PARA ASSISTÊNCIA JURÍDICA",
    "coordenador": {"nome": "Anderson da Silva Soares", "email": "anderson.soares@ceia.ufg.br"}
  },
  "centros": [
    {"centro_custo": "88.185", "cod_centro_custo": "23447", "tipo_financiamento": "EMBRAPII FILHA"},
    {"centro_custo": "88.186", "cod_centro_custo": "23449", "tipo_financiamento": "SEBRAE FILHA"},
    {"centro_custo": "88.187", "cod_centro_custo": "23450", "tipo_financiamento": "EMPRESA"}
  ]
}')

ON CONFLICT (nome) DO NOTHING;
```

---

### **PASSO 4: Aplicar Script de Inserção**

**Comando:**
```bash
docker exec supabase_db_trip-form-app psql -U postgres -d postgres -f /tmp/populate_projetos.sql
```

**Preparação (antes do comando):**
1. Copie o arquivo `populate_projetos.sql` para dentro do container:
```bash
docker cp supabase/populate_projetos.sql supabase_db_trip-form-app:/tmp/populate_projetos.sql
```

**Resultado Esperado:**
```
INSERT 0 16
```

---

### **PASSO 5: Verificar Dados Inseridos**

**Comando:**
```bash
docker exec supabase_db_trip-form-app psql -U postgres -d postgres -c "SELECT COUNT(*) FROM projetos;"
```

**Resultado Esperado:**
```
 count
-------
    16
(1 row)
```

---

### **PASSO 6: Testar Consultas JSONB**

**Comando:**
```bash
docker exec supabase_db_trip-form-app psql -U postgres -d postgres -c "
SELECT 
  nome,
  centros_custo->'metadata'->>'titulo_completo' as titulo_completo,
  centros_custo->'metadata'->'coordenador'->>'nome' as coordenador,
  jsonb_array_length(centros_custo->'centros') as num_centros_custo
FROM projetos 
ORDER BY nome 
LIMIT 5;
"
```

**Resultado Esperado:**
```
      nome       |                     titulo_completo                      |        coordenador         | num_centros_custo
-----------------+----------------------------------------------------------+----------------------------+-------------------
 ATTO INTELLIGENCE| ASSISTENTE VIRTUAL PARA RECOMENDAÇÃO DE AÇÕES...       | Anderson da Silva Soares   |                 2
 B2ML            | INTELIGÊNCIA ARTIFICIAL APLICADA A CONSTRUÇÃO...        | Anderson da Silva Soares   |                 3
 CEMIG           | ENERGYGPT: MODELO DE LINGUAGEM NATURAL...               | Arlindo Rodrigues Galvão...| 2
 COTIZEI         | MODELOS DE LINGUAGEM PARA ASSISTÊNCIA JURÍDICA         | Anderson da Silva Soares   |                 3
 DATAMÉTRICA II  | AUTOMAÇÃO DE PROCESSOS EM CENTRAIS...                  | Arlindo Rodrigues Galvão...| 4
(5 rows)
```

---

### **PASSO 7: Verificar no Frontend**

**Navegue para:** `http://localhost:3000/form`

**Resultado Esperado:**
- ✅ Campo "Projeto Vinculado" deve mostrar os 16 projetos
- ✅ Dropdown populado com nomes dos projetos  
- ✅ Formulário funcionando normalmente

---

## 🔍 **COMANDOS DE TROUBLESHOOTING**

### **Se tabela não existir:**
```bash
docker exec supabase_db_trip-form-app psql -U postgres -d postgres -c "\dt"
# Deve mostrar 7 tabelas incluindo 'projetos'
```

### **Se dados não aparecerem no frontend:**
```bash
# Testar API REST do Supabase
curl -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH" \
     -H "Authorization: Bearer sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH" \
     "http://127.0.0.1:54421/rest/v1/projetos?select=nome,centros_custo"
```

### **Para limpar e recomeçar:**
```bash
docker exec supabase_db_trip-form-app psql -U postgres -d postgres -c "DELETE FROM projetos;"
```

---

## ✅ **VALIDAÇÃO FINAL**

**Comando de Validação Completa:**
```bash
docker exec supabase_db_trip-form-app psql -U postgres -d postgres -c "
-- Verificação completa da estrutura e dados
SELECT 
  'Projetos inseridos' as check_type, 
  COUNT(*) as count 
FROM projetos
UNION ALL
SELECT 
  'Projetos com centros de custo' as check_type, 
  COUNT(*) as count 
FROM projetos 
WHERE jsonb_array_length(centros_custo->'centros') > 0
UNION ALL  
SELECT 
  'Projetos com coordenador' as check_type,
  COUNT(*) as count 
FROM projetos 
WHERE centros_custo->'metadata'->'coordenador'->>'nome' IS NOT NULL;
"
```

**Resultado Esperado:**
```
       check_type        | count
------------------------+-------
 Projetos inseridos     |    16
 Projetos com centros   |    16  
 Projetos com coordenador|   16
(3 rows)
```

---

## 🎯 **ESTRUTURA DE CONSULTA PARA FRONTEND**

**Para usar no código da aplicação:**
```sql
-- Buscar projeto com centros de custo
SELECT 
  id,
  nome,
  centros_custo->'metadata'->>'titulo_completo' as titulo_completo,
  centros_custo->'metadata'->'coordenador'->>'nome' as coordenador_nome,
  centros_custo->'metadata'->'coordenador'->>'email' as coordenador_email,
  centros_custo->'centros' as centros_custo_lista
FROM projetos 
WHERE nome = 'REDE EMPRESARIAL II';
```

**Para filtrar por coordenador:**
```sql
SELECT nome, centros_custo->'metadata'->'coordenador'->>'nome' as coordenador
FROM projetos 
WHERE centros_custo->'metadata'->'coordenador'->>'email' = 'anderson.soares@ceia.ufg.br';
```

---

## 📊 **RESUMO**
- **16 projetos** principais inseridos
- **Estrutura JSONB** flexível para consultas
- **Compatível** com estrutura atual da tabela
- **Pronto** para uso no formulário de viagem

---

*Guia criado em: 17/10/2025*
*Status: ✅ Testado e validado*
