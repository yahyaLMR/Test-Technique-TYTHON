require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');

const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/test-technique-tython';

const users = [
  {
    email: 'admin@example.com',
    password: 'Admin12345!',
    role: 'admin'
  },
  {
    email: 'staff1@example.com',
    password: 'Staff12345!',
    role: 'staff'
  },
  {
    email: 'staff2@example.com',
    password: 'Staff12345!',
    role: 'staff'
  }
];

const patients = [
  {
    name: 'Amina El Fassi',
    dateOfBirth: new Date('1991-04-12'),
    phone: '+212600000001',
    cin: 'AA100001',
    address: 'Casablanca'
  },
  {
    name: 'Youssef Berrada',
    dateOfBirth: new Date('1988-09-21'),
    phone: '+212600000002',
    cin: 'AA100002',
    address: 'Rabat'
  },
  {
    name: 'Sara El Idrissi',
    dateOfBirth: new Date('1996-01-08'),
    phone: '+212600000003',
    cin: 'AA100003',
    address: 'Marrakech'
  },
  {
    name: 'Omar Amrani',
    dateOfBirth: new Date('1985-11-30'),
    phone: '+212600000004',
    cin: 'AA100004',
    address: 'Tanger'
  },
  {
    name: 'Nadia Karim',
    dateOfBirth: new Date('1993-06-17'),
    phone: '+212600000005',
    cin: 'AA100005',
    address: 'Fes'
  }
];

const appointmentTemplates = [
  { patientIndex: 0, status: 'pending', daysFromNow: 1, reason: 'Annual checkup' },
  { patientIndex: 1, status: 'confirmed', daysFromNow: 2, reason: 'Follow-up consultation' },
  { patientIndex: 2, status: 'cancelled', daysFromNow: 3, reason: 'Lab results review' },
  { patientIndex: 3, status: 'pending', daysFromNow: 4, reason: 'Back pain assessment' },
  { patientIndex: 4, status: 'confirmed', daysFromNow: 5, reason: 'Blood pressure control' },
  { patientIndex: 0, status: 'cancelled', daysFromNow: 6, reason: 'Dermatology appointment' },
  { patientIndex: 1, status: 'pending', daysFromNow: 7, reason: 'Vaccination visit' },
  { patientIndex: 2, status: 'confirmed', daysFromNow: 8, reason: 'Diabetes follow-up' },
  { patientIndex: 3, status: 'pending', daysFromNow: 9, reason: 'Routine consultation' },
  { patientIndex: 4, status: 'cancelled', daysFromNow: 10, reason: 'Nutrition review' }
];

async function seed() {
  await mongoose.connect(connectionString);

  try {
    await Promise.all([
      User.deleteMany({}),
      Patient.deleteMany({}),
      Appointment.deleteMany({})
    ]);

    const createdUsers = await User.create(users);
    const createdPatients = await Patient.create(patients);

    const today = new Date();
    const appointments = appointmentTemplates.map((template) => ({
      patientId: createdPatients[template.patientIndex]._id,
      appointmentDate: new Date(today.getTime() + template.daysFromNow * 24 * 60 * 60 * 1000),
      status: template.status,
      reason: template.reason,
      notes: `Seeded appointment for ${createdPatients[template.patientIndex].name}`,
      followUpRequired: template.status === 'confirmed'
    }));

    await Appointment.create(appointments);

    console.log('Seed completed successfully.');
    console.log(`Created ${createdUsers.length} users, ${createdPatients.length} patients, and ${appointments.length} appointments.`);
  } finally {
    await mongoose.connection.close();
  }
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});