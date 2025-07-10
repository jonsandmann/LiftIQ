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
  console.log('🏋️ Starting fast workout data import...')
  
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
  
  // First, create all exercises that don't exist
  console.log('\nCreating exercises...')
  const uniqueExerciseNames = new Set<string>()
  const skippedExercises = new Set<string>()
  
  records.forEach((record: any) => {
    const mapping = exerciseMapping[record.exercise_name]
    if (mapping) {
      uniqueExerciseNames.add(mapping.name)
    } else {
      skippedExercises.add(record.exercise_name)
    }
  })
  
  // Create exercises in batch
  const exerciseMap = new Map<string, string>() // name -> id
  
  for (const exerciseName of uniqueExerciseNames) {
    const mapping = Object.values(exerciseMapping).find(m => m.name === exerciseName)!
    
    let exercise = await prisma.exercise.findFirst({
      where: {
        name: exerciseName,
        userId: user.id
      }
    })
    
    if (!exercise) {
      exercise = await prisma.exercise.create({
        data: {
          name: exerciseName,
          category: mapping.category,
          userId: user.id
        }
      })
      console.log(`Created exercise: ${exerciseName}`)
    }
    
    exerciseMap.set(exerciseName, exercise.id)
  }
  
  // Group records by date
  console.log('\nGrouping records by date...')
  const recordsByDate = records.reduce((acc: any, record: any) => {
    const date = new Date(record.date)
    const dateKey = date.toISOString().split('T')[0]
    
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    
    const mapping = exerciseMapping[record.exercise_name]
    if (mapping) {
      acc[dateKey].push({
        exerciseName: mapping.name,
        reps: parseInt(record.reps),
        weight: parseFloat(record.weight_lbs),
        date: date
      })
    }
    
    return acc
  }, {})
  
  const dates = Object.keys(recordsByDate).sort()
  console.log(`Processing ${dates.length} workout days from ${dates[0]} to ${dates[dates.length - 1]}`)
  
  // Process in batches
  const batchSize = 50
  let totalSetsImported = 0
  
  for (let i = 0; i < dates.length; i += batchSize) {
    const batchDates = dates.slice(i, i + batchSize)
    console.log(`\nProcessing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(dates.length/batchSize)} (${batchDates.length} days)`)
    
    // Create workouts for this batch
    const workouts = await prisma.workout.createMany({
      data: batchDates.map(dateKey => ({
        userId: user.id,
        date: new Date(dateKey),
        notes: 'Imported from historical data'
      }))
    })
    
    // Get the created workouts
    const createdWorkouts = await prisma.workout.findMany({
      where: {
        userId: user.id,
        date: {
          in: batchDates.map(d => new Date(d))
        }
      }
    })
    
    // Create all sets for this batch
    const setsToCreate: any[] = []
    
    for (const workout of createdWorkouts) {
      const dateKey = workout.date.toISOString().split('T')[0]
      const sets = recordsByDate[dateKey]
      
      for (const set of sets) {
        const exerciseId = exerciseMap.get(set.exerciseName)
        if (exerciseId) {
          setsToCreate.push({
            workoutId: workout.id,
            exerciseId: exerciseId,
            userId: user.id,
            reps: set.reps,
            weight: set.weight,
            date: set.date
          })
        }
      }
    }
    
    // Create all sets in one operation
    await prisma.workoutSet.createMany({
      data: setsToCreate
    })
    
    totalSetsImported += setsToCreate.length
    console.log(`Created ${setsToCreate.length} sets`)
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