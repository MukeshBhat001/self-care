import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {
    try {
        console.log('Auth middleware - Headers:', req.headers);
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            console.log('No token found in request');
            throw new Error('No token provided');
        }

        console.log('Token before verification:', token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);

        if (!decoded.id) {
            console.log('No ID found in decoded token');
            throw new Error('Invalid token structure');
        }

        // Set both id and userId for compatibility
        req.user = {
            id: decoded.id,
            userId: decoded.id
        };
        console.log('Set user in request:', req.user);

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Please authenticate.', error: error.message });
    }
};

export default auth;
