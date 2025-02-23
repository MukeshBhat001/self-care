import { createContext, useContext, useState, useEffect } from 'react';
import config from '../config';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserProfile(token);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserProfile = async (token) => {
        try {
            const response = await fetch(`${config.apiUrl}/api/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const userData = await response.json();
                console.log('Fetched user profile:', userData);
                setUser({
                    ...userData,
                    id: userData._id || userData.id  // Ensure we have an id field
                });
            } else {
                console.error('Failed to fetch profile:', await response.text());
                localStorage.removeItem('token');
                setUser(null);
            }
        } catch (err) {
            console.error('Error fetching user profile:', err);
            setError(err.message);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await fetch(`${config.apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            console.log('Login response:', data);

            // Ensure we have a token and user data
            if (!data.token || !data.user) {
                throw new Error('Invalid server response - missing token or user data');
            }

            // Store token
            localStorage.setItem('token', data.token);

            // Ensure user object has an id field
            const userData = {
                ...data.user,
                id: data.user._id || data.user.id
            };

            setUser(userData);
            return { token: data.token, user: userData };
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message);
            throw err;
        }
    };

    const register = async (username, email, password, age, gender) => {
        try {
            const response = await fetch(`${config.apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    username, 
                    email, 
                    password,
                    age: parseInt(age),
                    gender 
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Ensure we have a token and user data
            if (!data.token || !data.user) {
                throw new Error('Invalid server response - missing token or user data');
            }

            // Store token
            localStorage.setItem('token', data.token);

            // Ensure user object has an id field
            const userData = {
                ...data.user,
                id: data.user._id || data.user.id
            };

            setUser(userData);
            return { token: data.token, user: userData };
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message);
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
