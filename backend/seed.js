/**
 * Seed script — populates the database with 2 test users and 3 sample incidents.
 * Run with: npm run seed
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import User from './models/User.js';
import Incident from './models/Incident.js';
import Evidence from './models/Evidence.js';

dotenv.config();

const seed = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany({});
  await Incident.deleteMany({});
  await Evidence.deleteMany({});
  console.log('Cleared existing data.');

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const analystPassword = await bcrypt.hash('analyst123', 10);

  const [admin, analyst] = await User.insertMany([
    {
      name: 'Alice Morgan',
      email: 'admin@cyberplatform.io',
      password: adminPassword,
      role: 'Admin',
    },
    {
      name: 'Bob Chen',
      email: 'analyst@cyberplatform.io',
      password: analystPassword,
      role: 'Analyst',
    },
  ]);

  console.log('Users created:', admin.email, analyst.email);

  // Create incidents
  const incidents = await Incident.insertMany([
    {
      incidentID: 'INC-1001',
      title: 'Ransomware Detected on Finance Workstation',
      description:
        'A ransomware payload was detected by endpoint protection on the Finance department workstation FIN-WS-042. Files in the Documents folder have been encrypted. Immediate isolation required.',
      category: 'Malware',
      severity: 'Critical',
      status: 'In Progress',
      affectedSystems: 'FIN-WS-042, Finance File Share',
      reportedBy: admin._id,
      assignedTo: analyst._id,
      timeline: [
        {
          action: 'Incident Created',
          notes: 'Reported by endpoint protection alert.',
          performedBy: admin._id,
          timestamp: new Date(Date.now() - 3600000 * 5),
        },
        {
          action: 'Status changed from "New" to "In Progress"',
          notes: 'Analyst has started isolation procedures.',
          performedBy: analyst._id,
          timestamp: new Date(Date.now() - 3600000 * 3),
        },
      ],
    },
    {
      incidentID: 'INC-1002',
      title: 'Phishing Campaign Targeting HR Department',
      description:
        'Multiple HR employees received a sophisticated spear-phishing email impersonating the CEO, requesting urgent wire transfer and credential verification. Three employees clicked the malicious link.',
      category: 'Phishing',
      severity: 'High',
      status: 'New',
      affectedSystems: 'HR Outlook Accounts, Corporate Email Server',
      reportedBy: analyst._id,
      assignedTo: null,
      timeline: [
        {
          action: 'Incident Created',
          notes: 'Reported by HR department manager.',
          performedBy: analyst._id,
          timestamp: new Date(Date.now() - 3600000 * 2),
        },
      ],
    },
    {
      incidentID: 'INC-1003',
      title: 'Customer PII Data Exposed in S3 Bucket',
      description:
        'An S3 bucket containing customer PII (names, addresses, email addresses) was found to be publicly accessible due to a misconfigured bucket policy. Estimated 12,000 customer records exposed.',
      category: 'Data Leak',
      severity: 'Critical',
      status: 'Mitigated',
      affectedSystems: 'AWS S3 Bucket: prod-customer-exports, Customer Database',
      reportedBy: admin._id,
      assignedTo: analyst._id,
      timeline: [
        {
          action: 'Incident Created',
          notes: 'Detected via AWS Config rule violation.',
          performedBy: admin._id,
          timestamp: new Date(Date.now() - 3600000 * 24),
        },
        {
          action: 'Status changed from "New" to "In Progress"',
          notes: 'Bucket policy corrected. Forensic analysis underway.',
          performedBy: analyst._id,
          timestamp: new Date(Date.now() - 3600000 * 20),
        },
        {
          action: 'Status changed from "In Progress" to "Mitigated"',
          notes: 'Bucket secured. Notifying affected customers per GDPR.',
          performedBy: admin._id,
          timestamp: new Date(Date.now() - 3600000 * 10),
        },
      ],
    },
  ]);

  console.log(`Seeded ${incidents.length} incidents.`);
  console.log('\n--- TEST CREDENTIALS ---');
  console.log('Admin:   admin@cyberplatform.io   / admin123');
  console.log('Analyst: analyst@cyberplatform.io / analyst123');
  console.log('------------------------\n');

  mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  mongoose.connection.close();
  process.exit(1);
});
