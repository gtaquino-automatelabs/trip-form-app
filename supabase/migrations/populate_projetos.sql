-- Popular tabela projetos com dados estruturados
-- Estrutura SIMPLES: nome (nickName) + centros_custo JSONB expandido
-- Fonte: supabase/Dados-projetos/projetos_agrupados.json

INSERT INTO projetos (nome, centros_custo) VALUES 

-- Projetos principais do CEIA
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
    "titulo_completo": "AUTOMAÇÃO DE PROCESSOS EM CENTRAIS DE ATENDIMENTO UTILIZANDO ENGENHARIA DE PROMPTS E INSERÇÃO DE BASES DE CONHECIMENTO EM MODELOS DE LINGUAGEM DE GRANDE PORTE",
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
