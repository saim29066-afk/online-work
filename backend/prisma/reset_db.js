const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🔄 Cleaning and resetting backend database...');

  try {
    // 1. Delete all transactional / user operational records
    await prisma.referralEarning.deleteMany({});
    console.log('✓ Cleared Referral Earnings');

    await prisma.userInvestment.deleteMany({});
    console.log('✓ Cleared User Investments');

    await prisma.deposit.deleteMany({});
    console.log('✓ Cleared Deposit Requests');

    await prisma.withdrawal.deleteMany({});
    console.log('✓ Cleared Withdrawal Requests');

    await prisma.supportTicket.deleteMany({});
    console.log('✓ Cleared Support Tickets');

    // 2. Delete all existing user accounts (Students)
    await prisma.user.deleteMany({});
    console.log('✓ Cleared All User Accounts');

    // 3. Clear upload receipts / slips
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        if (file !== '.gitkeep' && file !== '.gitignore') {
          try {
            fs.unlinkSync(path.join(uploadsDir, file));
          } catch (e) {
            // ignore
          }
        }
      }
      console.log('✓ Cleaned Uploads folder');
    }

    // 4. Seed Fresh Admin Account
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        name: 'System Admin',
        phone: '03000000000',
        email: 'admin@studentinvest.pk',
        password: adminPassword,
        role: 'ADMIN',
        referralCode: 'ADMIN777',
        balance: 50000.0
      }
    });
    console.log(`✓ Created Fresh Admin Account: ${admin.phone} (Password: admin123)`);

    // 5. Seed Fresh Payment Settings
    await prisma.paymentSetting.upsert({
      where: { id: 1 },
      update: {
        easypaisaNumber: '03451234567',
        easypaisaTitle: 'Muhammad Ali (Admin)',
        jazzcashNumber: '03019876543',
        jazzcashTitle: 'Muhammad Ali (Admin)',
        minWithdrawal: 800,
        minInvitesForWithdraw: 2,
        supportWhatsapp: '+923451234567',
        supportEmail: 'support@studentinvest.pk',
        noticeText: '🎉 Welcome Students! Rs. 250 Free Welcome Bonus + 50% Instant Referral Commission!'
      },
      create: {
        id: 1,
        easypaisaNumber: '03451234567',
        easypaisaTitle: 'Muhammad Ali (Admin)',
        jazzcashNumber: '03019876543',
        jazzcashTitle: 'Muhammad Ali (Admin)',
        minWithdrawal: 800,
        minInvitesForWithdraw: 2,
        supportWhatsapp: '+923451234567',
        supportEmail: 'support@studentinvest.pk',
        noticeText: '🎉 Welcome Students! Rs. 250 Free Welcome Bonus + 50% Instant Referral Commission!'
      }
    });
    console.log('✓ Seeded Fresh Payment Settings');

    // 6. Seed All Investment Plans
    const plans = [
      {
        id: 0,
        name: 'Level 0 Free Starter',
        price: 0.0,
        dailyBonus: 50.0,
        durationDays: 30,
        referralBonusPercent: 0.0,
        badge: 'Free for All Students',
        description: 'Free starter plan activated on registration. Earn Rs. 50 daily free profit.',
        features: JSON.stringify([
          'Rs. 50 Daily Free Guaranteed Bonus',
          'Total Return: Rs. 1,500',
          'Validity: 30 Days',
          'Free Activation (Rs. 0)',
          'Reach Rs. 800 & buy Level 1 to cashout'
        ]),
        isActive: true
      },
      {
        id: 1,
        name: 'Level 1 Bronze Starter',
        price: 1000.0,
        dailyBonus: 100.0,
        durationDays: 30,
        referralBonusPercent: 50.0,
        badge: 'Popular Beginner',
        description: 'Unlock full withdrawals and earn Rs. 100 daily returns.',
        features: JSON.stringify([
          'Rs. 100 Daily Guaranteed Bonus',
          'Total Return: Rs. 3,000 (300%)',
          'Validity: 30 Days',
          '50% Referral Commission (Rs. 500)',
          'Unlocks EasyPaisa / JazzCash Cashout'
        ]),
        isActive: true
      },
      {
        id: 2,
        name: 'Level 2 Silver Scholar',
        price: 2500.0,
        dailyBonus: 275.0,
        durationDays: 30,
        referralBonusPercent: 50.0,
        badge: 'High Earner',
        description: 'Accelerate your earnings with Rs. 275 daily profit.',
        features: JSON.stringify([
          'Rs. 275 Daily Guaranteed Bonus',
          'Total Return: Rs. 8,250 (330%)',
          'Validity: 30 Days',
          '50% Referral Commission (Rs. 1,250)',
          'Priority EasyPaisa / JazzCash Cashout'
        ]),
        isActive: true
      },
      {
        id: 3,
        name: 'Level 3 Gold Campus Pro',
        price: 5000.0,
        dailyBonus: 600.0,
        durationDays: 30,
        referralBonusPercent: 50.0,
        badge: 'Campus Pro',
        description: 'Maximum daily profit for serious student earners.',
        features: JSON.stringify([
          'Rs. 600 Daily Guaranteed Bonus',
          'Total Return: Rs. 18,000 (360%)',
          'Validity: 30 Days',
          '50% Referral Commission (Rs. 2,500)',
          'Instant 24/7 VIP Support'
        ]),
        isActive: true
      },
      {
        id: 4,
        name: 'Level 4 Diamond Elite',
        price: 10000.0,
        dailyBonus: 1400.0,
        durationDays: 30,
        referralBonusPercent: 50.0,
        badge: 'Ultimate Earner',
        description: 'Elite student plan with maximum daily bonus and fastest payout.',
        features: JSON.stringify([
          'Rs. 1,400 Daily Guaranteed Bonus',
          'Total Return: Rs. 42,000 (420%)',
          'Validity: 30 Days',
          '50% Referral Commission (Rs. 5,000)',
          'Dedicated WhatsApp Manager'
        ]),
        isActive: true
      }
    ];

    for (const plan of plans) {
      await prisma.plan.upsert({
        where: { id: plan.id },
        update: plan,
        create: plan
      });
    }
    console.log('✓ Seeded All 5 Investment Plans');

    console.log('\n🎉 DATABASE FULLY RESET & READY FOR FRESH TESTING!');
  } catch (error) {
    console.error('Reset error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
