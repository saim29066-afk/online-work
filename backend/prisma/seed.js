const bcrypt = require('bcryptjs');
const prisma = require('../src/prisma');

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
      durationDays: 50,
      referralBonusPercent: 0.0,
      badge: 'Free for All Students',
      description: 'Free starter plan activated on registration. Earn Rs. 35 daily free profit for 50 days.',
      features: JSON.stringify([
        'Rs. 35 Daily Free Guaranteed Bonus',
        'Total Return: Rs. 1,750',
        'Validity: 50 Days',
        'Free Activation (Rs. 0)',
        'Reach Rs. 800 & buy Level 1 to cashout'
      ])
    },
    {
      id: 1,
      name: 'Level 1 Bronze Starter',
      price: 1000.0,
      dailyBonus: 200.0,
      durationDays: 50,
      referralBonusPercent: 50.0,
      badge: 'Popular Beginner',
      description: 'Unlock full withdrawals and earn Rs. 200 daily returns for 50 days.',
      features: JSON.stringify([
        'Rs. 200 Daily Guaranteed Bonus',
        'Total Return: Rs. 10,000',
        'Validity: 50 Days',
        '50% Referral Commission (Rs. 500)',
        'Unlocks EasyPaisa / JazzCash Cashout'
      ])
    },
    {
      id: 2,
      name: 'Level 2 Silver Scholar',
      price: 2500.0,
      dailyBonus: 400.0,
      durationDays: 50,
      referralBonusPercent: 50.0,
      badge: 'High Earner',
      description: 'Accelerate your earnings with Rs. 400 daily profit for 50 days.',
      features: JSON.stringify([
        'Rs. 400 Daily Guaranteed Bonus',
        'Total Return: Rs. 20,000',
        'Validity: 50 Days',
        '50% Referral Commission (Rs. 1,250)',
        'Priority EasyPaisa / JazzCash Cashout'
      ])
    },
    {
      id: 3,
      name: 'Level 3 Gold Campus Pro',
      price: 5000.0,
      dailyBonus: 800.0,
      durationDays: 50,
      referralBonusPercent: 50.0,
      badge: 'Campus Pro',
      description: 'Maximum daily profit of Rs. 800/day for 50 days.',
      features: JSON.stringify([
        'Rs. 800 Daily Guaranteed Bonus',
        'Total Return: Rs. 40,000',
        'Validity: 50 Days',
        '50% Referral Commission (Rs. 2,500)',
        'Instant 24/7 VIP Support'
      ])
    },
    {
      id: 4,
      name: 'Level 4 Diamond Elite',
      price: 10000.0,
      dailyBonus: 2500.0,
      durationDays: 50,
      referralBonusPercent: 50.0,
      badge: 'Ultimate Earner',
      description: 'Elite student plan with Rs. 2,500 daily bonus for 50 days.',
      features: JSON.stringify([
        'Rs. 2,500 Daily Guaranteed Bonus',
        'Total Return: Rs. 125,000',
        'Validity: 50 Days',
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
