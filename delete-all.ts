import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Deleting all products, suppliers, and parse jobs...');
  
  await prisma.productSupplier.deleteMany();
  console.log('Deleted ProductSupplier');
  
  await prisma.parseJob.deleteMany();
  console.log('Deleted ParseJob');
  
  await prisma.product.deleteMany();
  console.log('Deleted Product');
  
  console.log('Done!');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });