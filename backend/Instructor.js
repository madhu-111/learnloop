import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 5000;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'uploads')));  // Serve uploaded files

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/instructorSignup', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected')).catch(err => console.log(err));

// Define Mongoose Schema for Instructor
const instructorSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    adminID: String,
    email: String,
    dob: Date,
    phone: String,
    gender: String,
    specialization: String,
    address: String,
    city: String,
    pinCode: String,
    country: String,
    education: String,
    experience: String,
    photo: String
});

const Instructor = mongoose.model('Instructor', instructorSchema);

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));  // Save files in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Use timestamp as file name
    }
});
const upload = multer({ storage: storage });

// Instructor Signup Route
app.post('/api/ins_signup', upload.single('photo'), async (req, res) => {
    try {
        const { first_name, last_name, admin_id, email, dob, phone, gender, specialization, address, city, pin_code, country, education, experience } = req.body;
        const photo = req.file ? req.file.filename : '';

        const newInstructor = new Instructor({
            firstName: first_name,
            lastName: last_name,
            adminID: admin_id,
            email,
            dob,
            phone,
            gender,
            specialization,
            address,
            city,
            pinCode: pin_code,
            country,
            education,
            experience,
            photo
        });

        await newInstructor.save();
        res.status(201).json({ message: 'Instructor registered successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering instructor', error });
    }
});

// Fetch all instructors
app.get('/api/instructors', async (req, res) => {
    try {
        const instructors = await Instructor.find();
        res.status(200).json(instructors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching instructors', error });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
