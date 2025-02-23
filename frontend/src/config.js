const config = {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5200',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE'
};

export default config;
