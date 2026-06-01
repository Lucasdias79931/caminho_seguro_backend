BEGIN;

INSERT INTO bairro (id, nome, descricao, status, created_at, updated_at) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Bela Vista', 'Zona central com alta circulação de pedestres.', 'ATIVO', now() - interval '12 days', now() - interval '12 days'),
    ('22222222-2222-2222-2222-222222222222', 'Consolação', 'Área universitária e comercial.', 'ATIVO', now() - interval '12 days', now() - interval '12 days'),
    ('33333333-3333-3333-3333-333333333333', 'Sé', 'Centro histórico com calçadas antigas.', 'ATIVO', now() - interval '12 days', now() - interval '12 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO rua (id, id_bairro, cep, nome, descricao, status, created_at, updated_at) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111', '01310-100', 'Avenida Paulista', 'Próximo ao metrô Trianon-Masp.', 'ATIVO', now() - interval '11 days', now() - interval '11 days'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111', '01311-200', 'Rua São Carlos do Pinhal', 'Via com fluxo intenso de pedestres.', 'ATIVO', now() - interval '11 days', now() - interval '11 days'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '22222222-2222-2222-2222-222222222222', '01305-000', 'Rua Augusta', 'Área comercial e de lazer.', 'ATIVO', now() - interval '11 days', now() - interval '11 days'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '33333333-3333-3333-3333-333333333333', '01001-000', 'Rua Direita', 'Calçadão central com pavimento antigo.', 'ATIVO', now() - interval '11 days', now() - interval '11 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO orgao (id, telefone, nome, status, created_at, updated_at) VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '1131138000', 'Secretaria Municipal de Infraestrutura Urbana', 'ATIVO', now() - interval '10 days', now() - interval '10 days'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '1132912200', 'Subprefeitura da Sé', 'ATIVO', now() - interval '10 days', now() - interval '10 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO equipe_manutencao (id, id_orgao, especialidade, quantidade_membros, nome, status, created_at, updated_at) VALUES
    ('cccccccc-cccc-cccc-cccc-ccccccccccc1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'Reforma de calçadas e pavimentação', 6, 'Equipe Pavimentação Centro', 'ATIVO', now() - interval '9 days', now() - interval '9 days'),
    ('cccccccc-cccc-cccc-cccc-ccccccccccc2', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'Zeladoria e desobstrução', 4, 'Equipe Zeladoria Sé', 'ATIVO', now() - interval '9 days', now() - interval '9 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cidadao (id, status, created_at, updated_at, email, senha, nome) VALUES
    ('dddddddd-dddd-dddd-dddd-ddddddddddd1', 'ATIVO', now() - interval '8 days', now() - interval '8 days', 'luis.pedestre@example.com', 'demo123', 'Luis Fernando da Silva'),
    ('dddddddd-dddd-dddd-dddd-ddddddddddd2', 'ATIVO', now() - interval '8 days', now() - interval '8 days', 'aline.rocha@example.com', 'demo123', 'Aline Rocha Duarte')
ON CONFLICT (id) DO NOTHING;

INSERT INTO fiscal (id, matricula, status, created_at, updated_at, email, senha, nome) VALUES
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'FISC-2026-01', 'ATIVO', now() - interval '8 days', now() - interval '8 days', 'carlos.fiscal@example.com', 'demo123', 'Carlos Henrique Souza'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', 'FISC-2026-02', 'ATIVO', now() - interval '8 days', now() - interval '8 days', 'mariana.fiscal@example.com', 'demo123', 'Mariana Alencar')
ON CONFLICT (id) DO NOTHING;

INSERT INTO obstaculo (
    id, id_rua, descricao, status, created_at, updated_at,
    pavimentacao, iluminacao, saneamento, zeladoria
) VALUES
    ('ffffffff-ffff-ffff-ffff-fffffffffff1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Piso tátil quebrado e calçamento destruído.', 'ATIVO', now() - interval '7 days', now() - interval '7 days', 'CALCADA_DANIFICADA', NULL, NULL, NULL),
    ('ffffffff-ffff-ffff-ffff-fffffffffff2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Poste danificado bloqueando a rampa de acessibilidade.', 'ATIVO', now() - interval '6 days', now() - interval '6 days', NULL, 'POSTE_QUEBRADO', NULL, NULL),
    ('ffffffff-ffff-ffff-ffff-fffffffffff3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'Bueiro sem tampa próximo à faixa de pedestres.', 'ATIVO', now() - interval '5 days', now() - interval '5 days', NULL, NULL, 'BUEIRO_SEM_TAMPA', NULL),
    ('ffffffff-ffff-ffff-ffff-fffffffffff4', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Entulho de obra ocupando a calçada.', 'ATIVO', now() - interval '4 days', now() - interval '4 days', NULL, NULL, NULL, 'LIXO_ACUMULADO')
ON CONFLICT (id) DO NOTHING;

INSERT INTO ocorrencia (
    id, id_obstaculo, id_cidadao, id_orgao,
    status, created_at, updated_at, descricao
) VALUES
    ('99999999-9999-9999-9999-999999999991', 'ffffffff-ffff-ffff-ffff-fffffffffff1', 'dddddddd-dddd-dddd-dddd-ddddddddddd1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'PENDENTE', now() - interval '7 days', now() - interval '7 days', 'Calçada com piso tátil quebrado impedindo passagem segura.'),
    ('99999999-9999-9999-9999-999999999992', 'ffffffff-ffff-ffff-ffff-fffffffffff2', 'dddddddd-dddd-dddd-dddd-ddddddddddd2', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'ATIVO', now() - interval '6 days', now() - interval '4 days', 'Poste bloqueia rampa de acessibilidade.'),
    ('99999999-9999-9999-9999-999999999993', 'ffffffff-ffff-ffff-ffff-fffffffffff3', 'dddddddd-dddd-dddd-dddd-ddddddddddd1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'ATIVO', now() - interval '5 days', now() - interval '1 day', 'Bueiro sem tampa gerando risco de queda.'),
    ('99999999-9999-9999-9999-999999999994', 'ffffffff-ffff-ffff-ffff-fffffffffff4', 'dddddddd-dddd-dddd-dddd-ddddddddddd2', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'PENDENTE', now() - interval '4 days', now() - interval '4 days', 'Entulho força pedestres a caminhar pela rua.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO imagem (id, id_ocorrencia, status, created_at, updated_at) VALUES
    ('abababab-abab-abab-abab-ababababab01', '99999999-9999-9999-9999-999999999991', 'ATIVO', now() - interval '7 days', now() - interval '7 days'),
    ('abababab-abab-abab-abab-ababababab02', '99999999-9999-9999-9999-999999999992', 'ATIVO', now() - interval '6 days', now() - interval '6 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO vistoria (
    id, id_ocorrencia, id_fiscal, laudo, prazo_adequacao,
    status, created_at, updated_at, descricao
) VALUES
    ('12121212-1212-1212-1212-121212121201', '99999999-9999-9999-9999-999999999992', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'Obstrução grave de rampa confirmada em vistoria.', now() + interval '7 days', 'ATIVO', now() - interval '4 days', now() - interval '4 days', 'Vistoria inicial com prioridade alta.'),
    ('12121212-1212-1212-1212-121212121202', '99999999-9999-9999-9999-999999999993', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', 'Bueiro reparado e sinalização temporária removida.', now() - interval '1 day', 'ATIVO', now() - interval '3 days', now() - interval '1 day', 'Vistoria finalizada.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO intervencao (
    id, id_vistoria, id_equipe, custo_estimado, data_registro,
    data_conclusao, status, created_at, updated_at, descricao
) VALUES
    ('34343434-3434-3434-3434-343434343401', '12121212-1212-1212-1212-121212121202', 'cccccccc-cccc-cccc-cccc-ccccccccccc2', 850.00, now() - interval '2 days', now() - interval '1 day', 'ATIVO', now() - interval '2 days', now() - interval '1 day', 'Reposição de tampa de bueiro e revisão do entorno.'),
    ('34343434-3434-3434-3434-343434343402', '12121212-1212-1212-1212-121212121201', 'cccccccc-cccc-cccc-cccc-ccccccccccc1', 2400.00, now() - interval '1 day', NULL, 'ATIVO', now() - interval '1 day', now() - interval '1 day', 'Remanejamento do poste e recuperação da rampa.')
ON CONFLICT (id) DO NOTHING;

COMMIT;
