import { NextRequest, NextResponse } from 'next/server';
import { runAnatomyMigrations } from '@/lib/anatomy/migrations';
import {
  createStructure,
  createLens,
  createRelationship,
  createJourney,
  createModel,
} from '@/lib/db/anatomy';
import { v4 as uuidv4 } from 'uuid';
import type {
  BodySystem,
  BodyRegion,
  AnatomyCategory,
  AnatomyDifficulty,
  AnatomyLensType,
} from '@/types/anatomy';

// Sample skeletal structures
const skeletalStructures = [
  {
    name: 'Femur',
    latinName: 'Os femoris',
    category: 'bone' as AnatomyCategory,
    system: 'skeletal' as BodySystem,
    region: 'lower_limb' as BodyRegion,
    difficulty: 'beginner' as AnatomyDifficulty,
    description: 'The femur is the longest and strongest bone in the human body, extending from the hip to the knee. It supports the weight of the body and allows for locomotion.',
    clinicalSignificance: 'Femoral fractures are common in high-impact trauma and osteoporosis. The femoral head is a common site for avascular necrosis.',
  },
  {
    name: 'Tibia',
    latinName: 'Os tibia',
    category: 'bone' as AnatomyCategory,
    system: 'skeletal' as BodySystem,
    region: 'lower_limb' as BodyRegion,
    difficulty: 'beginner' as AnatomyDifficulty,
    description: 'The tibia, or shinbone, is the larger of the two bones in the lower leg. It bears most of the body weight transmitted from the femur.',
    clinicalSignificance: 'Tibial stress fractures are common in runners. The tibial plateau is vulnerable to fractures in knee trauma.',
  },
  {
    name: 'Humerus',
    latinName: 'Os humeri',
    category: 'bone' as AnatomyCategory,
    system: 'skeletal' as BodySystem,
    region: 'upper_limb' as BodyRegion,
    difficulty: 'beginner' as AnatomyDifficulty,
    description: 'The humerus is the single bone of the upper arm, connecting the shoulder to the elbow. It provides attachment for muscles of the arm and shoulder.',
    clinicalSignificance: 'Humeral fractures can damage the radial nerve. The surgical neck is a common fracture site.',
  },
  {
    name: 'Scapula',
    latinName: 'Os scapula',
    category: 'bone' as AnatomyCategory,
    system: 'skeletal' as BodySystem,
    region: 'upper_limb' as BodyRegion,
    difficulty: 'intermediate' as AnatomyDifficulty,
    description: 'The scapula, or shoulder blade, is a flat triangular bone that connects the humerus to the clavicle. It provides attachment for many muscles of the shoulder.',
    clinicalSignificance: 'Scapular fractures usually indicate high-energy trauma. Scapular winging indicates nerve damage.',
  },
  {
    name: 'Vertebral Column',
    latinName: 'Columna vertebralis',
    category: 'bone' as AnatomyCategory,
    system: 'skeletal' as BodySystem,
    region: 'back' as BodyRegion,
    difficulty: 'intermediate' as AnatomyDifficulty,
    description: 'The vertebral column consists of 33 vertebrae that protect the spinal cord and provide structural support for the body.',
    clinicalSignificance: 'Herniated discs, spinal stenosis, and compression fractures are common pathologies.',
  },
];

// Sample muscular structures
const muscularStructures = [
  {
    name: 'Biceps Brachii',
    latinName: 'Musculus biceps brachii',
    category: 'muscle' as AnatomyCategory,
    system: 'muscular' as BodySystem,
    region: 'upper_limb' as BodyRegion,
    difficulty: 'beginner' as AnatomyDifficulty,
    description: 'A two-headed muscle located on the anterior aspect of the arm. It flexes the elbow and supinates the forearm.',
    clinicalSignificance: 'Biceps tendon rupture can occur at the shoulder or elbow, causing a "Popeye" deformity.',
  },
  {
    name: 'Quadriceps Femoris',
    latinName: 'Musculus quadriceps femoris',
    category: 'muscle' as AnatomyCategory,
    system: 'muscular' as BodySystem,
    region: 'lower_limb' as BodyRegion,
    difficulty: 'beginner' as AnatomyDifficulty,
    description: 'A group of four muscles on the front of the thigh that extend the knee. Essential for walking, running, and jumping.',
    clinicalSignificance: 'Quadriceps tendon tears and strains are common in athletes. Weakness affects mobility significantly.',
  },
  {
    name: 'Deltoid',
    latinName: 'Musculus deltoideus',
    category: 'muscle' as AnatomyCategory,
    system: 'muscular' as BodySystem,
    region: 'upper_limb' as BodyRegion,
    difficulty: 'beginner' as AnatomyDifficulty,
    description: 'A large triangular muscle covering the shoulder joint. It abducts, flexes, and extends the arm.',
    clinicalSignificance: 'The deltoid is a common site for intramuscular injections. Tears can occur with shoulder trauma.',
  },
];

