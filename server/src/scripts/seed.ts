import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { Consultant } from '../models/Consultant';
import { Booking } from '../models/Booking';
import { Review } from '../models/Review';
import { BlockedSlot } from '../models/BlockedSlot';
import { Payment } from '../models/Payment';
import { USER_REVIEWS_CATALOG } from '../data/reviewsCatalog';

export { USER_REVIEWS_CATALOG };

const seedDatabase = async () => {
  console.log('[Seed] Starting database seed process...');
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Consultant.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
    BlockedSlot.deleteMany({}),
    Payment.deleteMany({}),
  ]);
  console.log('[Seed] Cleared existing data.');

  // 1. Create Users
  const passwordSalt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('Admin@1234', passwordSalt);
  const clientHash = await bcrypt.hash('Client@1234', passwordSalt);

  const adminUser = await User.create({
    name: 'ConsultFlow Admin',
    email: 'admin@consultflow.com',
    phone: '+91 98765 43210',
    passwordHash: adminHash,
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  });

  const clientUser = await User.create({
    name: 'Aditya Verma',
    email: 'client@example.com',
    phone: '+91 91234 56789',
    passwordHash: clientHash,
    role: 'USER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  });

  const secondClient = await User.create({
    name: 'Neha Deshmukh',
    email: 'neha@example.com',
    phone: '+91 98111 22334',
    passwordHash: clientHash,
    role: 'USER',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  });

  // 2. Create Consultants
  const consultantsData = [
    {
      name: 'Ashish Lichode',
      email: 'ashish.lichode@consultflow.org',
      phone: '+91 98201 11223',
      avatar: 'https://media.licdn.com/dms/image/v2/D5603AQHgvioDlx9_IQ/profile-displayphoto-crop_800_800/B56Z6Y4CHeKsAM-/0/1780681286875?e=1790812800&v=beta&t=cNJpjcdLhjrXD9yCIux7_f5gICB2sThInUDzYEbESkI',
      domain: 'Engineering Consultant',
      bio: 'Principal Engineering Consultant with 12+ years experience mentoring engineering students, fresh graduates, and experienced engineers. Practical roadmaps for career transitions, resume enhancement, and high-growth tech roles.',
      skills: ['Career Roadmap', 'Resume Strategy', 'System Architecture', 'Interview Prep', 'Salary Negotiation', 'Data Analysis', 'Data Engineering', 'AI/ML', 'Automotive', 'Semiconductor', 'Software Engineering'],
      expertise: ['Career Roadmap', 'Resume Strategy', 'System Architecture', 'Interview Prep', 'Salary Negotiation'],
      technicalSkills: ['Data Analysis', 'Data Engineering', 'AI/ML', 'Automotive', 'Semiconductor', 'Software Engineering'],
      rating: 4.9,
      reviewCount: 48,
      fee: 999,
      slotDuration: 20,
      minNoticeHours: 0,
      workingDays: [0, 1, 2, 3, 4, 5, 6],
      workingHours: { start: '19:00', end: '21:00' },
      isActive: true,
    },
  ];

  const createdConsultants = await Consultant.insertMany(consultantsData);
  console.log(`[Seed] Created ${createdConsultants.length} consultant: Ashish Lichode.`);

  // Create User account for Ashish Lichode
  const mentorHash = await bcrypt.hash('Mentor@1234', passwordSalt);

  await User.create({
    name: 'Ashish Lichode',
    email: 'ashish.lichode@consultflow.org',
    phone: '+91 98201 11223',
    passwordHash: mentorHash,
    role: 'CONSULTANT',
    consultantId: createdConsultants[0]._id,
    avatar: createdConsultants[0].avatar,
  });
  console.log('[Seed] Created consultant user login account for Ashish Lichode.');

  // 3. Seed ALL 48 USER REVIEWS
  const reviewsToInsert = USER_REVIEWS_CATALOG.map((rev) => ({
    consultantId: createdConsultants[0]._id,
    userId: clientUser._id,
    userName: rev.name,
    rating: rev.rating,
    comment: rev.comment,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 60 * 86400000)),
  }));

  await Review.insertMany(reviewsToInsert);
  console.log(`[Seed] Successfully seeded all ${reviewsToInsert.length} authentic user reviews!`);

  // Update consultant aggregate review metrics
  await Consultant.findByIdAndUpdate(createdConsultants[0]._id, {
    rating: 4.9,
    reviewCount: reviewsToInsert.length,
  });

  console.log('\n=========================================');
  console.log(' SEED COMPLETE — READY FOR DEMO');
  console.log(` 48 Reviews Seeded Successfully`);
  console.log(' Admin:      admin@consultflow.com / Admin@1234');
  console.log(' Client:     client@example.com / Client@1234');
  console.log(' Consultant: ashish.lichode@consultflow.org / Mentor@1234');
  console.log(' Promo Code: Engistud (Free for Students & Freshers)');
  console.log('=========================================\n');

  process.exit(0);
};

if (import.meta.main) {
  seedDatabase().catch((err) => {
    console.error('[Seed Failed]', err);
    process.exit(1);
  });
}
