"""
add triggers and procedures 

Revision ID: 96fea478d8cd
Revises: e0b0b8145bcc
"""

from typing import Sequence, Union
from alembic import op

revision = '96fea478d8cd'
down_revision = 'e0b0b8145bcc'
branch_labels = None
depends_on = None


def upgrade() -> None:


    op.execute("""
    CREATE OR REPLACE PROCEDURE p_lista_bairros()
    LANGUAGE plpgsql AS $$
    DECLARE r RECORD;
    BEGIN
        FOR r IN SELECT id, nome, status FROM bairro LOOP
            RAISE NOTICE 'Bairro ID: %, Nome: %, Status: %', r.id, r.nome, r.status;
        END LOOP;
    END; $$;
    """)

    op.execute("""
    CREATE OR REPLACE PROCEDURE p_lista_ruas()
    LANGUAGE plpgsql AS $$
    DECLARE r RECORD;
    BEGIN
        FOR r IN SELECT id, nome, status FROM rua LOOP
            RAISE NOTICE 'Rua ID: %, Nome: %, Status: %', r.id, r.nome, r.status;
        END LOOP;
    END; $$;
    """)

    op.execute("""
    CREATE OR REPLACE PROCEDURE p_lista_obstaculos()
    LANGUAGE plpgsql AS $$
    DECLARE r RECORD;
    BEGIN
        FOR r IN SELECT id, descricao, status FROM obstaculo LOOP
            RAISE NOTICE 'Obstáculo ID: %, Descrição: %, Status: %', r.id, r.descricao, r.status;
        END LOOP;
    END; $$;
    """)

    op.execute("""
    CREATE OR REPLACE PROCEDURE p_lista_cidadaos()
    LANGUAGE plpgsql AS $$
    DECLARE r RECORD;
    BEGIN
        FOR r IN SELECT id, nome, email, status FROM cidadao LOOP
            RAISE NOTICE 'Cidadão ID: %, Nome: %, Email: %, Status: %', r.id, r.nome, r.email, r.status;
        END LOOP;
    END; $$;
    """)



    op.execute("""
    CREATE OR REPLACE PROCEDURE p_busca_cidadao_email(p_email text)
    LANGUAGE plpgsql AS $$
    DECLARE r RECORD;
    BEGIN
        SELECT id, nome, status INTO r FROM cidadao WHERE email = p_email;
        IF FOUND THEN
            RAISE NOTICE 'Cidadão Encontrado -> ID: %, Nome: %, Status: %', r.id, r.nome, r.status;
        ELSE
            RAISE NOTICE 'Nenhum cidadão localizado com o e-mail: %', p_email;
        END IF;
    END; $$;
    """)

    op.execute("""
    CREATE OR REPLACE PROCEDURE p_busca_ruas_bairro(p_id_bairro uuid)
    LANGUAGE plpgsql AS $$
    DECLARE r RECORD;
    BEGIN
        FOR r IN SELECT id, nome FROM rua WHERE id_bairro = p_id_bairro LOOP
            RAISE NOTICE 'Rua encontrada no bairro -> ID: %, Nome: %', r.id, r.nome;
        END LOOP;
    END; $$;
    """)

    op.execute("""
    CREATE OR REPLACE PROCEDURE p_busca_obstaculos_ruas(p_id_ruia uuid)
    LANGUAGE plpgsql AS $$
    DECLARE r RECORD;
    BEGIN
        FOR r IN SELECT id, descricao, pavimentacao FROM obstaculo WHERE id_rua = p_id_ruia LOOP
            RAISE NOTICE 'Obstáculo na rua -> ID: %, Desc: %, Pavimento: %', r.id, r.descricao, r.pavimentacao;
        END LOOP;
    END; $$;
    """)

    op.execute("""
    CREATE OR REPLACE PROCEDURE p_busca_ocorrencias_cidadao(p_id_cidadao uuid)
    LANGUAGE plpgsql AS $$
    DECLARE r RECORD;
    BEGIN
        FOR r IN SELECT id, descricao, status FROM ocorrencia WHERE id_cidadao = p_id_cidadao LOOP
            RAISE NOTICE 'Ocorrência do cidadão -> ID: %, Desc: %, Status: %', r.id, r.descricao, r.status;
        END LOOP;
    END; $$;
    """)



    op.execute("""
    CREATE OR REPLACE PROCEDURE i1_bairro(p_id uuid, p_nome text, p_desc text)
    LANGUAGE plpgsql AS $$
    BEGIN
        INSERT INTO bairro(id, nome, descricao, status, created_at, updated_at)
        VALUES (p_id, p_nome, p_desc, 'ativo', NOW(), NOW());
    EXCEPTION
        WHEN unique_violation THEN RAISE NOTICE 'Erro (i1): O ID ou registro do Bairro já existe.';
        WHEN not_null_violation THEN RAISE NOTICE 'Erro (i1): Campos obrigatórios nulos.';
        WHEN OTHERS THEN RAISE EXCEPTION 'Erro inesperado: %', SQLERRM;
    END; $$;
    """)

    op.execute("""
    CREATE OR REPLACE PROCEDURE i2_rua(p_id uuid, p_id_bairro uuid, p_cep character(36), p_nome text, p_desc text)
    LANGUAGE plpgsql AS $$
    BEGIN
        INSERT INTO rua(id, id_bairro, cep, nome, descricao, status, created_at, updated_at)
        VALUES (p_id, p_id_bairro, p_cep, p_nome, p_desc, 'ativo', NOW(), NOW());
    EXCEPTION
        WHEN foreign_key_violation THEN RAISE NOTICE 'Erro (i2): O Bairro informado (FK) não existe.';
        WHEN unique_violation THEN RAISE NOTICE 'Erro (i2): O ID ou registro da Rua já existe.';
        WHEN OTHERS THEN RAISE EXCEPTION 'Erro inesperado: %', SQLERRM;
    END; $$;
    """)

    op.execute("""
    CREATE OR REPLACE PROCEDURE i3_cidadao(p_id uuid, p_nome text, p_email varchar(255), p_senha varchar(200))
    LANGUAGE plpgsql AS $$
    BEGIN
        INSERT INTO cidadao(id, nome, email, senha, status, created_at, updated_at)
        VALUES (p_id, p_nome, p_email, p_senha, 'ativo', NOW(), NOW());
    EXCEPTION
        WHEN unique_violation THEN RAISE NOTICE 'Erro (i3): E-mail ou ID de Cidadão já cadastrado.';
        WHEN OTHERS THEN RAISE EXCEPTION 'Erro inesperado: %', SQLERRM;
    END; $$;
    """)

    op.execute("""
    CREATE OR REPLACE PROCEDURE i4_orgao(p_id uuid, p_nome text, p_telefone varchar(10))
    LANGUAGE plpgsql AS $$
    BEGIN
        INSERT INTO orgao(id, nome, telefone, status, created_at, updated_at)
        VALUES (p_id, p_nome, p_telefone, 'ativo', NOW(), NOW());
    EXCEPTION
        WHEN unique_violation THEN RAISE NOTICE 'Erro (i4): ID de Órgão duplicado.';
        WHEN OTHERS THEN RAISE EXCEPTION 'Erro inesperado: %', SQLERRM;
    END; $$;
    """)


    op.execute("""
    CREATE OR REPLACE PROCEDURE u1_bairro(p_id uuid, p_nome text, p_desc text)
    LANGUAGE plpgsql AS $$
    BEGIN
        UPDATE bairro SET nome = p_nome, descricao = p_desc, updated_at = NOW() WHERE id = p_id;
    END; $$;
    """)

    op.execute("""
    CREATE OR REPLACE PROCEDURE u2_rua(p_id uuid, p_nome text, p_cep character(36))
    LANGUAGE plpgsql AS $$
    BEGIN
        UPDATE rua SET nome = p_nome, cep = p_cep, updated_at = NOW() WHERE id = p_id;
    END; $$;
    """)

    op.execute("""
    CREATE OR REPLACE PROCEDURE u3_cidadao(p_id uuid, p_nome text, p_senha varchar(200))
    LANGUAGE plpgsql AS $$
    BEGIN
        UPDATE cidadao SET nome = p_nome, senha = p_senha, updated_at = NOW() WHERE id = p_id;
    END; $$;
    """)

    op.execute("""
    CREATE OR REPLACE PROCEDURE u4_orgao(p_id uuid, p_nome text, p_telefone varchar(10))
    LANGUAGE plpgsql AS $$
    BEGIN
        UPDATE orgao SET nome = p_nome, telefone = p_telefone, updated_at = NOW() WHERE id = p_id;
    END; $$;
    """)



    op.execute("""
    CREATE OR REPLACE PROCEDURE d1_bairro_logico(p_id uuid)
    LANGUAGE plpgsql AS $$
    BEGIN
        UPDATE bairro SET status = 'inativo', updated_at = NOW() WHERE id = p_id;
    END; $$;
    """)

    op.execute("""
    CREATE OR REPLACE PROCEDURE d2_rua_logico(p_id uuid)
    LANGUAGE plpgsql AS $$
    BEGIN
        UPDATE rua SET status = 'inativo', updated_at = NOW() WHERE id = p_id;
    END; $$;
    """)

    op.execute("""
    CREATE OR REPLACE PROCEDURE d3_cidadao_logico(p_id uuid)
    LANGUAGE plpgsql AS $$
    BEGIN
        UPDATE cidadao SET status = 'inativo', updated_at = NOW() WHERE id = p_id;
    END; $$;
    """)

    op.execute("""
    CREATE OR REPLACE PROCEDURE d4_orgao_logico(p_id uuid)
    LANGUAGE plpgsql AS $$
    BEGIN
        UPDATE orgao SET status = 'inativo', updated_at = NOW() WHERE id = p_id;
    END; $$;
    """)



    op.execute("""
    CREATE OR REPLACE PROCEDURE crud_bairro(op_type CHAR(1), p_id uuid, p_nome text DEFAULT NULL)
    LANGUAGE plpgsql AS $$
    BEGIN
        CASE op_type
            WHEN 'I' THEN INSERT INTO bairro(id, nome, status, created_at, updated_at) VALUES (p_id, p_nome, 'ativo', NOW(), NOW());
            WHEN 'A' THEN UPDATE bairro SET nome = p_nome, updated_at = NOW() WHERE id = p_id;
            WHEN 'E' THEN UPDATE bairro SET status = 'inativo', updated_at = NOW() WHERE id = p_id;
            WHEN 'C' THEN RAISE NOTICE 'Consulta no bairro %', p_id;
            ELSE RAISE EXCEPTION 'Operação inválida!';
        END CASE;
    END; $$;
    """)

    op.execute("""
    CREATE OR REPLACE PROCEDURE crud_cidadao(op_type CHAR(1), p_id uuid, p_nome text DEFAULT NULL, p_email varchar(255) DEFAULT NULL, p_senha varchar(200) DEFAULT NULL)
    LANGUAGE plpgsql AS $$
    BEGIN
        CASE op_type
            WHEN 'I' THEN INSERT INTO cidadao(id, nome, email, senha, status, created_at, updated_at) VALUES (p_id, p_nome, p_email, p_senha, 'ativo', NOW(), NOW());
            WHEN 'A' THEN UPDATE cidadao SET nome = p_nome, updated_at = NOW() WHERE id = p_id;
            WHEN 'E' THEN UPDATE cidadao SET status = 'inativo', updated_at = NOW() WHERE id = p_id;
            WHEN 'C' THEN RAISE NOTICE 'Consulta no cidadão %', p_id;
            ELSE RAISE EXCEPTION 'Operação inválida!';
        END CASE;
    END; $$;
    """)

    op.execute("""
    CREATE OR REPLACE PROCEDURE crud_orgao(op_type CHAR(1), p_id uuid, p_nome text DEFAULT NULL)
    LANGUAGE plpgsql AS $$
    BEGIN
        CASE op_type
            WHEN 'I' THEN INSERT INTO orgao(id, nome, status, created_at, updated_at) VALUES (p_id, p_nome, 'ativo', NOW(), NOW());
            WHEN 'A' THEN UPDATE orgao SET nome = p_nome, updated_at = NOW() WHERE id = p_id;
            WHEN 'E' THEN UPDATE orgao SET status = 'inativo', updated_at = NOW() WHERE id = p_id;
            WHEN 'C' THEN RAISE NOTICE 'Consulta no órgão %', p_id;
            ELSE RAISE EXCEPTION 'Operação inválida!';
        END CASE;
    END; $$;
    """)

    op.execute("""
    CREATE OR REPLACE PROCEDURE crud_fiscal(op_type CHAR(1), p_id uuid, p_matricula varchar(16) DEFAULT NULL, p_nome text DEFAULT NULL, p_email varchar(255) DEFAULT NULL, p_senha varchar(200) DEFAULT NULL)
    LANGUAGE plpgsql AS $$
    BEGIN
        CASE op_type
            WHEN 'I' THEN INSERT INTO fiscal(id, matricula, nome, email, senha, status, created_at, updated_at) VALUES (p_id, p_matricula, p_nome, p_email, p_senha, 'ativo', NOW(), NOW());
            WHEN 'A' THEN UPDATE fiscal SET nome = p_nome, updated_at = NOW() WHERE id = p_id;
            WHEN 'E' THEN UPDATE fiscal SET status = 'inativo', updated_at = NOW() WHERE id = p_id;
            WHEN 'C' THEN RAISE NOTICE 'Consulta no fiscal %', p_id;
            ELSE RAISE EXCEPTION 'Operação inválida!';
        END CASE;
    END; $$;
    """)



    op.execute("""
    CREATE OR REPLACE FUNCTION fn_valida_nome_bairro() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
        IF LENGTH(TRIM(NEW.nome)) < 2 THEN RAISE EXCEPTION 'Nome do bairro muito curto!'; END IF;
        RETURN NEW;
    END; $$;
    """)
    op.execute("CREATE TRIGGER tr_val_bairro BEFORE INSERT OR UPDATE ON bairro FOR EACH ROW EXECUTE FUNCTION fn_valida_nome_bairro();")

    op.execute("""
    CREATE OR REPLACE FUNCTION fn_valida_senha_cidadao() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
        IF LENGTH(NEW.senha) < 6 THEN RAISE EXCEPTION 'A senha precisa ter no mínimo 6 caracteres!'; END IF;
        RETURN NEW;
    END; $$;
    """)
    op.execute("CREATE TRIGGER tr_val_senha_cidadao BEFORE INSERT OR UPDATE ON cidadao FOR EACH ROW EXECUTE FUNCTION fn_valida_senha_cidadao();")

    op.execute("""
    CREATE OR REPLACE FUNCTION fn_valida_custo_intervencao() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
        IF NEW.custo_estimado < 0 THEN RAISE EXCEPTION 'O custo estimado não pode ser negativo!'; END IF;
        RETURN NEW;
    END; $$;
    """)
    op.execute("CREATE TRIGGER tr_val_custo BEFORE INSERT OR UPDATE ON intervencao FOR EACH ROW EXECUTE FUNCTION fn_valida_custo_intervencao();")

    op.execute("""
    CREATE OR REPLACE FUNCTION fn_valida_membros_equipe() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
        IF NEW.quantidade_membros <= 0 THEN RAISE EXCEPTION 'Uma equipe precisa ter ao menos 1 membro!'; END IF;
        RETURN NEW;
    END; $$;
    """)
    op.execute("CREATE TRIGGER tr_val_membros BEFORE INSERT OR UPDATE ON equipe_manutencao FOR EACH ROW EXECUTE FUNCTION fn_valida_membros_equipe();")



    op.execute("""
    CREATE TABLE IF NOT EXISTS auditoria_sistema (
        id SERIAL PRIMARY KEY,
        tabela TEXT,
        acao TEXT,
        usuario TEXT DEFAULT current_user,
        ip_origem INET DEFAULT inet_client_addr(),
        data_registro TIMESTAMP DEFAULT now(),
        dados_novos JSONB
    );
    """)

    op.execute("""
    CREATE OR REPLACE FUNCTION fn_audita_alteracoes() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN
        INSERT INTO auditoria_sistema(tabela, acao, dados_novos)
        VALUES (TG_TABLE_NAME, TG_OP, to_jsonb(NEW));
        RETURN NEW;
    END; $$;
    """)
    op.execute("CREATE TRIGGER tr_audit_cidadao AFTER INSERT OR UPDATE OR DELETE ON cidadao FOR EACH ROW EXECUTE FUNCTION fn_audita_alteracoes();")
    op.execute("CREATE TRIGGER tr_audit_ocorrencia AFTER INSERT OR UPDATE OR DELETE ON ocorrencia FOR EACH ROW EXECUTE FUNCTION fn_audita_alteracoes();")



    op.execute("""
    CREATE OR REPLACE FUNCTION f_total_ocorrencias_bairro(p_id_bairro uuid)
    RETURNS integer LANGUAGE plpgsql AS $$
    DECLARE total integer;
    BEGIN
        SELECT COUNT(o.id) INTO total
        FROM ocorrencia o
        JOIN obstaculo ob ON o.id_obstaculo = ob.id
        JOIN rua r ON ob.id_rua = r.id
        WHERE r.id_bairro = p_id_bairro;
        RETURN COALESCE(total, 0);
    END; $$;
    """)

    op.execute("""
    CREATE OR REPLACE FUNCTION f_custo_total_intervencoes_orgao(p_id_orgao uuid)
    RETURNS numeric LANGUAGE plpgsql AS $$
    DECLARE custo_total numeric(10,2);
    BEGIN
        SELECT SUM(i.custo_estimado) INTO custo_total
        FROM intervencao i
        JOIN equipe_manutencao eq ON i.id_equipe = eq.id
        WHERE eq.id_orgao = p_id_orgao;
        RETURN COALESCE(custo_total, 0.00);
    END; $$;
    """)



    op.execute("""
    CREATE OR REPLACE VIEW v_dashboard_bairros_criticos AS
    SELECT b.nome AS bairro, COUNT(o.id) AS total_ocorrencias
    FROM bairro b
    JOIN rua r ON r.id_bairro = b.id
    JOIN obstaculo ob ON ob.id_rua = r.id
    JOIN ocorrencia o ON o.id_obstaculo = ob.id
    GROUP BY b.nome;
    """)

    op.execute("""
    CREATE OR REPLACE VIEW v_resumo_financeiro_orgao AS
    SELECT org.nome AS orgao, COUNT(i.id) AS total_intervencoes, SUM(i.custo_estimado) AS investimento_total
    FROM orgao org
    JOIN equipe_manutencao eq ON eq.id_orgao = org.id
    JOIN intervencao i ON i.id_equipe = eq.id
    GROUP BY org.nome;
    """)

    op.execute("""
    CREATE OR REPLACE VIEW v_eficiencia_fiscais AS
    SELECT f.nome AS fiscal, f.matricula, COUNT(v.id) AS vistorias_realizadas
    FROM fiscal f
    JOIN vistoria v ON v.id_fiscal = f.id
    GROUP BY f.nome, f.matricula;
    """)



    op.execute("DROP ROLE IF EXISTS role_admin, role_fiscal, role_cidadao;")
    op.execute("CREATE ROLE role_admin; CREATE ROLE role_fiscal; CREATE ROLE role_cidadao;")
    
    op.execute("GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO role_admin;")
    op.execute("GRANT SELECT, INSERT, UPDATE ON TABLE vistoria, ocorrencia, obstaculo TO role_fiscal;")
    op.execute("GRANT SELECT, INSERT ON TABLE ocorrencia, imagem TO role_cidadao;")


def downgrade() -> None:
    pass