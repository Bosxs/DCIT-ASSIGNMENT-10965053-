const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
const port = process.env.PORT || 3000;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school';

console.log(`Connecting to MongoDB at ${MONGODB_URI}`);
mongoose.set('strictQuery', true);
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB successfully');
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  });

// Student schema
const studentSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  class: {
    type: String,
    required: true
  }
});

const Student = mongoose.model('Student', studentSchema);

// Middleware to validate student data before savaing to the database
const validateStudentData = (req, res, next) => {
  const { rollNumber, name, age, class: studentClass } = req.body || {};

  if (!rollNumber || !name || !age || !studentClass) {
    return res.status(400).json({ message: 'Roll number, name, age, and class are required fields' });
  }

  next();
};



// Route for creating a new student
app.post('/students', validateStudentData, async (req, res) => {
  const { rollNumber, name, age, class: studentClass } = req.body;

  try {
    if (!rollNumber) {
      throw new Error("Cannot destructure property 'rollNumber' of 'req.body' as it is undefined");
    }

    const student = await Student.create({ rollNumber, name, age, class: studentClass });
    res.status(201).json(student);
  } catch (error) {
    console.error('Error creating student:', error.message);
    res.status(500).json({ message: error.message });
  }
});




// Route for getting a student by ID
app.get('/students/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findById(id);

    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving student' });
  }
});

