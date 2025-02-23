import { useState, useEffect } from 'react';
import styled from "styled-components";
import { FaHospital, FaSearch, FaAmbulance, FaPhone } from "react-icons/fa";
import { MdLocalHospital, MdMedicalServices, MdShare, MdSearch } from 'react-icons/md';
import '../../styles/main.css';
import Navbar from '../Navbar/Navbar';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';

// Create axios instance with default config
const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request config:', config); // Debug log
    return config;
  },
  (error) => {
    console.error('Request error:', error); // Debug log
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response); // Debug log
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.data || error); // Debug log
    return Promise.reject(error);
  }
);

// Styled Components
const ConditionItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1.25rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  border-left: 4px solid #3b82f6;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background: #f8fafc;
  }
`;

const ConditionBullet = styled.span`
  color: #3b82f6;
  font-size: 1.25rem;
  margin-top: 2px;
  flex-shrink: 0;
`;

const ConditionContent = styled.div`
  flex: 1;
`;

const ConditionName = styled.div`
  font-weight: 600;
  color: #1e293b;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
`;

const ConditionDescription = styled.div`
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.6;
  white-space: pre-line;
  padding-right: 1rem;
`;

const Container = styled.div`
padding: 20px;
width: 100%;
margin: 0;
background-color: #1e2329;
min-height: 100vh;
color: white;
`;

const SeverityBanner = styled.div`
background-color: #dc3545;
color: white;
padding: 15px;
border-radius: 8px;
margin-bottom: 20px;
`;

const EmergencySection = styled.div`
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h3`
  display: flex;
  align-items: center;
  color: #333;
  margin-bottom: 20px;
  font-size: 1.5rem;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
`;

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const EmergencyTitle = styled.h2`
display: flex;
align-items: center;
gap: 10px;
font-size: 1.5rem;
margin-bottom: 1.5rem;
`;

const Badge = styled.span`
background-color: #dc3545;
padding: 4px 8px;
border-radius: 4px;
font-size: 0.8em;
color: white;
`;

const ContactsTitle = styled.h3`
color: white;
margin-bottom: 15px;
font-size: 1.2rem;
`;

const ContactsGrid = styled.div`
display: grid;
grid-template-columns: 1fr 1fr;
gap: 20px;
margin-top: 15px;
`;

const ContactCard = styled.div`
background-color: #ef5350;
color: white;
padding: 20px;
text-align: center;
cursor: pointer;
transition: transform 0.2s;
border-radius: 8px;

&:hover {
  transform: scale(1.02);
}

svg {
  font-size: 40px;
  margin-bottom: 10px;
}

h4 {
  font-size: 2rem;
  margin: 10px 0;
}

h6 {
  font-size: 1.1rem;
  margin: 5px 0;
}
`;

const RecommendationsList = styled.ul`
list-style-type: none;
padding: 0;
margin: 20px 0;
`;

const RecommendationItem = styled.li`
margin: 10px 0;
padding: 10px;
background-color: #2c3238;
border-radius: 8px;
display: flex;
align-items: center;
gap: 10px;
`;

