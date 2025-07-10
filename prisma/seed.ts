import { PrismaClient, Category } from '@prisma/client'

const prisma = new PrismaClient()

const defaultExercises = [
  // CHEST
  { name: 'Bench Press (Barbell)', category: Category.CHEST },
  { name: 'Bench Press (Dumbbell)', category: Category.CHEST },
  { name: 'Incline Bench Press', category: Category.CHEST },
  { name: 'Decline Bench Press', category: Category.CHEST },
  { name: 'Chest Fly (Dumbbell)', category: Category.CHEST },
  { name: 'Cable Fly', category: Category.CHEST },
  { name: 'Push-Ups', category: Category.CHEST },
  { name: 'Chest Press Machine', category: Category.CHEST },
  { name: 'Pec Deck', category: Category.CHEST },
  
  // BACK
  { name: 'Pull-Ups', category: Category.BACK },
  { name: 'Lat Pulldown', category: Category.BACK },
  { name: 'Bent Over Row (Barbell)', category: Category.BACK },
  { name: 'Bent Over Row (Dumbbell)', category: Category.BACK },
  { name: 'T-Bar Row', category: Category.BACK },
  { name: 'Seated Cable Row', category: Category.BACK },
  { name: 'Deadlift', category: Category.BACK },
  { name: 'Romanian Deadlift', category: Category.BACK },
  { name: 'Face Pulls', category: Category.BACK },
  
  // LEGS
  { name: 'Squat (Barbell)', category: Category.LEGS },
  { name: 'Front Squat', category: Category.LEGS },
  { name: 'Leg Press', category: Category.LEGS },
  { name: 'Leg Extension', category: Category.LEGS },
  { name: 'Leg Curl', category: Category.LEGS },
  { name: 'Walking Lunges', category: Category.LEGS },
  { name: 'Bulgarian Split Squat', category: Category.LEGS },
  { name: 'Calf Raises', category: Category.LEGS },
  { name: 'Hack Squat', category: Category.LEGS },
  
  // SHOULDERS
  { name: 'Overhead Press (Barbell)', category: Category.SHOULDERS },
  { name: 'Overhead Press (Dumbbell)', category: Category.SHOULDERS },
  { name: 'Arnold Press', category: Category.SHOULDERS },
  { name: 'Lateral Raise', category: Category.SHOULDERS },
  { name: 'Front Raise', category: Category.SHOULDERS },
  { name: 'Rear Delt Fly', category: Category.SHOULDERS },
  { name: 'Upright Row', category: Category.SHOULDERS },
  { name: 'Shoulder Press Machine', category: Category.SHOULDERS },
  
  // ARMS
  { name: 'Bicep Curl (Barbell)', category: Category.ARMS },
  { name: 'Bicep Curl (Dumbbell)', category: Category.ARMS },
  { name: 'Hammer Curl', category: Category.ARMS },
  { name: 'Preacher Curl', category: Category.ARMS },
  { name: 'Cable Curl', category: Category.ARMS },
  { name: 'Tricep Extension', category: Category.ARMS },
  { name: 'Tricep Pushdown', category: Category.ARMS },
  { name: 'Close-Grip Bench Press', category: Category.ARMS },
  { name: 'Dips', category: Category.ARMS },
  
  // CORE
  { name: 'Plank', category: Category.CORE },
  { name: 'Crunches', category: Category.CORE },
  { name: 'Russian Twists', category: Category.CORE },
  { name: 'Leg Raises', category: Category.CORE },
  { name: 'Ab Wheel', category: Category.CORE },
  { name: 'Cable Crunch', category: Category.CORE },
  { name: 'Dead Bug', category: Category.CORE },
  
  // CARDIO
  { name: 'Treadmill', category: Category.CARDIO },
  { name: 'Elliptical', category: Category.CARDIO },
  { name: 'Rowing Machine', category: Category.CARDIO },
  { name: 'Stationary Bike', category: Category.CARDIO },
  { name: 'Stair Climber', category: Category.CARDIO },
]

async function main() {
  console.log('🌱 Seeding default exercises...')
  
  // Create default exercises with a system user
  // First, create or get a system user
  const systemUser = await prisma.user.upsert({
    where: { email: 'system@liftiq.app' },
    update: {},
    create: {
      email: 'system@liftiq.app',
      clerkId: 'system',
      name: 'System'
    }
  })
  
  // Create exercises
  for (const exercise of defaultExercises) {
    await prisma.exercise.upsert({
      where: {
        name_userId: {
          name: exercise.name,
          userId: systemUser.id
        }
      },
      update: {},
      create: {
        name: exercise.name,
        category: exercise.category,
        userId: systemUser.id
      }
    })
  }
  
  console.log(`✅ Created ${defaultExercises.length} default exercises`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })