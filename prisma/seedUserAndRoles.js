import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { roles } from '../src/utils/roles.js'; // Importa los IDs

const prisma = new PrismaClient();

async function main() {
  // Poblar roles con IDs específicos
  await prisma.roles.createMany({
    data: [
      { id: roles.ADMIN, name: 'admin' },
      { id: roles.USER, name: 'user' },
      { id: roles.SECURITY_GUARD, name: 'security_guard' }
    ],
    skipDuplicates: true
  });

  // Hashear contraseñas
  const adminPassword = await bcrypt.hash('1234', 10);
  const userPassword = await bcrypt.hash('1234', 10);

  // Crear usuarios si no existen
  await prisma.users.upsert({
    where: { email: 'josafat30000@gmail.com' },
    update: {},
    create: {
      email: 'josafat30000@gmail.com',
      password: adminPassword,
      role_id: roles.ADMIN,
      name: 'Administrador'
    }
  });

  await prisma.users.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      role_id: roles.USER,
      name: 'Usuario estándar'
    }
  });

  console.log('Roles y usuarios insertados');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());