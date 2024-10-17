const Assessment = require("../model/assessment");

async function submitAssessment(req, res) {
   try {
      // Create a new assessment instance from the request body
      const newAssessment = new Assessment({
         userId: req.params.userId,
         ageGroup: req.body.ageGroup,
         questions: req.body.questions
      });

      // Save the new assessment to the database
      const savedAssessment = await newAssessment.save();

      // Return the saved assessment as a response
      res.status(201).json(savedAssessment);
   } catch (err) {
      console.error('Error saving assessment:', err);
      res.status(500).json({ message: 'Error saving assessment', error: err.message });
   }
}