// Sample journey
const sampleJourney = {
  title: 'Introduction to the Skeletal System',
  description: 'Learn the fundamentals of human bones, their structure, and function.',
  system: 'skeletal' as BodySystem,
  region: null,
  difficulty: 'beginner' as AnatomyDifficulty,
  estimatedMinutes: 45,
  emoji: '🦴',
  color: '#f5f5f4',
  prerequisites: [],
  steps: [
    {
      id: 'step-1',
      title: 'What is the Skeletal System?',
      type: 'lesson' as const,
      content: 'The skeletal system is the framework of bones and connective tissues that provides structure and support for the body. It consists of 206 bones in the adult human body.',
      structureIds: [],
    },
    {
      id: 'step-2',
      title: 'Functions of Bones',
      type: 'lesson' as const,
      content: 'Bones serve multiple functions: support, protection, movement, mineral storage, and blood cell production.',
      structureIds: [],
    },
    {
      id: 'step-3',
      title: 'Explore the Femur',
      type: 'exploration' as const,
      content: 'The femur is the longest bone in the body. Explore its structure and learn about its key features.',
      structureIds: ['femur'],
    },
    {
      id: 'step-4',
      title: 'Knowledge Check',
      type: 'quiz' as const,
      content: 'Test your understanding of the skeletal system basics.',
      structureIds: [],
    },
  ],
};

/**
 * POST /api/anatomy/seed
 * Initialize the anatomy database with sample data
 * Protected: only works in development or with admin auth
 */
