import React from 'react';
import githubLogo from '../assets/GitHub-logo.png';
import imgLuis from '../assets/luis.png';
import imgLucas from '../assets/lucas.jpeg';
import imgCristian from '../assets/cristian.jpeg';
import imgRafael from '../assets/rafael.jpg';
import { BookOpen, Award, Sparkles, Target, Users } from 'lucide-react';

export default function Sobre() {
  const devs = [
    { nome: 'Luis Jackson', github: 'https://github.com/Luisjackson', cargo: 'BBA & API', foto: imgLuis },
    { nome: 'Lucas Silva', github: 'https://github.com/Lucasdias79931', cargo: 'Banco de Dados & Queries', foto: imgLucas },
    { nome: 'Cristian Amor', github: 'https://github.com/ScoobyTT', cargo: 'Arquitetura & Front-End', foto: imgCristian },
    { nome: 'Rafael Santana', github: 'https://github.com/rssantan4', cargo: 'Modelagem & Infraestrutura', foto: imgRafael }
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title} className="gradient-text">Sobre o Caminho Seguro</h2>
        <p style={styles.subtitle}>Conheça o propósito do projeto, a fundamentação científica e os desenvolvedores</p>
      </div>

      {/* Grid de Informações */}
      <div style={styles.infoGrid}>
        
        {/* Card do Propósito */}
        <div className="glass-card" style={styles.cardInfo}>
          <div style={styles.iconHeader}>
            <div style={styles.iconCircle}>
              <Target size={22} color="#06b6d4" />
            </div>
            <h3 style={styles.cardTitle}>Propósito do Aplicativo</h3>
          </div>
          <p style={styles.cardText}>
            O <strong>Caminho Seguro</strong> é um ecossistema open-source orientado à resolução de barreiras de infraestrutura urbana na mobilidade a pé. O sistema permite registrar, classificar, analisar e priorizar problemas graves em calçadas (como buracos, falta de piso tátil, degraus e postes inadequados), servindo como suporte analítico para a tomada de decisão da gestão pública.
          </p>
        </div>

        {/* Card ODS */}
        <div className="glass-card" style={styles.cardInfo}>
          <div style={styles.iconHeader}>
            <div style={styles.iconCircle}>
              <Sparkles size={22} color="#10b981" />
            </div>
            <h3 style={styles.cardTitle}>Alinhamento com a Agenda 2030 ONU</h3>
          </div>
          <p style={styles.cardText}>
            Totalmente alinhado à <strong>ODS 11 (Cidades e Comunidades Sustentáveis)</strong>, que busca tornar as cidades inclusivas, resilientes e seguras. Também atua diretamente na <strong>ODS 10 (Redução das Desigualdades)</strong>, ao atenuar o impacto desproporcional da má conservação urbana sobre grupos vulneráveis como cadeirantes, idosos e pessoas com baixa visão.
          </p>
        </div>

        {/* Card Acadêmico */}
        <div className="glass-card" style={styles.cardInfo}>
          <div style={styles.iconHeader}>
            <div style={styles.iconCircle}>
              <BookOpen size={22} color="#3b82f6" />
            </div>
            <h3 style={styles.cardTitle}>Disciplina & Metodologia</h3>
          </div>
          <p style={styles.cardText}>
            Desenvolvido como projeto laboratorial da disciplina de <strong>Banco de Dados II</strong>, utilizando a metodologia <i>Problem-Based Learning (PBL)</i>. A plataforma conta com arquitetura de alta performance que modela de forma eficiente entidades complexas de vistorias, fiscais, equipes de reparo físico e rotas urbanas.
          </p>
        </div>

      </div>

      {/* Seção Desenvolvedores */}
      <div style={styles.devsSection}>
        <div style={styles.devsHeader}>
          <Users size={24} color="#06b6d4" style={{ marginRight: '10px' }} />
          <h3 style={styles.devsTitle}>Equipe de Desenvolvimento</h3>
        </div>
        
        <div style={styles.devsGrid}>
          {devs.map((dev, idx) => (
            <div key={idx} className="glass-card" style={styles.devCard}>
              <div style={styles.avatar}>
                <img src={dev.foto} alt={dev.nome} style={styles.avatarImg} />
              </div>
              <h4 style={styles.devName}>{dev.nome}</h4>
              <p style={styles.devCargo}>{dev.cargo}</p>
              
              <a 
                href={dev.github} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={styles.gitLink}
                title={`Ver GitHub de ${dev.nome}`}
              >
                <img src={githubLogo} alt="GitHub" style={styles.gitLogo} />
                <span>Acessar Perfil</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  header: {
    marginBottom: '8px',
  },
  title: {
    fontSize: '28px',
    marginBottom: '4px',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '14px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  cardInfo: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    minHeight: '240px',
  },
  iconHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconCircle: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: '18px',
    color: '#f8fafc',
    fontWeight: '600',
  },
  cardText: {
    color: '#94a3b8',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  devsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginTop: '16px',
  },
  devsHeader: {
    display: 'flex',
    alignItems: 'center',
  },
  devsTitle: {
    fontSize: '20px',
    color: '#f8fafc',
    fontWeight: '600',
  },
  devsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
  },
  devCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '24px 16px',
    gap: '12px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  avatar: {
    width: '76px',
    height: '76px',
    borderRadius: '50%',
    border: '2px solid rgba(6, 182, 212, 0.3)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
    boxShadow: '0 8px 24px -8px rgba(6, 182, 212, 0.5)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  devName: {
    fontSize: '16px',
    color: '#f8fafc',
    fontWeight: '600',
  },
  devCargo: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500',
  },
  gitLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '10px 16px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    color: '#cbd5e1',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '600',
    width: '100%',
    marginTop: '8px',
    transition: 'all 0.2s ease',
  },
  gitLogo: {
    width: '18px',
    height: '18px',
    objectFit: 'contain',
    filter: 'invert(1)',
  },
};
