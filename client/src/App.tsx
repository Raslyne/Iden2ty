// src/App.tsx
import React from 'react';
import { Layout, Typography } from 'antd';
import BackendData from './components/BackendData'; // Asegúrate de que la ruta sea correcta
import './App.css'; // o tus estilos globales

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  return (
    <Layout className="layout">
      <Header>
        <div className="logo" /> {/* Puedes poner tu logo aquí */}
        <Title level={3} style={{ color: 'white', lineHeight: '64px', float: 'left' }}>
          Mi Aplicación FullStack
        </Title>
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content" style={{ background: '#fff', padding: 24, minHeight: 280, marginTop: '20px' }}>
          <Title level={2}>Conectando Frontend con Backend</Title>
          <BackendData /> {/* Aquí se muestra el componente */}
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Ant Design ©{new Date().getFullYear()} Created with React + Node.js
      </Footer>
    </Layout>
  );
};

export default App;