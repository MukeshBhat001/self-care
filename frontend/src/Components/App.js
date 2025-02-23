import React from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Home from './Home/Home';
import Auth from './Auth/Auth';
import Profile from './Profile/Profile';
import { MdLocalHospital, MdMedicalServices, MdShare, MdSearch } from 'react-icons/md';

const Container = styled.div`
  /* Add styles here */
`;

const EmergencySection = styled.div`
  /* Add styles here */
`;

const Title = styled.h1`
  /* Add styles here */
`;

const ButtonsContainer = styled.div`
  /* Add styles here */
`;

const StyledButton = styled.button`
  /* Add styles here */
`;

const Card = styled.div`
  /* Add styles here */
`;

const ContactCard = styled.div`
  /* Add styles here */
`;

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" />;
};

const App = () => {
  const handleHospitalSearch = () => {
    window.open('https://www.google.com/maps/search/hospitals+near+me', '_blank');
  };

  const handlePractoSearch = () => {
    window.open('https://www.practo.com', '_blank');
  };

  const recommendations = [
    'Rest in a quiet, dark room.',
    'Apply a cold compress to your head or neck.',
    'Take over-the-counter pain medication, such as ibuprofen or acetaminophen.',
    'Get regular exercise.',
    'Manage stress levels.'
  ];

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/emergency" element={
            <Container>
              <EmergencySection>
                <Title>
                  <MdShare style={{ marginRight: '8px' }} /> Emergency Services
                  <span style={{ 
                    backgroundColor: '#dc3545',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    marginLeft: '10px'
                  }}>
                    URGENT CARE NEEDED
                  </span>
                </Title>

                <ButtonsContainer>
                  <StyledButton
                    style={{ backgroundColor: '#2196f3' }}
                    onClick={handleHospitalSearch}
                  >
                    <MdLocalHospital size={20} /> Find Nearby Hospitals
                  </StyledButton>
                  <StyledButton
                    style={{ backgroundColor: '#00b894' }}
                    onClick={handlePractoSearch}
                  >
                    <MdSearch size={20} /> Search on Practo
                  </StyledButton>
                </ButtonsContainer>
              </EmergencySection>

              <Card>
                <Title>Emergency Contacts</Title>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                  <ContactCard>
                    <MdMedicalServices style={{ fontSize: 40, marginBottom: 10 }} />
                    <Title>Ambulance</Title>
                    <Title>102</Title>
                  </ContactCard>
                  <ContactCard>
                    <MdShare style={{ fontSize: 40, marginBottom: 10 }} />
                    <Title>Emergency</Title>
                    <Title>108</Title>
                  </ContactCard>
                </div>
              </Card>
            </Container>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
