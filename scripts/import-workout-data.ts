import { PrismaClient, Category } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'

const prisma = new PrismaClient()

// Exercise name mapping and category assignment
const exerciseMapping: Record<string, { name: string; category: Category }> = {
  // CHEST
  'Bench Press': { name: 'Bench Press (Barbell)', category: Category.CHEST },
  'Dumbbell Bench Press': { name: 'Bench Press (Dumbbell)', category: Category.CHEST },
  'Incline Bench Press': { name: 'Incline Bench Press', category: Category.CHEST },
  'Decline Bench Press': { name: 'Decline Bench Press', category: Category.CHEST },
  'Chest Press': { name: 'Chest Press Machine', category: Category.CHEST },
  'Fly': { name: 'Chest Fly (Machine)', category: Category.CHEST },
  'Pectoral': { name: 'Pec Deck', category: Category.CHEST },
  
  // BACK
  'Dead Lift': { name: 'Deadlift', category: Category.BACK },
  'Pull-Ups': { name: 'Pull-Ups', category: Category.BACK },
  'Chin-Ups': { name: 'Chin-Ups', category: Category.BACK },
  'L-sit chin-up': { name: 'L-Sit Chin-Ups', category: Category.BACK },
  'Lat Machine': { name: 'Lat Pulldown', category: Category.BACK },
  'Pull Down': { name: 'Lat Pulldown', category: Category.BACK },
  'Vertical Traction': { name: 'Lat Pulldown', category: Category.BACK },
  'Low Row': { name: 'Seated Cable Row', category: Category.BACK },
  'Mid Row': { name: 'Cable Row (Mid)', category: Category.BACK },
  'Lever Row': { name: 'Machine Row', category: Category.BACK },
  'Upper Back': { name: 'Upper Back Machine', category: Category.BACK },
  'Lower Back': { name: 'Back Extension', category: Category.BACK },
  'Kneeling Easy Pull Up': { name: 'Assisted Pull-Ups', category: Category.BACK },
  'Assisted Muscle Ups (Medium Ba': { name: 'Assisted Muscle-Ups', category: Category.BACK },
  
  // LEGS
  'Squats': { name: 'Squat (Barbell)', category: Category.LEGS },
  'Front Squat': { name: 'Front Squat', category: Category.LEGS },
  'Bulgarian Split Squat': { name: 'Bulgarian Split Squat', category: Category.LEGS },
  'Leg Press': { name: 'Leg Press', category: Category.LEGS },
  'Leg Ext': { name: 'Leg Extension', category: Category.LEGS },
  'Leg Curl': { name: 'Leg Curl', category: Category.LEGS },
  'Prone Leg Curl': { name: 'Prone Leg Curl', category: Category.LEGS },
  'Calf Raise': { name: 'Calf Raises', category: Category.LEGS },
  'Glute Master': { name: 'Glute Machine', category: Category.LEGS },
  'Booty Builder': { name: 'Glute Machine', category: Category.LEGS },
  'Hip Abduction': { name: 'Hip Abduction Machine', category: Category.LEGS },
  'Abductor': { name: 'Hip Abduction Machine', category: Category.LEGS },
  
  // SHOULDERS
  'Shoulder Press': { name: 'Shoulder Press (Machine)', category: Category.SHOULDERS },
  'Dumbbell Shoulder Press': { name: 'Shoulder Press (Dumbbell)', category: Category.SHOULDERS },
  'Overhead Press': { name: 'Overhead Press (Barbell)', category: Category.SHOULDERS },
  'Deltoid Raise': { name: 'Lateral Raise', category: Category.SHOULDERS },
  'Delts Machine': { name: 'Shoulder Machine', category: Category.SHOULDERS },
  'Rear Delt Row': { name: 'Rear Delt Row', category: Category.SHOULDERS },
  'Reverse Fly': { name: 'Rear Delt Fly', category: Category.SHOULDERS },
  
  // ARMS
  'Bicep Curls': { name: 'Bicep Curl (Barbell)', category: Category.ARMS },
  'Hammer Curls': { name: 'Hammer Curl', category: Category.ARMS },
  'Arm Extension': { name: 'Tricep Extension', category: Category.ARMS },
  'Tricep Press': { name: 'Tricep Press', category: Category.ARMS },
  'Tricep Pulley': { name: 'Tricep Pushdown', category: Category.ARMS },
  'Overhead Tricep Pulley': { name: 'Overhead Tricep Extension', category: Category.ARMS },
  'Dips': { name: 'Dips', category: Category.ARMS },
  
  // CORE
  'Ab Crunch': { name: 'Crunches', category: Category.CORE },
  'Ab Wheel Rollout': { name: 'Ab Wheel', category: Category.CORE },
  'Total Abdominal': { name: 'Ab Machine', category: Category.CORE },
  'Rotary Torso': { name: 'Rotary Torso Machine', category: Category.CORE },
}

