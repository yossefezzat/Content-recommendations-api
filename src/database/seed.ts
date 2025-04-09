import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { User } from '../users/entities/user.entity';
import { Content } from '../contents/entities/content.entity';
import { Interaction } from '../interactions/entities/interaction.entity';
import { InteractionType } from '../interactions/constants/interaction-type.enum';
import { ContentTags } from '../contents/constants/content-tags.enum';
import { ContentType } from '../contents/constants/content-type.enum';
import { join } from 'path';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: join(__dirname, '../../', 'sqlite', 'data.sqlite'),
  entities: [User, Content, Interaction],
  synchronize: true, // Only for dev
});

async function seed() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const contentRepo = AppDataSource.getRepository(Content);
  const interactionRepo = AppDataSource.getRepository(Interaction);

  console.log('🌱 Seeding data...');

  // Tags & types pool
  const tagsPool = Object.values(ContentTags);
  const contentTypes = Object.values(ContentType);

  // 1. Create Users
  const users: User[] = [];
  for (let i = 0; i < 50; i++) {
    const user = userRepo.create({
      username: faker.internet.username(),
      preferences: faker.helpers.arrayElements(tagsPool, 3),
    });
    users.push(await userRepo.save(user));
  }

  // 2. Create Content
  const contents: Content[] = [];
  for (let i = 0; i < 1000; i++) {
    const content = contentRepo.create({
      title: faker.lorem.sentence(),
      type: faker.helpers.arrayElement(contentTypes),
      tags: faker.helpers.arrayElements(tagsPool, 2),
      popularity: 0,
      createdAt: faker.date.recent({ days: 30 }),
    });
    contents.push(await contentRepo.save(content));
  }

  // 3. Create Interactions
  const interactionTypes = Object.values(InteractionType);

  for (let i = 0; i < 10000; i++) {
    const user = faker.helpers.arrayElement(users);
    const content = faker.helpers.arrayElement(contents);
    const type = faker.helpers.arrayElement(interactionTypes);

    // Avoid duplicates of same type per user-content
    const exists = await interactionRepo.findOne({
      where: { user: { id: user.id }, content: { id: content.id }, type },
      relations: ['user', 'content'],
    });
    if (exists) continue;

    const interaction = interactionRepo.create({
      user,
      content,
      type,
      timestamp: faker.date.recent({ days: 30 }),
    });

    if (type === InteractionType.RATE) {
      interaction.rating = faker.number.int({ min: 1, max: 5 });
    }

    await interactionRepo.save(interaction);
  }

  console.log('✅ Seeding complete.');
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
