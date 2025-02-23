import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        age: '',
        gender: ''
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    const { login, register } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
                navigate('/');
            } else {
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    return;
                }
                await register(formData.username, formData.email, formData.password, formData.age, formData.gender);
                setSuccessMessage('Registration successful! Please login with your credentials.');
                // Clear form and switch to login mode
                setFormData({
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    age: '',
                    gender: ''
                });
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setSuccessMessage('');
        setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            age: '',
            gender: ''
        });
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>{isLogin ? 'Login' : 'Register'}</h2>
                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label>Username:</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required={!isLogin}
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {!isLogin && (
                        <>
                            <div className="form-group">
                                <label>Confirm Password:</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required={!isLogin}
                                />
                            </div>
                            <div className="form-group">
                                <label>Age:</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    min="0"
                                    max="120"
                                    required={!isLogin}
                                />
                            </div>
                            <div className="form-group">
                                <label>Gender:</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required={!isLogin}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer_not_to_say">Prefer not to say</option>
                                </select>
                            </div>
                        </>
                    )}
                    <button type="submit" className="auth-button">
                        {isLogin ? 'Login' : 'Register'}
                    </button>
                </form>
                <button onClick={toggleMode} className="auth-btn">
                    {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
                </button>
            </div>
        </div>
    );
};

export default Auth;