const AnalysisSection = styled.section`
  &.loading {
    opacity: 0.7;
    pointer-events: none;
  }

  .analysis-results {
    background: white;
    border-radius: 15px;
    padding: 30px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin: 20px 0;
  }

  .analysis-card {
    background: white;
    border-radius: 12px;
    padding: 25px;
    margin: 20px 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 1px solid #e9ecef;

    h3 {
      color: #2c3e50;
      font-size: 1.2em;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #f8f9fa;

      .section-icon {
        color: #4a90e2;
      }
    }
  }

  .conditions-list {
    display: grid;
    gap: 20px;
    margin-top: 20px;
  }

  .recommendations-list {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;

    li {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 10px;
      color: #2c3e50;
      font-size: 0.95em;
      line-height: 1.6;
      border-left: 4px solid #4a90e2;
      transition: all 0.3s ease;

      &:hover {
        transform: translateX(5px);
        background: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      &:before {
        content: "•";
        color: #4a90e2;
        margin-right: 10px;
        font-weight: bold;
      }
    }
  }

  .general-advice-section {
    background: white;
    border-radius: 12px;
    padding: 25px;
    margin: 25px 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 1px solid #e9ecef;

    h3 {
      color: #2c3e50;
      font-size: 1.2em;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #f8f9fa;

      .section-icon {
        color: #4a90e2;
      }
    }

    .advice-content {
      background: #f8f9fa;
      border-radius: 10px;
      padding: 25px;
      margin-top: 15px;

      .raw-response {
        font-family: 'Roboto', sans-serif;
        white-space: pre-wrap;
        word-wrap: break-word;
        color: #2c3e50;
        font-size: 0.95em;
        line-height: 1.8;
        margin: 0;
        max-height: 400px;
        overflow-y: auto;

        &::-webkit-scrollbar {
          width: 8px;
        }

        &::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        &::-webkit-scrollbar-thumb {
          background: #4a90e2;
          border-radius: 4px;
          
          &:hover {
            background: #357abd;
          }
        }

        h1, h2, h3 {
          color: #2c3e50;
          margin-top: 20px;
          margin-bottom: 10px;
          font-weight: 600;
        }

        ul, ol {
          padding-left: 20px;
          margin: 10px 0;
        }

        li {
          margin: 8px 0;
        }

        p {
          margin: 10px 0;
        }
      }
    }
  }

  .reset-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 12px 25px;
    background: #e9ecef;
    border: none;
    border-radius: 8px;
    color: #495057;
    font-size: 1em;
    cursor: pointer;
    transition: all 0.3s ease;
    margin: 20px auto;
    width: fit-content;

    &:hover {
      background: #dee2e6;
      transform: translateY(-2px);
    }

    .reset-icon {
      font-size: 1.2em;
    }
  }
`;


