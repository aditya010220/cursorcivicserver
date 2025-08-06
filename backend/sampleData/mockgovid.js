import mongoose from 'mongoose';
import MockGovId from '../models/mockGovId.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civic')
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => console.error('MongoDB connection error:', err));

// Generate random string of digits
const generateRandomDigits = (length) => {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
};

// Generate random Aadhaar number (12 digits)
const generateAadhaarNumber = () => generateRandomDigits(12);

// Generate random PAN (10 alphanumeric characters)
const generatePanNumber = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const randomLetter = () => letters.charAt(Math.floor(Math.random() * letters.length));
  
  // Format: AAAAA0000A (5 letters, 4 digits, 1 letter)
  return [
    randomLetter(), randomLetter(), randomLetter(), randomLetter(), randomLetter(),
    generateRandomDigits(4),
    randomLetter()
  ].join('');
};

// Random date between two dates
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Sample Indian names
const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Reyansh', 'Muhammad', 'Sai', 'Arnav', 'Ayaan',
  'Aisha', 'Diya', 'Ananya', 'Saanvi', 'Pari', 'Kiara', 'Myra', 'Aadhya', 'Aarohi', 'Anvi'
];

const lastNames = [
  'Sharma', 'Verma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Joshi', 'Rao', 'Reddy', 'Nair',
  'Chauhan', 'Shah', 'Mehta', 'Desai', 'Iyer', 'Agarwal', 'Kaur', 'Khan', 'Das', 'Patil'
];

// Sample Indian cities, states and pincodes
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Pune', 'Jaipur', 'Lucknow'];
const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Kerala'];
const streetNames = ['Gandhi Road', 'Nehru Street', 'Patel Nagar', 'MG Road', 'Subhash Marg', 'Rajiv Chowk', 'Sarojini Road', 'Ambedkar Avenue', 'Tagore Lane', 'Bhagat Singh Marg'];

// Generate a random mock govt ID
const generateMockGovId = (index) => {
  const idType = Math.random() > 0.5 ? 'aadhaar' : 'pan';
  const idNumber = idType === 'aadhaar' ? generateAadhaarNumber() : generatePanNumber();
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const fullName = `${firstName} ${lastName}`;
  
  const cityIndex = Math.floor(Math.random() * cities.length);
  const street = `${Math.floor(Math.random() * 100) + 1}, ${streetNames[Math.floor(Math.random() * streetNames.length)]}`;
  
  // DOB between 18 and 70 years ago
  const today = new Date();
  const minDate = new Date(today);
  minDate.setFullYear(today.getFullYear() - 70);
  const maxDate = new Date(today);
  maxDate.setFullYear(today.getFullYear() - 18);
  
  // Scenarios to distribute - mostly success but some error cases
  const scenarios = ['success', 'success', 'success', 'success', 'success', 
                    'success', 'success', 'address_mismatch', 'expired', 'not_found', 'server_error'];
  const mockScenario = scenarios[Math.floor(Math.random() * scenarios.length)];

  return {
    idNumber,
    idType,
    fullName,
    dateOfBirth: randomDate(minDate, maxDate),
    gender: Math.random() > 0.5 ? (Math.random() > 0.5 ? 'male' : 'female') : 'other',
    address: {
      street,
      city: cities[cityIndex],
      state: states[cityIndex],
      pincode: `${Math.floor(Math.random() * 900000) + 100000}`,
      country: 'India'
    },
    isActive: Math.random() > 0.1, // 90% active
    mockVerificationScenario: mockScenario,
    // Some IDs might be expired
    issuedDate: mockScenario === 'expired' 
      ? randomDate(new Date(2000, 0, 1), new Date(2010, 0, 1))
      : randomDate(new Date(2010, 0, 1), new Date(2020, 0, 1)),
    expiryDate: mockScenario === 'expired'
      ? randomDate(new Date(2015, 0, 1), new Date(2022, 0, 1))
      : randomDate(new Date(2025, 0, 1), new Date(2030, 0, 1))
  };
};

// Seed the database with mock govt IDs
const seedMockGovIds = async (count = 100) => {
  try {
    // Clear existing data
    await MockGovId.deleteMany({});
    console.log('Cleared existing mock IDs');

    // Create mock data
    const mockData = Array.from({ length: count }, (_, i) => generateMockGovId(i));
    
    // Insert into database
    const result = await MockGovId.insertMany(mockData);
    console.log(`Successfully seeded ${result.length} mock government IDs`);
    
    // Output some examples for testing
    console.log('\nSample IDs for testing:');
    for (let i = 0; i < 5; i++) {
      const sample = result[i];
      console.log(`${sample.idType.toUpperCase()}: ${sample.idNumber} | Name: ${sample.fullName} | Scenario: ${sample.mockVerificationScenario}`);
    }
    
    mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.disconnect();
  }
};

// Execute seeding with 100 mock IDs
seedMockGovIds();

// Export for potential use in other scripts
export default seedMockGovIds;