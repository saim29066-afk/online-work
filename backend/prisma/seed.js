const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Default Payment Settings
  await prisma.paymentSetting.upsert({
    where: { id: 1 },
    update: {
      minWithdrawal: 800,
      minInvitesForWithdraw: 1
    },
    create: {
      id: 1,
      easypaisaNumber: '03451234567',
      easypaisaTitle: 'Muhammad Ali (Admin)',
      jazzcashNumber: '03019876543',
      jazzcashTitle: 'Muhammad Ali (Admin)',
      minWithdrawal: 800,
      minInvitesForWithdraw: 1,
      supportWhatsapp: '+923451234567',
      supportEmail: 'support@studentinvest.pk',
      noticeText: '🎉 Welcome Students! Level 0 Free Plan (Rs. 35/day) + Rs. 150 Signup Bonus active!'
    }
  });

  // 2. Create Admin Account
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { phone: '03000000000' },
    update: {
      email: 'admin@studentinvest.pk',
      role: 'ADMIN'
    },
    create: {
      name: 'System Admin',
      phone: '03000000000',
      email: 'admin@studentinvest.pk',
      password: adminPassword,
      role: 'ADMIN',
      referralCode: 'ADMIN777',
      balance: 50000.0
    }
  });

  // 3. Create Investment Plans (Including Level 0 Free Plan!)
  const plans = [
    {
      id: 0,
      name: 'Level 0 Free Starter',
      price: 0.0,
      dailyBonus: 35.0,
      durationDays: 30,
      referralBonusPercent: 0.0,
      badge: 'Free for All Students',
      description: 'Free starter plan activated on registration. Earn Rs. 35 daily free profit.',
      features: JSON.stringify([
        'Rs. 35 Daily Free Guaranteed Bonus',
        'Total Return: Rs. 1,050',
        'Validity: 30 Days',
        'Free Activation (Rs. 0)',
        'Reach Rs. 800 & buy Level 1 to cashout'
      ])
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
      ])
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
      ])
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
      ])
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
      ])
    }
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan
    });
  }

  console.log('✅ Database seeded successfully with Level 0 Free Plan and updated tiers!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