function Home() {
  const { user } = useAuth();
  const [patientInfo, setPatientInfo] = useState({
    name: user ? user.username : '',
    age: user ? user.age : '',
    gender: user ? user.gender : ''
  });

  useEffect(() => {
    if (user) {
      setPatientInfo({
        name: user.username,
        age: user.age,
        gender: user.gender
      });
    }
  }, [user]);

  const [symptoms, setSymptoms] = useState([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [suggestions, setSuggestions] = useState([
    // General Symptoms
    'Fever',
    'Fatigue',
    'Weakness',
    'Headache',
    'Body aches',
    'Chills',
    'Night sweats',
    'Weight loss',
    'Weight gain',
    'Loss of appetite',
    
    // Respiratory Symptoms
    'Cough',
    'Shortness of breath',
    'Chest pain',
    'Wheezing',
    'Sore throat',
    'Runny nose',
    'Nasal congestion',
    'Sneezing',
    
    // Digestive Symptoms
    'Nausea',
    'Vomiting',
    'Diarrhea',
    'Constipation',
    'Abdominal pain',
    'Bloating',
    'Heartburn',
    'Loss of appetite',
    
    // Musculoskeletal Symptoms
    'Joint pain',
    'Muscle pain',
    'Back pain',
    'Neck pain',
    'Stiffness',
    'Swelling',
    
    // Neurological Symptoms
    'Dizziness',
    'Confusion',
    'Memory problems',
    'Tremors',
    'Numbness',
    'Tingling',
    'Balance problems',
    'Seizures',
    
    // Psychological Symptoms
    'Anxiety',
    'Depression',
    'Mood swings',
    'Sleep problems',
    'Irritability',
    'Stress',
    
    // Skin Symptoms
    'Rash',
    'Itching',
    'Hives',
    'Dry skin',
    'Bruising',
    'Changes in skin color',
    
    // Eye and Vision Symptoms
    'Blurred vision',
    'Eye pain',
    'Light sensitivity',
    'Red eyes',
    'Vision changes',
    
    // Ear Symptoms
    'Ear pain',
    'Hearing loss',
    'Ringing in ears',
    'Ear discharge',
    
    // Urinary Symptoms
    'Frequent urination',
    'Painful urination',
    'Blood in urine',
    'Urgency to urinate',
    
    // Cardiovascular Symptoms
    'Chest pain',
    'Heart palpitations',
    'High blood pressure',
    'Irregular heartbeat',
    'Swelling in legs'
  ]);

  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingStage, setLoadingStage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Input change:', { name, value });
    
    // Validate and transform input
    let processedValue = value;
    if (name === 'age') {
      processedValue = value === '' ? '' : parseInt(value);
      if (isNaN(processedValue) || processedValue < 0 || processedValue > 150) {
        return; // Invalid age
      }
    }

    setPatientInfo(prev => {
      const updated = {
        ...prev,
        [name]: processedValue
      };
      console.log('Updated patient info:', updated);
      return updated;
    });
  };

  // Reset form when user logs in/out
  useEffect(() => {
    if (user) {
      setPatientInfo({
        name: user.username,
        age: user.age,
        gender: user.gender
      });
    } else {
      setPatientInfo({
        name: '',
        age: '',
        gender: ''
      });
    }
  }, [user]);

  const handleHospitalSearch = () => {
    window.open('https://www.google.com/maps/search/hospitals+near+me', '_blank');
  };

  const handlePractoSearch = () => {
    window.open('https://www.practo.com', '_blank');
  };

  // Test API connection on component mount
  useEffect(() => {
    console.log('🔍 Testing API connection...');
    api.get('/api/test')
      .then(response => {
        console.log('✅ Server test successful:', response.data);
      })
      .catch(error => {
        console.error('❌ Server test failed:', error.message);
      });
  }, []);

  const handleSymptomInput = (e) => {
    const value = e.target.value;
    setSymptomInput(value);
    
    if (value.trim()) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase()) &&
        !symptoms.includes(suggestion)
      ).slice(0, 8); // Show max 8 suggestions
      setFilteredSuggestions(filtered);
    } else {
      // Show some common symptoms when input is empty
      const commonSuggestions = suggestions
        .filter(suggestion => !symptoms.includes(suggestion))
        .slice(0, 8);
      setFilteredSuggestions(commonSuggestions);
    }
  };

  const addSymptom = (symptom) => {
    if (symptom && !symptoms.includes(symptom)) {
      setSymptoms([...symptoms, symptom]);
    }
    setSymptomInput('');
    setFilteredSuggestions([]);
  };

  const removeSymptom = (index) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const handleAnalyzeSymptoms = async () => {
    console.log('Starting analysis with:', {
      user,
      patientInfo,
      symptoms
    });

    if (!symptoms.length) {
      setError('Please add at least one symptom');
      return;
    }

    // For logged-in users, ensure we have their info
    if (user && (!user.age || !user.gender)) {
      setError('Please update your profile with age and gender information');
      return;
    }

    // For non-logged-in users, check patient info
    if (!user && (!patientInfo.name || !patientInfo.age || !patientInfo.gender)) {
      console.log('Missing patient info:', {
        name: patientInfo.name,
        age: patientInfo.age,
        gender: patientInfo.gender
      });
      setError('Please fill in all patient information');
      return;
    }

    setError(null);
    setLoading(true);
    setLoadingStage('Analyzing symptoms...');

    try {
      const requestData = {
        patientInfo: user ? {
          name: user.username,
          age: parseInt(user.age),
          gender: user.gender
        } : {
          name: patientInfo.name,
          age: parseInt(patientInfo.age),
          gender: patientInfo.gender
        },
        symptoms
      };

      console.log('Sending request with data:', requestData);

      const response = await api.post('/api/analyze', requestData);
      console.log('Received response:', response.data);

      setLoadingStage('Finalizing analysis...');
      setAnalysis({
        analysis: {
          conditions: response.data.analysis.conditions,
          recommendations: response.data.analysis.recommendations,
          urgency: response.data.analysis.urgency
        },
        patientInfo: requestData.patientInfo,
        symptoms,
        rawResponse: response.data.rawResponse
      });

      // Save to search history
      if (user) {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('No token found in localStorage');
            return;
          }

          console.log('Token from localStorage:', token);
          console.log('Current user:', user);

          const historyData = {
            symptoms: Array.isArray(symptoms) ? symptoms : symptoms.split(',').map(s => s.trim()),
            analysis: {
              analysis: {
                conditions: response.data.analysis.conditions || [],
                recommendations: response.data.analysis.recommendations || [],
                urgency: response.data.analysis.urgency || 'UNKNOWN'
              },
              rawResponse: response.data.rawResponse || ''
            }
          };

          console.log('Saving search history:', historyData);
          
          const saveResponse = await api.post('/api/search-history', historyData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('Search history save response:', saveResponse.data);
        } catch (err) {
          console.error('Failed to save search history:', err);
          console.error('Error response:', err.response?.data);
          console.error('Error details:', {
            status: err.response?.status,
            headers: err.response?.headers,
            data: err.response?.data
          });
        }
      } else {
        console.log('No user found, skipping search history save');
      }
    } catch (err) {
      console.error('Analysis error:', {
        error: err,
        response: err.response?.data,
        patientInfo,
        symptoms
      });
      const errorMessage = err.response?.data?.message || err.message || 'Failed to analyze symptoms';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setError(null);
    setSymptoms([]);
    setPatientInfo({
      name: '',
      age: '',
      gender: ''
    });
  };

  return (
    <div className="app">
      <main className="main-content">
        <div className="container">
          {!user && (
            <section className="patient-info-section">
              <h2>Patient Information</h2>
              <form className="form-group" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={patientInfo.name || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={patientInfo.age || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                  max="150"
                  required
                />
                <select
                  name="gender"
                  value={patientInfo.gender || ''}
                  onChange={handleInputChange}
                  className="select-field"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </form>
              {(!patientInfo.name || !patientInfo.age || !patientInfo.gender) && (
                <div className="info-message">
                  Please fill in all patient information before analyzing symptoms
                </div>
              )}
            </section>
          )}

          <section className="symptoms-section">
            <h2>Symptoms</h2>
            <div className="symptom-input-container">
              <input
                type="text"
                value={symptomInput}
                onChange={handleSymptomInput}
                placeholder="Enter symptoms"
                className="input-field"
              />
              <button 
                onClick={() => addSymptom(symptomInput)}
                className="add-button"
                disabled={!symptomInput.trim()}
              >
                Add
              </button>
            </div>

            {filteredSuggestions.length > 0 && (
              <ul className="suggestions-list">
                {filteredSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => addSymptom(suggestion)}
                    className="suggestion-item"
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}

            <div className="symptoms-list">
              {symptoms.map((symptom, index) => (
                <div key={index} className="symptom-tag">
                  {symptom}
                  <button
                    onClick={() => removeSymptom(index)}
                    className="remove-button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              onClick={handleAnalyzeSymptoms}
              className="analyze-button"
              disabled={loading || !symptoms.length || (!user && (!patientInfo.name || !patientInfo.age || !patientInfo.gender))}
            >
              {loading ? 'Analyzing...' : 'Analyze Symptoms'}
            </button>
          </section>

          <AnalysisSection className={`analysis-section ${loading ? 'loading' : ''} ${analysis ? 'active' : ''}`}>
            {loading ? (
              <LoadingSpinner message={loadingStage || 'Analyzing your symptoms... This may take a few moments.'} />
            ) : analysis ? (
              <div className="analysis-results">
                <div className="analysis-header">
                  <div className="patient-summary">
                    <div className="patient-avatar">
                      {analysis.patientInfo.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="patient-details">
                      <h3>{analysis.patientInfo.name}</h3>
                      <p>{`${analysis.patientInfo.age} years old • ${analysis.patientInfo.gender}`}</p>
                    </div>
                  </div>
                  <div className="analysis-timestamp">
                    <span className="timestamp-icon">🕒</span>
                    {new Date().toLocaleString()}
                  </div>
                </div>

                <div className="reported-symptoms">
                  <h3>
                    <span className="section-icon">📝</span>
                    Reported Symptoms
                  </h3>
                  <div className="symptom-tags">
                    {analysis.symptoms.map((symptom, index) => (
                      <span key={index} className="symptom-tag">
                        <span className="symptom-icon">•</span>
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="analysis-grid">
                  <div className="analysis-card">
                    <h3>
                      <span className="section-icon">🔍</span>
                      Possible Conditions
                    </h3>
                    {analysis.analysis.conditions ? (
                      <ul className="conditions-list">
                        {analysis.analysis.conditions.split('\n').filter(line => line.trim().startsWith('*')).map((condition, index) => {
                          // Remove the leading asterisk and trim
                          const cleanCondition = condition.replace(/^\*\s*/, '').trim();
                          return (
                            <ConditionItem key={index}>
                              <ConditionBullet>•</ConditionBullet>
                              <ConditionContent>
                                <ConditionName>{cleanCondition}</ConditionName>
                              </ConditionContent>
                            </ConditionItem>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="no-data">No conditions identified</p>
                    )}
                  </div>

                  <div className="analysis-card">
                    <h3>
                      <span className="section-icon">🏥</span>
                      Find Medical Help
                    </h3>
                    <div className="hospital-finder">
                      <div className="action-buttons">
                        <button
                          className="hospital-button"
                          onClick={() => window.open('https://www.google.com/maps/search/hospitals+near+me', '_blank')}
                        >
                          <MdLocalHospital size={24} />
                          Find Nearby Hospitals
                        </button>

                        <button
                          className="doctor-button"
                          onClick={() => window.open('https://www.practo.com/doctors', '_blank')}
                        >
                          <MdMedicalServices size={24} />
                          Find & Consult Doctors
                        </button>
                      </div>

                      <div className="emergency-numbers">
                        <h4>Emergency Ambulance Numbers</h4>
                        <div className="phone-buttons">
                          <a href="tel:102" className="phone-button">
                            <FaPhone />
                            <span>102</span>
                            <small>Government Ambulance</small>
                          </a>
                          <a href="tel:1115" className="phone-button">
                            <FaPhone />
                            <span>1115</span>
                            <small>Nepal Ambulance Service</small>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="analysis-card">
                    <h3>
                      <span className="section-icon">🚨</span>
                      Urgency Level
                    </h3>
                    {analysis.analysis.urgency ? (
                      <div className="urgency-container">
                        <div className={`urgency-level ${analysis.analysis.urgency.toLowerCase()}`}>
                          {analysis.analysis.urgency}
                        </div>
                        {analysis.analysis.urgency.toLowerCase().includes('high') && (
                          <div className="emergency-section">
                            <div className="emergency-title">
                              <MdShare size={24} color="#dc3545" />
                              <h3>Emergency Services</h3>
                              <span className="emergency-badge">
                                URGENT CARE NEEDED
                              </span>
                            </div>

                            <div className="emergency-buttons">
                              <button
                                className="emergency-button hospital"
                                onClick={() => window.open('https://www.google.com/maps/search/hospitals+near+me', '_blank')}
                              >
                                <MdLocalHospital size={24} />
                                Find Nearby Hospitals
                              </button>
                              <button
                                className="emergency-button practo"
                                onClick={() => window.open('https://www.practo.com', '_blank')}
                              >
                                <MdSearch size={24} />
                                Search on Practo
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="no-data">No urgency level available</p>
                    )}
                  </div>

                  <div className="analysis-card">
                    <h3>
                      <span className="section-icon">💡</span>
                      Recommended Actions
                    </h3>
                    {analysis.analysis.recommendations ? (
                      <ul className="recommendations-list">
                        {analysis.analysis.recommendations.split('\n')
                          .filter(line => line.trim().startsWith('*'))
                          .map((recommendation, index) => (
                            <li key={index}>{recommendation.replace(/^\*\s*/, '').trim()}</li>
                          ))}
                      </ul>
                    ) : (
                      <p className="no-data">No recommendations available</p>
                    )}
                  </div>
                </div>

                <div className="general-advice-section">
                  <h3>
                    <span className="section-icon">📋</span>
                    Detailed Analysis
                  </h3>
                  <div className="advice-content">
                    <div className="raw-response">
                      {analysis && analysis.rawResponse 
                        ? analysis.rawResponse
                            .split('\n')
                            .map((line, index) => {
                              // Remove leading asterisks and trim
                              const cleanLine = line.replace(/^\*+\s*/, '').trim();
                              
                              // Skip empty lines
                              if (!cleanLine) return null;
                              
                              // Check if it's a section header
                              if (cleanLine.match(/^\d+\./)) {
                                return <h4 key={index}>{cleanLine}</h4>;
                              }
                              
                              // Regular line
                              return (
                                <div key={index} className="response-line">
                                  {cleanLine}
                                </div>
                              );
                            })
                            .filter(Boolean)
                            .reduce((acc, curr, idx) => {
                              return acc.concat(curr, <br key={`br-${idx}`} />);
                            }, [])
                        : 'No detailed analysis available'
                      }
                    </div>
                  </div>
                </div>

                <div className="disclaimer">
                  <div className="disclaimer-icon">⚠️</div>
                  <p>
                    This analysis is based on the symptoms provided and should not be considered as a definitive medical diagnosis. 
                    Please consult with a healthcare professional for proper medical advice and treatment.
                  </p>
                </div>

                <button onClick={resetAnalysis} className="reset-button">
                  <span className="reset-icon">↺</span>
                  Start New Analysis
                </button>
              </div>
            ) : null}
          </AnalysisSection>
        </div>
      </main>
    </div>
  );
}

export default Home;
