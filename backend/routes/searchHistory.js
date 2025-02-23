import express from 'express';
import SearchHistory from '../models/SearchHistory.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Save search history
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received request to save search history');
    const userId = req.user.userId || req.user.id;
    console.log('User ID:', userId);
    console.log('Request body:', req.body);

    const { symptoms, analysis } = req.body;
    
    // Validate required fields
    if (!symptoms || !analysis) {
      console.error('Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Ensure symptoms is an array
    const symptomsArray = Array.isArray(symptoms) ? symptoms : [symptoms];

    // Create search history entry
    const searchHistory = new SearchHistory({
      userId: userId,
      symptoms: symptomsArray,
      analysis: {
        analysis: {
          conditions: analysis.analysis.conditions || [],
          recommendations: analysis.analysis.recommendations || [],
          urgency: analysis.analysis.urgency || 'UNKNOWN'
        },
        rawResponse: analysis.rawResponse || ''
      }
    });

    console.log('Created search history object:', searchHistory);

    await searchHistory.save();
    console.log('Successfully saved search history');

    res.json(searchHistory);
  } catch (error) {
    console.error('Error saving search history:', error);
    res.status(500).json({ error: 'Error saving search history', details: error.message });
  }
});

// Get user's search history
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    console.log('Fetching search history for user:', userId);
    
    const history = await SearchHistory.find({ userId: userId })
      .sort({ timestamp: -1 })
      .limit(10);
    
    console.log('Found history items:', history.length);
    res.json(history);
  } catch (error) {
    console.error('Error fetching search history:', error);
    res.status(500).json({ error: 'Error fetching search history' });
  }
});

// Delete search history entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    console.log('Deleting history item:', req.params.id);
    console.log('User ID:', userId);

    const history = await SearchHistory.findOneAndDelete({ 
      _id: req.params.id,
      userId: userId
    });

    if (!history) {
      console.log('History item not found');
      return res.status(404).json({ error: 'History not found' });
    }

    console.log('Successfully deleted history item');
    res.json({ message: 'History deleted' });
  } catch (error) {
    console.error('Error deleting search history:', error);
    res.status(500).json({ error: 'Error deleting search history' });
  }
});

export default router;