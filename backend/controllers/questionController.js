const fs = require('fs');
const path = require('path');

// In-memory storage for results (in a real app, this would be a database)
let gameResults = [];

exports.getQuestions = (req, res) => {
  try {
    // Read questions from JSON file
    const questionsData = fs.readFileSync(
      path.join(__dirname, '../data/questions.json'),
      'utf8'
    );
    const questions = JSON.parse(questionsData);

    // Shuffle the questions array
    const shuffledQuestions = questions.questions.sort(() => Math.random() - 0.5);

    // Return shuffled questions
    res.status(200).json({
      message: 'Questions retrieved successfully',
      questions: shuffledQuestions
    });
  } catch (error) {
    console.error('Error reading questions:', error);
    res.status(500).json({ message: 'Error retrieving questions' });
  }
};

exports.uploadQuestions = (req, res) => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: 'Invalid questions format' });
    }

    // Validate question format
    const isValidFormat = questions.every(q => 
      q.question && 
      Array.isArray(q.answers) && 
      q.answers.length >= 2 && 
      q.answers.some(a => a.correct)
    );

    if (!isValidFormat) {
      return res.status(400).json({ message: 'Invalid question format' });
    }

    // Save questions to file
    fs.writeFileSync(
      path.join(__dirname, '../data/questions.json'),
      JSON.stringify({ questions }, null, 2)
    );

    res.status(200).json({ message: 'Questions uploaded successfully' });
  } catch (error) {
    console.error('Error uploading questions:', error);
    res.status(500).json({ message: 'Error uploading questions' });
  }
};

exports.saveResult = (req, res) => {
  try {
    const { email, correctAnswers, totalQuestions } = req.body;

    if (!email || typeof correctAnswers !== 'number' || typeof totalQuestions !== 'number') {
      return res.status(400).json({ message: 'Invalid result format' });
    }

    const result = {
      email,
      correctAnswers,
      totalQuestions,
      timestamp: new Date()
    };

    gameResults.push(result);

    res.status(200).json({ message: 'Result saved successfully' });
  } catch (error) {
    console.error('Error saving result:', error);
    res.status(500).json({ message: 'Error saving result' });
  }
};

exports.getResults = (req, res) => {
  try {
    res.status(200).json(gameResults);
  } catch (error) {
    console.error('Error retrieving results:', error);
    res.status(500).json({ message: 'Error retrieving results' });
  }
};