async function importWorkoutData(userId: string, csvPath: string) {
  console.log('🏋️ Starting workout data import...')
  
  // Get the user
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })
  
  if (!user) {
    throw new Error(`User with ID ${userId} not found`)
  }
  
  console.log(`Importing data for user: ${user.email}`)
  
  // Read and parse CSV
  const csvContent = readFileSync(csvPath, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  })
  
  console.log(`Found ${records.length} workout records`)
  
  // Group records by date
  const recordsByDate = records.reduce((acc: any, record: any) => {
    const date = new Date(record.date)
    const dateKey = date.toISOString().split('T')[0]
    
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    
    acc[dateKey].push({
      exerciseName: record.exercise_name,
      reps: parseInt(record.reps),
      weight: parseFloat(record.weight_lbs),
      date: date
    })
    
    return acc
  }, {})
  
  console.log(`Processing ${Object.keys(recordsByDate).length} workout days`)
  
  // Process each workout day
  let totalSetsImported = 0
  let skippedExercises = new Set<string>()
  
  for (const [dateKey, sets] of Object.entries(recordsByDate)) {
    console.log(`\nProcessing ${dateKey}: ${(sets as any[]).length} sets`)
    
    // Create a workout for this day
    const workout = await prisma.workout.create({
      data: {
        userId: user.id,
        date: new Date(dateKey),
        notes: 'Imported from historical data'
      }
    })
    
    // Process each set
    for (const set of (sets as any[])) {
      const mapping = exerciseMapping[set.exerciseName]
      
      if (!mapping) {
        skippedExercises.add(set.exerciseName)
        continue
      }
      
      // Find or create the exercise
      let exercise = await prisma.exercise.findFirst({
        where: {
          name: mapping.name,
          userId: user.id
        }
      })
      
      if (!exercise) {
        exercise = await prisma.exercise.create({
          data: {
            name: mapping.name,
            category: mapping.category,
            userId: user.id
          }
        })
        console.log(`Created exercise: ${mapping.name}`)
      }
      
      // Create the workout set
      await prisma.workoutSet.create({
        data: {
          workoutId: workout.id,
          exerciseId: exercise.id,
          userId: user.id,
          reps: set.reps,
          weight: set.weight,
          date: set.date
        }
      })
      
      totalSetsImported++
    }
  }
  
  console.log('\n✅ Import completed!')
  console.log(`Total sets imported: ${totalSetsImported}`)
  
  if (skippedExercises.size > 0) {
    console.log(`\n⚠️ Skipped exercises (no mapping found):`)
    skippedExercises.forEach(name => console.log(`  - ${name}`))
  }
}

// Run the import
const userId = 'cmcxgvuqa0006j24qporuqy0z'
const csvPath = '/Users/jonsandmann/projects/liftiq/workout_data_2025-06-28.csv'

importWorkoutData(userId, csvPath)
  .catch(console.error)
  .finally(() => prisma.$disconnect())