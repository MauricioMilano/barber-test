import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function clearAllData() {
  // Delete in order to respect foreign keys
  await prisma.survey.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.client.deleteMany();
  await prisma.cortesiaRule.deleteMany();
  await prisma.service.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.barber.deleteMany();
  await prisma.user.deleteMany();
  await prisma.barbershop.deleteMany();
}

async function main() {
  console.log('🌱 Starting seed...');
  
  // Clear existing data for clean re-seed
  console.log('🧹 Clearing existing data...');
  await clearAllData();
  console.log('✅ Cleared existing data');

  // Create admin user (upsert to handle re-runs)
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@barbearia.com' },
    update: {},
    create: {
      email: 'admin@barbearia.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'admin'
    }
  });
  console.log('✅ Created/verified admin user');

  // Create barbers
  const barberPassword = await bcrypt.hash('barbeiro123', 10);
  
  const joaoUser = await prisma.user.upsert({
    where: { email: 'joao@barbearia.com' },
    update: {},
    create: {
      email: 'joao@barbearia.com',
      password: barberPassword,
      name: 'João Silva',
      role: 'barber'
    }
  });

  const pedroUser = await prisma.user.upsert({
    where: { email: 'pedro@barbearia.com' },
    update: {},
    create: {
      email: 'pedro@barbearia.com',
      password: barberPassword,
      name: 'Pedro Santos',
      role: 'barber'
    }
  });

  const joao = await prisma.barber.upsert({
    where: { userId: joaoUser.id },
    update: {},
    create: {
      userId: joaoUser.id,
      photoUrl: null
    }
  });

  const pedro = await prisma.barber.upsert({
    where: { userId: pedroUser.id },
    update: {},
    create: {
      userId: pedroUser.id,
      photoUrl: null
    }
  });
  console.log('✅ Created/verified barbers: João, Pedro');

  // Create categories
  const bebidasAlcoolicas = await prisma.productCategory.create({
    data: { name: 'Bebidas Alcoólicas', containsAlcohol: true }
  });
  const bebidasNaoAlcoolicas = await prisma.productCategory.create({
    data: { name: 'Bebidas Não Alcoólicas', containsAlcohol: false }
  });
  const cosmeticos = await prisma.productCategory.create({
    data: { name: 'Cosméticos', containsAlcohol: false }
  });
  const lanches = await prisma.productCategory.create({
    data: { name: 'Lanches', containsAlcohol: false }
  });
  console.log('✅ Created categories');

  // Create products
  const products = await Promise.all([
    // Bebidas Alcoólicas
    prisma.product.create({ data: { categoryId: bebidasAlcoolicas.id, name: 'Cerveja Original 600ml', price: 12.00, stock: 50 } }),
    prisma.product.create({ data: { categoryId: bebidasAlcoolicas.id, name: 'Cerveja Heineken 600ml', price: 15.00, stock: 30 } }),
    prisma.product.create({ data: { categoryId: bebidasAlcoolicas.id, name: 'Caipirinha', price: 18.00, stock: 20 } }),
    // Bebidas Não Alcoólicas
    prisma.product.create({ data: { categoryId: bebidasNaoAlcoolicas.id, name: 'Água Mineral 500ml', price: 5.00, stock: 100 } }),
    prisma.product.create({ data: { categoryId: bebidasNaoAlcoolicas.id, name: 'Refrigerante 600ml', price: 8.00, stock: 60 } }),
    prisma.product.create({ data: { categoryId: bebidasNaoAlcoolicas.id, name: 'Suco Natural 500ml', price: 10.00, stock: 40 } }),
    // Cosméticos
    prisma.product.create({ data: { categoryId: cosmeticos.id, name: 'Pomada Barbeiro', price: 25.00, stock: 50 } }),
    prisma.product.create({ data: { categoryId: cosmeticos.id, name: 'Óleo Barba', price: 35.00, stock: 30 } }),
    prisma.product.create({ data: { categoryId: cosmeticos.id, name: 'Cera Capilar', price: 28.00, stock: 40 } }),
    // Lanches
    prisma.product.create({ data: { categoryId: lanches.id, name: 'Pão de Queijo', price: 6.00, stock: 50 } }),
    prisma.product.create({ data: { categoryId: lanches.id, name: 'Pastel de Carne', price: 10.00, stock: 30 } }),
    prisma.product.create({ data: { categoryId: lanches.id, name: 'Coxinha', price: 10.00, stock: 30 } }),
  ]);
  console.log('✅ Created products');

  // Create services
  const services = await Promise.all([
    prisma.service.create({ data: { name: 'Corte Masculino', category: 'Cabelo', price: 45.00, duration: 30 } }),
    prisma.service.create({ data: { name: 'Barba Completa', category: 'Barba', price: 35.00, duration: 25 } }),
    prisma.service.create({ data: { name: 'Corte + Barba', category: 'Combo', price: 70.00, duration: 50 } }),
    prisma.service.create({ data: { name: 'Sobrancelha', category: 'Acessórios', price: 15.00, duration: 10 } }),
    prisma.service.create({ data: { name: 'Pezinho', category: 'Acessórios', price: 20.00, duration: 15 } }),
    prisma.service.create({ data: { name: 'Pigmentação Barba', category: 'Especial', price: 80.00, duration: 40 } }),
  ]);
  console.log('✅ Created services');

  // Create cortesia rules
  const regrasCortesia = await Promise.all([
    prisma.cortesiaRule.create({ data: { serviceId: services[0].id, categoryId: bebidasNaoAlcoolicas.id, quantity: 1 } }),
    prisma.cortesiaRule.create({ data: { serviceId: services[1].id, categoryId: cosmeticos.id, quantity: 1 } }),
    prisma.cortesiaRule.create({ data: { serviceId: services[2].id, categoryId: lanches.id, quantity: 1 } }),
    prisma.cortesiaRule.create({ data: { serviceId: services[2].id, categoryId: bebidasAlcoolicas.id, quantity: 1 } }),
  ]);
  console.log('✅ Created cortesia rules');

  // Create clients with appointments
  const clientsData = [
    { cpf: '11144477735', name: 'Carlos Eduardo Lima', phone: '11999887766', email: 'carlos@email.com', birthDate: new Date('1995-03-15') },
    { cpf: '22255588899', name: 'Rafael Almeida Costa', phone: '11988776655', email: 'rafael@email.com', birthDate: new Date('1988-07-22') },
    { cpf: '33366699911', name: 'Lucas Ferreira Souza', phone: '11977665544', email: 'lucas@email.com', birthDate: new Date('2000-11-08') },
    { cpf: '44477788800', name: 'Bruno Oliveira Santos', phone: '11966554433', email: 'bruno@email.com', birthDate: new Date('1992-05-30') },
    { cpf: '55588899900', name: 'Thiago Rodrigues Lima', phone: '11955443322', email: 'thiago@email.com', birthDate: new Date('2005-09-12') },
    { cpf: '66699900011', name: 'Felipe Martins Cruz', phone: '11944332211', email: 'felipe@email.com', birthDate: new Date('1998-01-25') },
    { cpf: '77700011122', name: 'Gustavo Pereira Rocha', phone: '11933221100', email: 'gustavo@email.com', birthDate: new Date('1990-12-03') },
    { cpf: '88811122233', name: 'Diego Sousa Almeida', phone: '11922110099', email: 'diego@email.com', birthDate: new Date('1985-06-18') },
  ];

  const clients = await Promise.all(
    clientsData.map(data => prisma.client.create({ data }))
  );
  console.log('✅ Created clients');

  // Create appointments for today
  const today = new Date();
  const appointmentsData = [
    { clientId: clients[0].id, barberId: joao.id, serviceId: services[0].id, scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0), source: 'trinks' },
    { clientId: clients[1].id, barberId: joao.id, serviceId: services[2].id, scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0), source: 'trinks' },
    { clientId: clients[2].id, barberId: pedro.id, serviceId: services[1].id, scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30), source: 'manual' },
    { clientId: clients[3].id, barberId: pedro.id, serviceId: services[0].id, scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0), source: 'trinks' },
    { clientId: clients[4].id, barberId: joao.id, serviceId: services[4].id, scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0), source: 'manual' },
    { clientId: clients[5].id, barberId: pedro.id, serviceId: services[2].id, scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30), source: 'trinks' },
    { clientId: clients[6].id, barberId: joao.id, serviceId: services[0].id, scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0), source: 'trinks' },
    { clientId: clients[7].id, barberId: pedro.id, serviceId: services[5].id, scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0), source: 'manual' },
  ];

  const appointments = await Promise.all(
    appointmentsData.map(data => prisma.appointment.create({ data }))
  );
  console.log('✅ Created appointments');

  // Create some past orders
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const ordersData = [
    { clientId: clients[0].id, barberId: joao.id, total: 45.00, paymentMethod: 'pix', paymentStatus: 'paid', status: 'finished', finishedAt: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 9, 45), createdAt: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 9, 0) },
    { clientId: clients[1].id, barberId: pedro.id, total: 70.00, paymentMethod: 'credit', paymentStatus: 'paid', status: 'finished', finishedAt: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 14, 30), createdAt: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 14, 0) },
    { clientId: clients[2].id, barberId: joao.id, total: 50.00, paymentMethod: 'debit', paymentStatus: 'paid', status: 'finished', finishedAt: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 16, 0), createdAt: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 15, 30) },
    { clientId: clients[3].id, barberId: pedro.id, total: 35.00, paymentMethod: 'cash', paymentStatus: 'paid', status: 'finished', finishedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 30), createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0) },
    { clientId: clients[4].id, barberId: joao.id, total: 20.00, paymentMethod: 'pix', paymentStatus: 'paid', status: 'finished', finishedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 45), createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 30) },
  ];

  const orders = await Promise.all(
    ordersData.map(data => prisma.order.create({ 
      data: {
        ...data,
        items: {
          create: [
            { itemType: 'service', itemId: services[0].id, name: services[0].name, price: services[0].price, quantity: 1, isCourtesy: false }
          ]
        }
      }
    }))
  );

  // Create surveys for some orders
  await prisma.survey.createMany({
    data: [
      { orderId: orders[0].id, token: 'survey_token_1', rating: 5, comment: 'Excelente atendimento!', sentVia: 'whatsapp', respondedAt: new Date() },
      { orderId: orders[1].id, token: 'survey_token_2', rating: 4, comment: 'Muito bom, mas demorou um pouco.', sentVia: 'whatsapp', respondedAt: new Date() },
      { orderId: orders[2].id, token: 'survey_token_3', rating: 5, comment: null, sentVia: 'email', respondedAt: new Date() },
    ]
  });
  console.log('✅ Created orders and surveys');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('   Admin: admin@barbearia.com / admin123');
  console.log('   Barbeiro: joao@barbearia.com / barbeiro123');
  console.log('   Barbeiro: pedro@barbearia.com / barbeiro123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });