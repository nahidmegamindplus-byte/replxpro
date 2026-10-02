const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'admin@replyx.ai';
  const password = process.argv[3];

  console.log(`Setting ADMIN role for: ${email}`);

  let user = await prisma.user.findUnique({ where: { email } });

  const updateData = {
    role: 'ADMIN',
    status: 'ACTIVE',
    plan: 'PRO',
    planStatus: 'ACTIVE',
    aiChatEnabled: true,
  };

  if (password) {
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }

  if (user) {
    user = await prisma.user.update({
      where: { email },
      data: updateData,
    });
    console.log(`✅ Successfully updated user "${email}" to role ADMIN!`);
  } else {
    const defaultPassword = password || 'admin123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    user = await prisma.user.create({
      data: {
        fullName: 'Admin User',
        businessName: 'ReplyX AI',
        email,
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        plan: 'PRO',
        planStatus: 'ACTIVE',
        monthlyMessageLimit: 999999,
        aiChatEnabled: true,
      },
    });
    console.log(`✅ Created new ADMIN user "${email}" with password "${defaultPassword}"!`);
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
