// import { createConnection } from 'typeorm';
// import { Record } from '../src/records/entities/record.entity';
// import { User } from '../src/users/entities/user.entity';
// import { Batch } from '../src/batches/entities/batch.entity';
// import * as bcrypt from 'bcrypt';
// // import * as faker from 'faker';
// import 'dotenv/config';

// async function seedData() {
//   const connection = await createConnection({
//     type: 'postgres',
//     url: process.env.DATABASE_URL as string,
//     entities: [Record, Batch, User],
//     synchronize: true,
//     ssl: {
//       rejectUnauthorized: false,
//     },
//     logging: ['query', 'error', 'schema'], // Added for debugging
//   });

//   const userRepository = connection.getRepository(User);
//   const users = [
//     {
//       username: 'va1',
//       password: await bcrypt.hash('password', 10),
//       role: 'USER',
//     },
//     {
//       username: 'admin1',
//       password: await bcrypt.hash('password', 10),
//       role: 'ADMIN',
//     },
//   ];
//   await userRepository.save(users);

//   const batchRepository = connection.getRepository(Batch);
//   const batch = batchRepository.create({
//     name: 'Test Batch',
//     startDate: new Date(),
//   });
//   await batchRepository.save(batch);

//   const recordRepository = connection.getRepository(Record);
//   const records = Array.from({ length: 50 }, () => {
//     const record = {
//       propertyAddress: faker.address.streetAddress(),
//       transactionDate: faker.date.recent(),
//       borrowerName: faker.name.findName(),
//       loanOfficerName: faker.name.findName(),
//       nmlsId: faker.datatype.number({ min: 1000000, max: 9999999 }).toString(), // Fixed to string if entity requires it
//       loanAmount: faker.datatype.number({ min: 100000, max: 1000000 }),
//       loanTerm: faker.datatype.number({ min: 15, max: 30 }),
//       downPayment: faker.datatype.number({ min: 0, max: 100000 }), // Added for NOT NULL
//       apn: faker.random.alphaNumeric(10),
//       enteredBy: users[0].username,
//       enteredByDate: new Date(),
//       batch,
//       assignedTo: users[0],
//       searchVector: '',
//     };
//     console.log('Record downPayment:', record.downPayment); // Debug log
//     return record;
//   });

//   for (const record of records) {
//     try {
//       await recordRepository.save(record);
//     } catch (error) {
//       console.error('Error saving record:', error);
//     }
//   }

//   await connection.close();
// }

// seedData().catch(console.error);