export async function POST(request: NextRequest) {
  try {
    // Check environment or auth
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (!isDevelopment) {
      return NextResponse.json(
        { error: 'Seeding only allowed in development mode' },
        { status: 403 }
      );
    }

    console.log('Running Anatomy Hall migrations...');
    await runAnatomyMigrations();

    console.log('Seeding skeletal structures...');
    const createdStructures: Record<string, string> = {};

    for (const structure of skeletalStructures) {
      const id = structure.name.toLowerCase().replace(/\s+/g, '-');
      createdStructures[structure.name] = id;

      await createStructure({
        id,
        ...structure,
        parentStructureId: null,
        modelPath: `/models/anatomy/${id}.glb`,
        modelHighlightIds: [id],
        imageUrls: [`/images/anatomy/${id}.jpg`],
        prerequisites: [],
        relatedStructures: [],
      });

      // Create lenses for each structure
      const lensTypes: AnatomyLensType[] = ['anatomical', 'functional', 'clinical', 'connections', 'interactive'];

      for (const lensType of lensTypes) {
        await createLens({
          id: `${id}-${lensType}`,
          structureId: id,
          lensType,
          title: `${structure.name} - ${lensType.charAt(0).toUpperCase() + lensType.slice(1)}`,
          content: getLensContent(structure, lensType),
          imageReferences: [],
          videoReferences: [],
          modelAnnotations: [],
          interactiveData: null,
        });
      }
    }

    console.log('Seeding muscular structures...');
    for (const structure of muscularStructures) {
      const id = structure.name.toLowerCase().replace(/\s+/g, '-');
      createdStructures[structure.name] = id;

      await createStructure({
        id,
        ...structure,
        parentStructureId: null,
        modelPath: `/models/anatomy/${id}.glb`,
        modelHighlightIds: [id],
        imageUrls: [`/images/anatomy/${id}.jpg`],
        prerequisites: [],
        relatedStructures: [],
      });

      const lensTypes: AnatomyLensType[] = ['anatomical', 'functional', 'clinical', 'connections', 'interactive'];

      for (const lensType of lensTypes) {
        await createLens({
          id: `${id}-${lensType}`,
          structureId: id,
          lensType,
          title: `${structure.name} - ${lensType.charAt(0).toUpperCase() + lensType.slice(1)}`,
          content: getLensContent(structure, lensType),
          imageReferences: [],
          videoReferences: [],
          modelAnnotations: [],
          interactiveData: null,
        });
      }
    }

    // Create some relationships
    console.log('Creating relationships...');
    await createRelationship({
      id: 'rel-biceps-humerus',
      sourceStructureId: 'biceps-brachii',
      targetStructureId: 'humerus',
      relationshipType: 'origin',
      description: 'The biceps brachii originates from the scapula and inserts on the radius',
      clinicalNote: null,
    });

    await createRelationship({
      id: 'rel-quad-femur',
      sourceStructureId: 'quadriceps-femoris',
      targetStructureId: 'femur',
      relationshipType: 'origin',
      description: 'The quadriceps femoris originates from the femur and ilium',
      clinicalNote: null,
    });

    // Create journey
    console.log('Creating learning journey...');
    await createJourney({
      id: 'skeletal-intro',
      ...sampleJourney,
    });

    // Create model metadata
    console.log('Creating model metadata...');
    await createModel({
      id: 'model-full-body',
      filePath: '/models/anatomy/full-body.glb',
      fileName: 'full-body.glb',
      modelType: 'full_body',
      system: null,
      region: null,
      meshIds: Object.values(createdStructures),
      meshToStructureMap: Object.fromEntries(
        Object.entries(createdStructures).map(([name, id]) => [id, id])
      ),
      thumbnailUrl: '/images/anatomy/full-body-thumb.jpg',
    });

    await createModel({
      id: 'model-skeletal',
      filePath: '/models/anatomy/skeletal-system.glb',
      fileName: 'skeletal-system.glb',
      modelType: 'system',
      system: 'skeletal',
      region: null,
      meshIds: ['femur', 'tibia', 'humerus', 'scapula', 'vertebral-column'],
      meshToStructureMap: {
        femur: 'femur',
        tibia: 'tibia',
        humerus: 'humerus',
        scapula: 'scapula',
        'vertebral-column': 'vertebral-column',
      },
      thumbnailUrl: '/images/anatomy/skeletal-thumb.jpg',
    });

    return NextResponse.json({
      success: true,
      message: 'Anatomy Hall seeded successfully',
      stats: {
        structures: skeletalStructures.length + muscularStructures.length,
        lenses: (skeletalStructures.length + muscularStructures.length) * 5,
        relationships: 2,
        journeys: 1,
        models: 2,
      },
    });
  } catch (error) {
    console.error('Error seeding Anatomy Hall:', error);
    return NextResponse.json(
      { error: 'Failed to seed Anatomy Hall', details: String(error) },
      { status: 500 }
    );
  }
}

function getLensContent(
  structure: { name: string; description: string; clinicalSignificance: string },
  lensType: AnatomyLensType
): string {
  switch (lensType) {
    case 'anatomical':
      return `# ${structure.name}\n\n${structure.description}\n\n## Key Features\n\n- Location and orientation\n- Size and shape\n- Surface anatomy\n- Bony landmarks`;

    case 'functional':
      return `# Function of ${structure.name}\n\n${structure.description}\n\n## Biomechanics\n\nUnderstanding how this structure contributes to movement and function.\n\n## Related Movements\n\n- Primary functions\n- Supporting roles\n- Movement patterns`;

    case 'clinical':
      return `# Clinical Relevance\n\n${structure.clinicalSignificance}\n\n## Common Conditions\n\n- Injuries and trauma\n- Degenerative conditions\n- Congenital abnormalities\n\n## Diagnostic Considerations\n\n- Physical examination findings\n- Imaging modalities\n- Clinical tests`;

    case 'connections':
      return `# Connections of ${structure.name}\n\n## Relationships\n\n- Articulations with other structures\n- Muscle attachments\n- Neurovascular supply\n- Fascial connections\n\n## Functional Chains\n\nHow this structure works with others in movement.`;

    case 'interactive':
      return `# Explore ${structure.name}\n\nUse the 3D model to explore this structure from different angles.\n\n## Try This\n\n1. Rotate to see all surfaces\n2. Identify key landmarks\n3. Trace the relationships to other structures\n4. Test yourself with the quiz mode`;

    default:
      return structure.description;
  }
}
