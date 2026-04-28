/**
 * Alchemy Module Database Migrations
 * Creates tables for reactions, techniques, temperatures, molecules
 */

import { getUniversalDb, execute } from './turso';

export async function runAlchemyMigrations() {
  const db = getUniversalDb();

  // Create alchemy_reactions table
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS alchemy_reactions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      short_description TEXT,
      temperature_min_c REAL,
      temperature_max_c REAL,
      temperature_min_f REAL,
      temperature_max_f REAL,
      reactants TEXT,
      products TEXT,
      mechanism TEXT,
      visual_cues TEXT,
      common_foods TEXT,
      cultural_examples TEXT,
      image_url TEXT,
      video_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );

  // Create alchemy_techniques table
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS alchemy_techniques (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      native_name TEXT,
      culture TEXT NOT NULL,
      description TEXT NOT NULL,
      short_description TEXT,
      science_explanation TEXT,
      temperature_range TEXT,
      key_reactions TEXT,
      equipment TEXT,
      key_techniques TEXT,
      historical_context TEXT,
      health_benefits TEXT,
      example_dishes TEXT,
      image_url TEXT,
      video_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );

  // Create alchemy_temperatures table
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS alchemy_temperatures (
      id TEXT PRIMARY KEY,
      temperature_c REAL NOT NULL,
      temperature_f REAL NOT NULL,
      event_name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      visual_indicator TEXT,
      reversible INTEGER DEFAULT 0,
      related_reactions TEXT,
      foods_affected TEXT,
      tips TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );

  // Create alchemy_molecules table
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS alchemy_molecules (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      common_name TEXT,
      chemical_formula TEXT,
      molecular_weight REAL,
      category TEXT NOT NULL,
      taste_profile TEXT,
      aroma_profile TEXT,
      found_in TEXT,
      created_by_reaction TEXT,
      threshold_ppm REAL,
      safety_notes TEXT,
      synergies TEXT,
      antagonists TEXT,
      image_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );

  // Create alchemy_user_progress table
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS alchemy_user_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      section_id TEXT NOT NULL,
      section_type TEXT NOT NULL,
      completed_at TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );

  // Create indexes
  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_reactions_type ON alchemy_reactions(type)`
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_techniques_culture ON alchemy_techniques(culture)`
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_temperatures_c ON alchemy_temperatures(temperature_c)`
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_molecules_category ON alchemy_molecules(category)`
  );

  await execute(
    db,
    `CREATE INDEX IF NOT EXISTS idx_alchemy_progress_user ON alchemy_user_progress(user_id)`
  );

  console.log('Alchemy migrations completed successfully');
}

// Seed initial data
export async function seedAlchemyData() {
  const db = getUniversalDb();

  // Check if data already exists
  const existing = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM alchemy_reactions',
    args: [],
  });

  const row = existing.rows[0] as Record<string, unknown>;
  if (row && Number(row.count) > 0) {
    console.log('Alchemy data already seeded');
    return;
  }

  // Seed reactions
  const reactions = getReactionData();
  for (const reaction of reactions) {
    await execute(
      db,
      `INSERT INTO alchemy_reactions (
        id, name, type, description, short_description,
        temperature_min_c, temperature_max_c, temperature_min_f, temperature_max_f,
        reactants, products, mechanism, visual_cues, common_foods, cultural_examples
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reaction.id,
        reaction.name,
        reaction.type,
        reaction.description,
        reaction.shortDescription,
        reaction.temperatureMinC,
        reaction.temperatureMaxC,
        reaction.temperatureMinF,
        reaction.temperatureMaxF,
        JSON.stringify(reaction.reactants),
        JSON.stringify(reaction.products),
        reaction.mechanism,
        JSON.stringify(reaction.visualCues),
        JSON.stringify(reaction.commonFoods),
        JSON.stringify(reaction.culturalExamples),
      ]
    );
  }

  // Seed techniques
  const techniques = getTechniqueData();
  for (const technique of techniques) {
    await execute(
      db,
      `INSERT INTO alchemy_techniques (
        id, name, native_name, culture, description, short_description,
        science_explanation, temperature_range, key_reactions, equipment,
        key_techniques, historical_context, health_benefits, example_dishes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        technique.id,
        technique.name,
        technique.nativeName,
        technique.culture,
        technique.description,
        technique.shortDescription,
        technique.scienceExplanation,
        technique.temperatureRange,
        JSON.stringify(technique.keyReactions),
        JSON.stringify(technique.equipment),
        JSON.stringify(technique.keyTechniques),
        technique.historicalContext,
        technique.healthBenefits,
        JSON.stringify(technique.exampleDishes),
      ]
    );
  }

  // Seed temperatures
  const temperatures = getTemperatureData();
  for (const temp of temperatures) {
    await execute(
      db,
      `INSERT INTO alchemy_temperatures (
        id, temperature_c, temperature_f, event_name, description,
        category, visual_indicator, reversible, related_reactions,
        foods_affected, tips
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        temp.id,
        temp.temperatureC,
        temp.temperatureF,
        temp.eventName,
        temp.description,
        temp.category,
        temp.visualIndicator,
        temp.reversible ? 1 : 0,
        JSON.stringify(temp.relatedReactions),
        JSON.stringify(temp.foodsAffected),
        temp.tips,
      ]
    );
  }

  // Seed molecules
  const molecules = getMoleculeData();
  for (const molecule of molecules) {
    await execute(
      db,
      `INSERT INTO alchemy_molecules (
        id, name, common_name, chemical_formula, molecular_weight,
        category, taste_profile, aroma_profile, found_in,
        created_by_reaction, threshold_ppm, safety_notes, synergies, antagonists
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        molecule.id,
        molecule.name,
        molecule.commonName,
        molecule.chemicalFormula,
        molecule.molecularWeight,
        molecule.category,
        JSON.stringify(molecule.tasteProfile),
        JSON.stringify(molecule.aromaProfile),
        JSON.stringify(molecule.foundIn),
        molecule.createdByReaction,
        molecule.thresholdPpm,
        molecule.safetyNotes,
        JSON.stringify(molecule.synergies),
        JSON.stringify(molecule.antagonists),
      ]
    );
  }

  console.log('Alchemy data seeded successfully');
}

// Ensure migrations run
let migrationsRun = false;

export async function ensureAlchemyMigrations() {
  if (migrationsRun) return;
  await runAlchemyMigrations();
  await seedAlchemyData();
  migrationsRun = true;
}

// ==================== SEED DATA ====================

function getReactionData() {
  return [
    {
      id: 'maillard-reaction',
      name: 'Maillard Reaction',
      type: 'maillard',
      description: `The Maillard reaction is a complex series of chemical reactions between amino acids and reducing sugars that occurs when foods are heated above 140°C (280°F). Named after French chemist Louis-Camille Maillard who first described it in 1912, this reaction is responsible for the characteristic brown color and complex flavors in bread crusts, seared meat, coffee, chocolate, and countless other foods.

The reaction proceeds through multiple stages: initial condensation of an amino acid with a sugar, rearrangement to form an Amadori compound, and then a cascade of reactions producing hundreds of different flavor compounds called melanoidins. The specific flavors produced depend on which amino acids and sugars are present, the temperature, pH, water activity, and cooking time.

At temperatures around 140-165°C, the reaction accelerates dramatically. Different amino acids produce different flavor profiles: cysteine creates meaty flavors, proline contributes to bread-like aromas, and glycine tends toward caramel notes. This is why a steak seared at high heat tastes completely different from one slowly cooked at low temperature.

Understanding Maillard chemistry helps explain why properly browned food tastes so good - it literally creates new flavor molecules that don't exist in the raw ingredients. The reaction also creates beneficial antioxidants, though at very high temperatures can produce harmful compounds like acrylamide.`,
      shortDescription: 'Browning reaction between amino acids and sugars creating complex flavors',
      temperatureMinC: 140,
      temperatureMaxC: 165,
      temperatureMinF: 280,
      temperatureMaxF: 330,
      reactants: ['Amino acids (proteins)', 'Reducing sugars (glucose, fructose, lactose)'],
      products: ['Melanoidins', 'Pyrazines', 'Furans', 'Thiophenes', 'Strecker aldehydes'],
      mechanism: 'Condensation → Schiff base → Amadori rearrangement → Degradation → Polymerization to melanoidins',
      visualCues: [
        { type: 'color', description: 'Pale to golden to deep brown', indicator: 'Progressive browning' },
        { type: 'smell', description: 'Toasty, nutty, caramel-like, meaty', indicator: 'Aroma intensifies' },
        { type: 'texture', description: 'Surface becomes crisp and dry', indicator: 'Moisture evaporation' },
        { type: 'sound', description: 'Sizzling intensifies then diminishes', indicator: 'Water loss' },
      ],
      commonFoods: ['Bread crust', 'Seared steak', 'Coffee', 'Chocolate', 'Roasted nuts', 'French fries', 'Toast', 'Beer'],
      culturalExamples: [
        { culture: 'french', dish: 'Croissant', description: 'Golden flaky crust from butter and flour Maillard reactions' },
        { culture: 'american', dish: 'BBQ brisket', description: 'Dark bark formation from spice rub reacting with meat proteins' },
        { culture: 'japanese', dish: 'Teriyaki', description: 'Caramelized soy sauce glaze with complex umami-sweet flavors' },
        { culture: 'indian', dish: 'Tandoori chicken', description: 'Charred edges from yogurt marinade proteins in extreme heat' },
      ],
    },
    {
      id: 'caramelization',
      name: 'Caramelization',
      type: 'caramelization',
      description: `Caramelization is the thermal decomposition of sugars, a type of non-enzymatic browning that occurs when sugars are heated above their melting point. Unlike the Maillard reaction, caramelization involves only sugars - no proteins are required.

The process begins when sugar molecules start breaking apart due to heat. For sucrose, this starts around 160°C (320°F). The sugar first melts, then begins to decompose, releasing water and forming new compounds. Different sugars caramelize at different temperatures: fructose starts earliest at 110°C, while glucose and sucrose begin around 160°C.

As caramelization progresses, over 100 different chemical compounds are created, including diacetyl (buttery flavor), furans (nutty, caramel flavor), and maltol (toasty notes). The characteristic brown color comes from polymer compounds called caramelans, caramelens, and caramelins.

In candy making, precise temperature control is critical because different stages produce completely different textures:
- Thread stage (215°F/102°C): Thin threads, used for syrups
- Soft ball (240°F/116°C): Pliable balls, for fudge and pralines
- Hard crack (300°F/149°C): Brittle threads, for lollipops
- Light caramel (320°F/160°C): Amber color, sweet flavor
- Dark caramel (350°F/177°C): Deep amber, complex bitter-sweet

Beyond this point, the sugar rapidly approaches burning, with black caramel at 380°F being used only as a coloring agent.`,
      shortDescription: 'Thermal decomposition of sugars into complex flavor compounds',
      temperatureMinC: 110,
      temperatureMaxC: 180,
      temperatureMinF: 230,
      temperatureMaxF: 356,
      reactants: ['Sucrose', 'Glucose', 'Fructose', 'Other reducing sugars'],
      products: ['Diacetyl', 'Furans', 'Maltol', 'Caramelans', 'Caramelens', 'Caramelins'],
      mechanism: 'Melting → Isomerization → Dehydration → Fragmentation → Polymerization',
      visualCues: [
        { type: 'color', description: 'Clear to amber to dark brown', indicator: 'Color darkens with time/temp' },
        { type: 'smell', description: 'Sweet, then butterscotch, then bitter', indicator: 'Aroma progression' },
        { type: 'texture', description: 'Liquid becomes increasingly viscous', indicator: 'Water loss' },
        { type: 'sound', description: 'Bubbling slows as water evaporates', indicator: 'Concentration increases' },
      ],
      commonFoods: ['Crème brûlée', 'Caramel sauce', 'Toffee', 'Dulce de leche', 'Flan', 'Caramelized onions'],
      culturalExamples: [
        { culture: 'french', dish: 'Crème brûlée', description: 'Torched sugar creates crackly caramel shell' },
        { culture: 'mexican', dish: 'Cajeta', description: 'Goat milk caramelized with sugar into spreadable dulce' },
        { culture: 'italian', dish: 'Amaretti cookies', description: 'Sugar caramelization in almond cookies' },
      ],
    },
    {
      id: 'protein-denaturation',
      name: 'Protein Denaturation',
      type: 'denaturation',
      description: `Protein denaturation is the process by which proteins lose their native three-dimensional structure due to external stress such as heat, acid, or mechanical agitation. This fundamental reaction is responsible for transforming raw eggs into cooked eggs, firming up meat, and even "cooking" ceviche with lime juice.

Proteins are long chains of amino acids folded into precise three-dimensional shapes, held together by hydrogen bonds and other weak forces. When exposed to heat or acid, these bonds break, causing the protein to unfold (denature). The unfolded proteins then tangle together, forming new bonds in a process called coagulation.

Temperature thresholds vary by protein type:
- Egg white albumin: 144-149°F (62-65°C)
- Egg yolk proteins: 149-158°F (65-70°C)
- Myosin (muscle protein): 122-140°F (50-60°C)
- Actin (muscle protein): 150°F+ (65°C+)
- Collagen: begins unwinding at 122°F (50°C)

Acid denaturation works differently - the low pH disrupts hydrogen bonds without heat. In ceviche, lime juice (pH ~2.5) denatures fish proteins over 15-30 minutes, turning the flesh opaque and firm while remaining "raw" by temperature standards. However, acid denaturation produces different textures than heat - ceviche fish is firmer and more "raw" tasting than cooked fish.

The key insight for cooking is that precise temperature control allows you to denature some proteins while leaving others intact - this is the secret behind perfectly cooked eggs with runny yolks but set whites, or sous vide steaks that are pink throughout.`,
      shortDescription: 'Protein unfolding and coagulation from heat or acid',
      temperatureMinC: 50,
      temperatureMaxC: 70,
      temperatureMinF: 122,
      temperatureMaxF: 158,
      reactants: ['Proteins (albumin, myosin, actin, collagen)', 'Heat or acid'],
      products: ['Coagulated protein networks', 'Released water'],
      mechanism: 'Native state → Unfolding (denaturation) → Aggregation → Coagulation (gel formation)',
      visualCues: [
        { type: 'color', description: 'Translucent to opaque white', indicator: 'Light scattering by protein network' },
        { type: 'texture', description: 'Liquid to firm/solid', indicator: 'Protein network formation' },
        { type: 'smell', description: 'Raw to cooked aroma', indicator: 'Volatile release' },
      ],
      commonFoods: ['Eggs', 'Steak', 'Chicken breast', 'Ceviche', 'Cheese curds', 'Yogurt'],
      culturalExamples: [
        { culture: 'peruvian', dish: 'Ceviche', description: 'Raw fish "cooked" in lime juice acid' },
        { culture: 'japanese', dish: 'Onsen tamago', description: 'Slow-cooked eggs in hot springs at precise temperature' },
        { culture: 'french', dish: 'Omelette', description: 'Gentle heat creates creamy curds' },
        { culture: 'italian', dish: 'Fresh mozzarella', description: 'Acid-curdled milk proteins stretched in hot water' },
      ],
    },
    {
      id: 'fermentation',
      name: 'Fermentation',
      type: 'fermentation',
      description: `Fermentation is an anaerobic metabolic process in which microorganisms (bacteria, yeasts, or molds) convert sugars into acids, gases, or alcohol. This ancient preservation technique predates written history and is fundamental to cuisines worldwide.

Lactic acid fermentation is particularly important in food. Lactic acid bacteria (LAB) convert lactose or glucose into lactic acid, lowering pH and creating the sour taste in yogurt, sauerkraut, and kimchi. The process typically involves a succession of bacterial species:

In sauerkraut fermentation:
1. Leuconostoc mesenteroides initiates (heterofermentative)
2. Lactobacillus plantarum takes over (homofermentative)
3. Pediococcus species finish

Kimchi follows a similar pattern with Leuconostoc gelidum, Weissella kandleri, and Lactobacillus sakei, reaching bacterial counts of 10⁷-10⁸ CFU/g.

Alcoholic fermentation by yeasts (Saccharomyces cerevisiae) converts sugars to ethanol and CO₂, producing beer, wine, and bread's rise. Acetic acid fermentation then converts ethanol to vinegar.

Mold fermentations are essential to Asian cuisines. Aspergillus oryzae (koji) breaks down proteins and starches in soy sauce, miso, and sake production. This enzymatic activity creates glutamate (umami) and complex flavors impossible to achieve otherwise.

The microbial communities create ecosystems - as acid accumulates, only acid-tolerant species survive, naturally preserving the food and creating unique flavor profiles.`,
      shortDescription: 'Microbial transformation of sugars into acids, alcohol, or gases',
      temperatureMinC: 18,
      temperatureMaxC: 32,
      temperatureMinF: 64,
      temperatureMaxF: 90,
      reactants: ['Sugars (glucose, lactose, sucrose)', 'Microorganisms (LAB, yeasts, molds)'],
      products: ['Lactic acid', 'Ethanol', 'Acetic acid', 'CO₂', 'Flavor compounds'],
      mechanism: 'Glycolysis → Pyruvate → Lactic acid (LAB) or Ethanol + CO₂ (yeast)',
      visualCues: [
        { type: 'smell', description: 'Sour, tangy, complex', indicator: 'Acid and ester production' },
        { type: 'texture', description: 'Vegetables soften, dairy thickens', indicator: 'Cell wall breakdown, protein changes' },
        { type: 'sound', description: 'Bubbling (CO₂ release)', indicator: 'Active fermentation' },
        { type: 'color', description: 'May darken or develop bloom', indicator: 'Oxidation and microbial growth' },
      ],
      commonFoods: ['Kimchi', 'Sauerkraut', 'Yogurt', 'Miso', 'Soy sauce', 'Bread', 'Beer', 'Wine', 'Cheese'],
      culturalExamples: [
        { culture: 'korean', dish: 'Kimchi', description: 'Lacto-fermented cabbage with chili, garlic, fish sauce' },
        { culture: 'japanese', dish: 'Miso', description: 'Koji mold ferments soybeans for months to years' },
        { culture: 'indian', dish: 'Idli/Dosa', description: 'Rice and lentil batter fermented overnight' },
        { culture: 'mexican', dish: 'Tepache', description: 'Fermented pineapple drink with wild yeasts' },
      ],
    },
    {
      id: 'emulsification',
      name: 'Emulsification',
      type: 'emulsification',
      description: `Emulsification is the process of mixing two immiscible liquids (typically oil and water) into a stable, uniform mixture. This is fundamental to countless sauces, from mayonnaise to vinaigrettes to hollandaise.

The key challenge is that oil and water naturally separate due to their different molecular properties. Emulsifiers solve this by having molecules with both hydrophilic (water-loving) and hydrophobic (oil-loving) parts. Lecithin, found in egg yolks, is nature's perfect emulsifier.

When you make mayonnaise, you're creating an oil-in-water emulsion. The lecithin molecules arrange themselves at the oil-water interface, with their hydrophobic tails embedded in oil droplets and hydrophilic heads facing the water. This creates a protective barrier around each oil droplet, preventing them from coalescing.

Egg yolk is itself a complex emulsion - 50% water, 32% lipids, 16% protein. About 28% of the lipids are phospholipids (including lecithin), making egg yolks incredibly effective emulsifiers. A single yolk can emulsify 180-240 mL of oil.

The technique matters: oil must be added slowly while whisking vigorously to break oil into tiny droplets. If added too fast, the emulsion "breaks" - the oil droplets overwhelm the emulsifier and coalesce. Broken emulsions can often be rescued by starting fresh with more yolk and slowly whisking in the broken mixture.

Other emulsifiers include mustard (used in vinaigrettes), casein in dairy, and lecithin from soy. Modern cuisine uses hydrocolloids like xanthan gum for stable emulsions without eggs.`,
      shortDescription: 'Stable mixing of oil and water using emulsifiers',
      temperatureMinC: null,
      temperatureMaxC: null,
      temperatureMinF: null,
      temperatureMaxF: null,
      reactants: ['Oil', 'Water/aqueous phase', 'Emulsifier (lecithin, mustard, proteins)'],
      products: ['Stable emulsion (oil-in-water or water-in-oil)'],
      mechanism: 'Mechanical dispersion → Emulsifier adsorption at interface → Droplet stabilization',
      visualCues: [
        { type: 'texture', description: 'Thin liquid to thick, creamy', indicator: 'Successful emulsification' },
        { type: 'color', description: 'Becomes opaque, lightens', indicator: 'Light scattering by droplets' },
      ],
      commonFoods: ['Mayonnaise', 'Hollandaise', 'Vinaigrette', 'Aioli', 'Butter sauces', 'Ice cream'],
      culturalExamples: [
        { culture: 'french', dish: 'Hollandaise', description: 'Warm butter emulsion with egg yolks and lemon' },
        { culture: 'mediterranean', dish: 'Aioli', description: 'Garlic emulsified with olive oil' },
        { culture: 'italian', dish: 'Pesto', description: 'Cheese and nuts help emulsify oil with basil' },
      ],
    },
    {
      id: 'starch-gelatinization',
      name: 'Starch Gelatinization',
      type: 'gelatinization',
      description: `Starch gelatinization is the process by which starch granules absorb water, swell, and release their contents when heated, creating the thickening effect essential to sauces, pasta, rice, and bread.

Starch granules are microscopic packets containing two types of molecules: amylose (linear chains) and amylopectin (highly branched). When heated in water, the granules absorb water and swell dramatically - up to 30 times their original volume.

The gelatinization temperature varies by starch source:
- Potato: 56-66°C (133-151°F)
- Corn: 62-72°C (144-162°F)
- Wheat: 58-64°C (136-147°F)
- Rice: varies by variety (58-78°C)

The amylose/amylopectin ratio significantly affects cooking behavior. Long-grain rice (high amylose) produces separate, fluffy grains and has a higher gelatinization temperature. Short-grain rice (high amylopectin) becomes sticky and creamy. This is why risotto requires Arborio (short grain) while pilaf uses basmati (long grain).

In pasta, gelatinization is why al dente matters. Cooking to 60-80°C gelatinizes the surface starch, but the center remains firm with some ungelatinized starch. This creates the characteristic texture contrast. Overcooking fully gelatinizes all the starch, making pasta mushy.

After cooling, gelatinized starch undergoes retrogradation - the molecules realign and form new crystalline structures, causing staling in bread and firmness in day-old rice. This is why reheated rice makes better fried rice - the retrograded starch has different texture and absorbs flavors better.`,
      shortDescription: 'Starch granules swell in water and release thickening agents',
      temperatureMinC: 56,
      temperatureMaxC: 80,
      temperatureMinF: 133,
      temperatureMaxF: 176,
      reactants: ['Starch granules (amylose + amylopectin)', 'Water', 'Heat'],
      products: ['Gelatinized starch (thickened liquid or cooked grain)'],
      mechanism: 'Water absorption → Granule swelling → Amylose leaching → Viscosity increase',
      visualCues: [
        { type: 'texture', description: 'Thin liquid thickens, grains soften', indicator: 'Starch swelling' },
        { type: 'color', description: 'Translucent to opaque', indicator: 'Light scattering' },
      ],
      commonFoods: ['Pasta', 'Rice', 'Bread', 'Gravy', 'Pudding', 'Potatoes', 'Cornstarch slurry'],
      culturalExamples: [
        { culture: 'italian', dish: 'Risotto', description: 'Constant stirring releases amylopectin for creamy texture' },
        { culture: 'japanese', dish: 'Sushi rice', description: 'Short-grain rice gelatinizes to sticky, moldable texture' },
        { culture: 'chinese', dish: 'Congee', description: 'Rice cooked until starch fully disperses into porridge' },
      ],
    },
    {
      id: 'oxidation',
      name: 'Oxidation',
      type: 'oxidation',
      description: `Oxidation in cooking refers to chemical reactions involving oxygen that can both create desirable flavors (in aged wine and cheese) and cause spoilage (rancid fats, browned apples).

In fats and oils, oxidation occurs when unsaturated fatty acids react with oxygen, producing off-flavors and potentially harmful compounds. This is why oils have "smoke points" - the temperature at which they begin breaking down and producing acrolein (the compound in smoke that makes eyes water).

Polyunsaturated fats are most susceptible to oxidation, which is why oils high in PUFAs (like flaxseed) should not be heated. Saturated fats are most stable. However, smoke point alone doesn't predict cooking performance - oxidative stability (resistance to breakdown) is more important. Extra virgin olive oil, despite a moderate smoke point, is highly stable due to its antioxidants.

Enzymatic browning is oxidation catalyzed by polyphenol oxidase (PPO) enzymes. When you cut an apple, damaged cells release PPO, which converts phenolic compounds to brown melanin pigments. Acids (lemon juice), heat (blanching), or exclusion of oxygen can prevent this.

Controlled oxidation creates desired flavors in some foods. Wine aging involves careful oxygen exposure that softens tannins and develops complexity. Oxidized sherry intentionally encourages the process. Dry-aged beef develops nutty, complex flavors through fat oxidation.`,
      shortDescription: 'Reactions with oxygen causing browning, rancidity, or flavor development',
      temperatureMinC: null,
      temperatureMaxC: null,
      temperatureMinF: null,
      temperatureMaxF: null,
      reactants: ['Fats/oils', 'Phenolic compounds', 'Oxygen', 'Enzymes (PPO)'],
      products: ['Aldehydes', 'Ketones', 'Melanin pigments', 'Free radicals'],
      mechanism: 'Free radical chain reaction (lipid oxidation) or Enzymatic oxidation (browning)',
      visualCues: [
        { type: 'color', description: 'Brown discoloration (fruit), darkening (oils)', indicator: 'Oxidation occurring' },
        { type: 'smell', description: 'Off odors, rancid, stale', indicator: 'Aldehyde formation' },
      ],
      commonFoods: ['Cut apples', 'Cooking oils', 'Aged wine', 'Dry-aged beef', 'Avocado'],
      culturalExamples: [
        { culture: 'french', dish: 'Dry-aged beef', description: 'Controlled oxidation develops nutty, complex flavors' },
        { culture: 'mediterranean', dish: 'Oxidized sherry', description: 'Intentional oxygen exposure creates distinct flavors' },
      ],
    },
    {
      id: 'hydrolysis',
      name: 'Hydrolysis',
      type: 'hydrolysis',
      description: `Hydrolysis is a chemical reaction where water molecules break chemical bonds, splitting larger molecules into smaller ones. In cooking, this process tenderizes tough cuts of meat, breaks down starches, and creates flavorful compounds.

The most important culinary application is collagen hydrolysis. Collagen, the tough connective tissue in meat, is made of three protein chains wound in a triple helix. When heated in moist conditions above 160°F (71°C), water molecules attack the collagen structure, breaking it down into gelatin - single protein strands that give braised meats their silky texture.

This is why tough cuts like brisket, short ribs, and oxtail require long, slow cooking in liquid. The collagen-rich connective tissue converts to gelatin, making the meat fork-tender. Dry cooking these cuts would make them chewy and tough.

Time and temperature trade off: at 160°F, collagen conversion takes 24+ hours. At 180°F, it takes 6-8 hours. Pressure cooking accelerates the process by raising the boiling point of water.

Hydrolysis also occurs in:
- Starch: water breaks glycosidic bonds, releasing sugars
- Proteins: pepsin and proteases break peptide bonds
- Fats: lipases break triglycerides into fatty acids
- Alkaline hydrolysis: used in nixtamalization to break corn's cell walls

Understanding hydrolysis explains why wet-cooking methods (braising, stewing) produce different results than dry methods (roasting, grilling), and why certain cuts benefit from each approach.`,
      shortDescription: 'Water molecules breaking down larger molecules into smaller parts',
      temperatureMinC: 71,
      temperatureMaxC: 100,
      temperatureMinF: 160,
      temperatureMaxF: 212,
      reactants: ['Collagen', 'Starch', 'Proteins', 'Water', 'Heat or enzymes'],
      products: ['Gelatin', 'Sugars', 'Amino acids', 'Fatty acids'],
      mechanism: 'Water molecule attacks bond → Bond cleaves → Products released',
      visualCues: [
        { type: 'texture', description: 'Tough to tender (meat)', indicator: 'Collagen breakdown' },
        { type: 'texture', description: 'Liquid thickens (stocks)', indicator: 'Gelatin release' },
      ],
      commonFoods: ['Braised meats', 'Bone broth', 'Stocks', 'Slow-cooked stews'],
      culturalExamples: [
        { culture: 'french', dish: 'Pot-au-feu', description: 'Slow-simmered beef releases gelatin into rich broth' },
        { culture: 'chinese', dish: 'Red-braised pork belly', description: 'Long cooking converts collagen to silky gelatin' },
        { culture: 'mexican', dish: 'Barbacoa', description: 'Steam-cooked beef cheeks become fork-tender' },
      ],
    },
  ];
}

function getTechniqueData() {
  return [
    {
      id: 'wok-hei',
      name: 'Wok Hei',
      nativeName: '鑊氣',
      culture: 'chinese',
      description: `Wok hei, literally "breath of the wok," is the elusive smoky, charred flavor that distinguishes restaurant stir-fry from home cooking. Achieving this requires temperatures of 650-750°F (340-400°C) - far hotter than typical home stoves can achieve - combined with specific techniques developed over centuries.

The science behind wok hei involves multiple simultaneous reactions. At these extreme temperatures, the Maillard reaction occurs almost instantaneously, browning proteins and creating hundreds of flavor compounds in seconds. Fat vaporizes and undergoes pyrolysis, contributing smoke flavors. The traditional seasoning layer on the wok (polymerized oil) acts as both a non-stick surface and a catalyst for flavor reactions.

Professional wok chefs have been studied tossing ingredients at approximately 2.7 times per second. This rapid motion serves multiple purposes: it prevents burning by limiting surface contact time, it exposes ingredients to the flame for brief moments of intense heat, and it ensures even cooking despite extremely high temperatures.

The Leidenfrost effect is used to test if the wok is ready. When water droplets dance and bead up on the surface (rather than immediately boiling away), the wok has reached the critical temperature around 379°F (193°C) where the mercury-ball effect occurs. Professional wok cooking begins above this threshold.

Home cooks can achieve partial wok hei by using the highest BTU burner available, working in very small batches, and keeping ingredients moving constantly.`,
      shortDescription: 'Smoky, charred flavor from extreme heat wok cooking',
      scienceExplanation: `1. Extreme heat (650-750°F) triggers instantaneous Maillard reaction
2. Oil vaporizes and undergoes pyrolysis, creating aromatic smoke compounds
3. Iron from seasoned wok surface catalyzes additional reactions
4. Rapid tossing (2.7x/second) exposes food to flame without burning
5. Leidenfrost effect indicates proper temperature (water beads at 379°F+)
6. Brief total cooking time (30-90 seconds) preserves vegetable crunch while charring exteriors`,
      temperatureRange: '650-750°F (340-400°C)',
      keyReactions: ['maillard-reaction', 'caramelization', 'oxidation'],
      equipment: ['Carbon steel wok (14")', 'High-BTU burner (100,000+ BTU ideal)', 'Long-handled spatula (wok chuan)', 'Metal ladle'],
      keyTechniques: [
        { step: 'Heat wok until smoking', science: 'Oil polymerization and Leidenfrost point reached', tip: 'Wait for first wisps of smoke, test with water droplet' },
        { step: 'Add oil, swirl to coat', science: 'Thin oil layer heats faster than pooled oil', tip: 'Use high smoke-point oil (peanut, avocado, rice bran)' },
        { step: 'Add protein first, spread thin', science: 'Maximum surface contact for Maillard browning', tip: 'Don\'t stir for 30 seconds to develop crust' },
        { step: 'Toss and flip rapidly', science: 'Brief flame contact triggers reactions without burning', tip: 'Push food up sides, let fall through flame zone' },
        { step: 'Vegetables in stages', science: 'Dense vegetables need longer than leafy ones', tip: 'Add by cooking time: carrots → peppers → greens' },
      ],
      historicalContext: 'Wok cooking evolved in Cantonese cuisine where high-heat cooking maximized flavor while conserving fuel in densely populated areas. The technique spread throughout China and Southeast Asia with regional variations.',
      healthBenefits: 'Rapid cooking preserves vitamins and nutrients that would be destroyed by longer cooking times. Minimal oil is needed due to non-stick seasoning.',
      exampleDishes: ['Beef chow fun', 'Fried rice', 'Stir-fried vegetables', 'Kung Pao chicken', 'Pad Thai'],
    },
    {
      id: 'nixtamalization',
      name: 'Nixtamalization',
      nativeName: 'Nixtamalización',
      culture: 'mexican',
      description: `Nixtamalization is a 3,500-year-old process that transforms dried corn into masa using an alkaline solution (traditionally lime water). This process is one of the most important food technologies in human history, and its significance wasn't understood until the 20th century.

The process involves cooking and steeping corn in water with calcium hydroxide (slaked lime) or wood ash (potassium hydroxide). This alkaline treatment softens the hull (pericarp), making it easy to remove, and fundamentally changes the corn's chemistry.

The crucial discovery: nixtamalization releases bound niacin (vitamin B3) that is otherwise biologically unavailable in corn. Corn contains niacin, but 50-80% is chemically bound as niacytin. Without alkaline processing, humans cannot absorb this niacin.

This explains why pellagra - a fatal niacin deficiency disease causing diarrhea, dermatitis, dementia, and death - ravaged European and American populations who adopted corn as a staple without the nixtamalization process. The Spanish conquistadors brought corn to Europe but didn't bring the "primitive" processing technique. The result: centuries of suffering from a preventable disease.

Mexican populations, who maintained the traditional process, never suffered from pellagra despite corn being their primary food source.

Additional benefits:
- Increases calcium content by 750% (85% bioavailable)
- Improves protein quality by increasing available tryptophan
- Reduces mycotoxins (harmful mold compounds)
- Creates the distinctive flavor and aroma of masa`,
      shortDescription: 'Alkaline treatment of corn that unlocks hidden nutrition',
      scienceExplanation: `1. Alkaline solution (pH 11-14) breaks cell wall bonds
2. Bound niacin (niacytin) is released and becomes bioavailable
3. Tryptophan becomes accessible (converts to niacin in body)
4. Calcium from lime is absorbed into kernel (750% increase)
5. Zein proteins become more digestible
6. Mycotoxins are degraded by high pH
7. Starch gelatinization improves masa texture`,
      temperatureRange: '180-200°F (82-93°C) during cooking',
      keyReactions: ['hydrolysis', 'gelatinization'],
      equipment: ['Large pot', 'Cal (calcium hydroxide)', 'Metate or corn grinder', 'Comal for cooking tortillas'],
      keyTechniques: [
        { step: 'Add cal to water (1% by weight)', science: 'Creates alkaline solution pH 11-14', tip: 'Food-grade calcium hydroxide only' },
        { step: 'Add dried corn, bring to boil', science: 'Heat accelerates alkaline penetration', tip: 'Use dried field corn, not sweet corn' },
        { step: 'Simmer 30-60 minutes', science: 'Pericarp softens, chemical changes begin', tip: 'Test by rubbing - hull should slip off easily' },
        { step: 'Steep overnight (8-16 hours)', science: 'Niacin release and calcium absorption continue', tip: 'Longer steeping = more pliable masa' },
        { step: 'Wash and grind', science: 'Remove hull, create masa texture', tip: 'Add water gradually while grinding' },
      ],
      historicalContext: 'Archaeological evidence dates nixtamalization to 1200-1500 BCE in Guatemala. Aztecs and Maya perfected the technique. European colonizers failed to adopt it, leading to pellagra epidemics lasting centuries.',
      healthBenefits: 'Prevents pellagra, significantly increases calcium and protein bioavailability, reduces toxin exposure from mold-contaminated corn.',
      exampleDishes: ['Corn tortillas', 'Tamales', 'Pupusas', 'Arepas', 'Hominy', 'Pozole'],
    },
    {
      id: 'tadka',
      name: 'Tadka (Tempering)',
      nativeName: 'तड़का / Chaunk / Thalippu',
      culture: 'indian',
      description: `Tadka (also called chaunk, tempering, or blooming) is the technique of heating whole spices and aromatics in hot fat to release and transform their flavors. This fundamental Indian technique appears in nearly every regional cuisine and is the secret to authentic Indian flavors.

The science is straightforward but crucial: many key flavor compounds in spices are fat-soluble, not water-soluble. Cumin's warm earthiness, mustard seed's sharp pungency, curry leaf's citrusy aroma - these compounds dissolve in oil far better than in water. When bloomed in hot oil, these compounds coat the fat molecules, which then distribute flavor evenly throughout the dish.

Temperature matters: the optimal range is 300-375°F (150-190°C). Below this, spices won't release their oils efficiently. Above this, they burn and become bitter. The visual cues are essential - cumin seeds should sizzle and turn slightly darker, mustard seeds should pop, curry leaves should crisp.

There are two tadka methods:
- Starting tadka: Spices bloom first, then ingredients are added
- Finishing tadka: Hot spiced oil is poured over a finished dish

The order of adding spices matters because different spices bloom at different rates. Hard, whole spices (cumin, mustard) go first and can handle higher heat. Delicate aromatics (curry leaves, dried chilis) go next. Ground spices and garlic go last, as they burn quickly.

Regional variations identify cuisines: mustard seeds and curry leaves signal South Indian, cumin and garlic in ghee suggest North Indian, panch phoron in mustard oil indicates Bengali.`,
      shortDescription: 'Blooming spices in hot fat to release flavor compounds',
      scienceExplanation: `1. Fat-soluble flavor compounds (curcumin, cuminaldehyde, allyl isothiocyanate) dissolve into oil
2. Heat (300-375°F) breaks spice cell walls, accelerating oil release
3. Volatile aromatics become airborne (the fragrant "bloom")
4. Maillard reactions may occur in dried spices
5. Oil carries dissolved flavors throughout the dish
6. Curcumin bioavailability increases dramatically when cooked in fat`,
      temperatureRange: '300-375°F (150-190°C)',
      keyReactions: ['maillard-reaction'],
      equipment: ['Small pan or tadka pan', 'Ghee or neutral oil', 'Slotted spoon'],
      keyTechniques: [
        { step: 'Heat fat until shimmering', science: 'Fat must be hot enough to instantly sizzle spices', tip: 'Test with single cumin seed - should sizzle immediately' },
        { step: 'Add whole spices first', science: 'Hard spices need more time and heat', tip: 'Cumin, mustard, fenugreek seeds go first' },
        { step: 'Wait for visual cues', science: 'Mustard pops when moisture inside vaporizes', tip: 'Cover briefly to contain popping' },
        { step: 'Add aromatics', science: 'Curry leaves, dried chilies release flavors quickly', tip: 'Stand back - curry leaves sputter violently' },
        { step: 'Add ground spices off heat', science: 'Ground spices burn in seconds', tip: 'Residual heat is sufficient' },
      ],
      historicalContext: 'Tadka evolved in India where spices were essential for preservation, medicine, and flavor. The technique spread throughout South Asia and adapted to each region\'s available spices and fats.',
      healthBenefits: 'Fat-soluble nutrients like curcumin (turmeric) absorb up to 2000% better when cooked in fat. Mustard oil has antimicrobial properties.',
      exampleDishes: ['Dal tadka', 'Sambar', 'Raita', 'Chole', 'Aloo gobi'],
    },
    {
      id: 'dashi-umami',
      name: 'Dashi & Umami Synergy',
      nativeName: '出汁',
      culture: 'japanese',
      description: `Dashi is the foundational stock of Japanese cuisine, and understanding it reveals the science of umami - the "fifth taste" discovered by Japanese chemist Kikunae Ikeda in 1908.

Traditional ichiban dashi (first-draw dashi) combines kombu seaweed with katsuobushi (dried, fermented, smoked skipjack tuna). This combination seems simple but represents a profound understanding of flavor chemistry developed over centuries.

Kombu is rich in free glutamate, the amino acid responsible for umami taste. Katsuobushi contains high concentrations of inosinate (IMP), a ribonucleotide. When consumed alone, each provides moderate umami. Combined, they create a phenomenon called umami synergy.

The science: glutamate and nucleotides (inosinate, guanylate) bind to the same taste receptor but at different sites. When both are present, the receptor signal amplifies dramatically. Research shows the combination produces 7-8 times more umami perception than either ingredient alone - some studies suggest up to 15-fold amplification.

This synergy explains why so many world cuisines intuitively combine glutamate-rich vegetables with IMP-rich meats:
- Kombu + katsuobushi (Japan)
- Tomatoes + Parmesan + meat (Italy)
- Onions + beef stock (France)
- Soy sauce + dried shrimp (China)

For vegan dashi, shiitake mushrooms provide guanylate (GMP), which also synergizes with glutamate. Shiitake + kombu creates an equally powerful umami combination without fish.`,
      shortDescription: 'Japanese stock exploiting glutamate-nucleotide umami synergy',
      scienceExplanation: `1. Kombu releases free glutamate (MSG) during soaking - up to 3,000 mg/100g
2. Katsuobushi provides inosinate (IMP) - up to 700 mg/100g
3. Glutamate binds T1R1-T1R3 receptor at one site
4. IMP binds same receptor at different site
5. Dual binding creates allosteric enhancement
6. Result: 7-8x umami intensity vs glutamate alone
7. Effect is long-lasting, creating sustained "mouthfulness"`,
      temperatureRange: '140-176°F (60-80°C) for kombu extraction',
      keyReactions: ['hydrolysis'],
      equipment: ['Large pot', 'Fine-mesh strainer or cheesecloth', 'Dried kombu', 'Katsuobushi flakes'],
      keyTechniques: [
        { step: 'Wipe kombu (don\'t wash)', science: 'White powder contains glutamate', tip: 'Only remove visible dirt' },
        { step: 'Cold soak 30 min or heat slowly', science: 'Glutamate extracts efficiently below 140°F', tip: 'Never boil kombu - releases slimy polysaccharides' },
        { step: 'Remove kombu at 140-175°F', science: 'Higher temps extract bitter compounds', tip: 'Small bubbles forming = remove kombu' },
        { step: 'Bring to boil, add katsuobushi', science: 'Boiling water extracts IMP rapidly', tip: 'Add generous handful, do not stir' },
        { step: 'Steep 30 seconds, strain', science: 'Longer steeping extracts bitter compounds', tip: 'Do not squeeze flakes' },
      ],
      historicalContext: 'Dashi evolved from Buddhist temple cuisine that prohibited meat. Kombu from Hokkaido and katsuobushi from southern Japan became trade goods, meeting in Osaka where dashi was perfected.',
      healthBenefits: 'Provides umami satisfaction with minimal calories. Kombu contains iodine and minerals. May reduce need for salt due to flavor enhancement.',
      exampleDishes: ['Miso soup', 'Ramen broth base', 'Noodle dipping sauce', 'Chawanmushi', 'Nimono (simmered dishes)'],
    },
    {
      id: 'sous-vide',
      name: 'Sous Vide',
      nativeName: 'Sous vide (French: "under vacuum")',
      culture: 'french',
      description: `Sous vide is a method of cooking food sealed in airtight bags in a precisely controlled water bath. Developed in the 1970s by French chefs Georges Pralus and Bruno Goussault, this technique has revolutionized professional kitchens and is now accessible to home cooks.

The key insight is that traditional cooking (pan, oven, grill) exposes food to temperatures far above the target internal temperature. A pan at 400°F cooking a steak to 130°F means the exterior is massively overcooked before the center reaches temperature. Sous vide inverts this: the water bath is set to exactly the final desired temperature.

Protein science explains why this matters. The major muscle proteins denature at different temperatures:
- Myosin (muscle contraction): 122-140°F (50-60°C)
- Collagen (connective tissue): begins 140°F (60°C), converts to gelatin
- Actin (muscle structure): 150°F+ (65°C+)

When actin denatures, meat becomes increasingly firm and dry. Cooking a steak traditionally means the exterior actin fully denatures while you wait for the center to reach temperature. Sous vide allows you to denature myosin (creating texture) while leaving actin intact throughout the entire piece.

For tough cuts, sous vide enables extended cooking at lower temperatures. Chuck roast at 135°F for 24-48 hours slowly converts collagen to gelatin while keeping the meat medium-rare pink. The result is tender like braised meat but with the color and moisture of a medium-rare steak.

Time and temperature create a matrix: lower temps require longer times but produce more tender, moist results.`,
      shortDescription: 'Precision temperature cooking in sealed bags',
      scienceExplanation: `1. Myosin denatures 122-140°F - proteins unfold, meat firms slightly
2. Collagen slowly converts to gelatin 140°F+ (faster at higher temps)
3. Actin denatures 150°F+ - causes significant moisture loss and toughness
4. Enzymes (calpain, cathepsin) remain active below 140°F, tenderizing meat
5. Optimal texture: 140-153°F where myosin/collagen denature but actin is preserved
6. Extended low-temp cooking (24-72 hrs) allows collagen conversion without actin damage
7. No moisture loss to evaporation (sealed environment)`,
      temperatureRange: '125-185°F (52-85°C) depending on protein',
      keyReactions: ['denaturation', 'hydrolysis'],
      equipment: ['Immersion circulator', 'Vacuum sealer or zip-lock bags', 'Container/pot', 'Instant-read thermometer', 'Cast iron for searing'],
      keyTechniques: [
        { step: 'Season and seal food', science: 'Vacuum removes air for even heat transfer', tip: 'Water displacement method works without vacuum sealer' },
        { step: 'Set precise temperature', science: 'Final internal temp equals water bath temp', tip: 'Account for post-sear temp rise (+5-10°F)' },
        { step: 'Cook to time/temp chart', science: 'Thicker cuts need more time for center to equilibrate', tip: '1" steak: 1 hr, 2": 3 hrs for same temp throughout' },
        { step: 'Pat dry before searing', science: 'Surface moisture prevents Maillard reaction', tip: 'Paper towels, then rest 5 min to cool surface' },
        { step: 'Sear in ripping hot pan', science: 'Maximum heat = fastest browning before overcooking', tip: 'Cast iron or torch, 30-60 seconds per side max' },
      ],
      historicalContext: 'Georges Pralus developed sous vide in 1974 to cook foie gras with less shrinkage. Bruno Goussault scientifically studied time-temperature relationships. Together they created the modern technique.',
      healthBenefits: 'Reduces need for added fats. Preserves vitamins that would leach into cooking liquid. Pasteurization at low temps ensures food safety.',
      exampleDishes: ['Sous vide steak', 'Eggs (perfect 63°C)', 'Chicken breast', 'Pork tenderloin', '48-hour short ribs'],
    },
    {
      id: 'spherification',
      name: 'Spherification',
      nativeName: null,
      culture: 'french',
      description: `Spherification is a technique from molecular gastronomy that transforms liquids into gel spheres resembling caviar or liquid-filled ravioli. Pioneered by Ferran Adrià at El Bulli in 2003, it has become one of the most iconic techniques of modernist cuisine.

The chemistry relies on alginate, a polymer extracted from brown seaweed. When sodium alginate dissolved in a liquid encounters calcium ions, it instantly forms a gel membrane. The reaction is:

Na-Alginate + Ca²⁺ → Ca-Alginate gel + Na⁺

There are two main methods:

Basic Spherification: Alginate is mixed into the flavored liquid, then dropped into a calcium chloride bath. A gel membrane forms immediately on contact. The spheres must be served quickly as the gel continues forming inward, eventually making them solid.

Reverse Spherification: For liquids already containing calcium (dairy, alcohol), the calcium is in the liquid and the sphere is dropped into an alginate bath. This produces more stable spheres with thinner membranes that don't continue gelling.

Adrià discovered the technique after visiting Griffith España and seeing a Mexican sauce with floating spheres. He experimented obsessively, creating olive oil "caviar," mango spheres, and famously serving "liquid ravioli" that burst in the mouth.

The technique requires precision: pH matters (below pH 4, alginate won't gel), calcium concentration affects membrane thickness, and timing determines texture. Too long in the bath creates rubbery spheres; too short and they burst prematurely.`,
      shortDescription: 'Creating liquid-filled gel spheres using alginate chemistry',
      scienceExplanation: `1. Sodium alginate is a long-chain polysaccharide from seaweed
2. In solution, alginate chains float freely
3. Calcium ions (Ca²⁺) create cross-links between alginate chains
4. Cross-linking creates insoluble gel network (calcium alginate)
5. Reaction occurs instantly at liquid-bath interface
6. Membrane thickness increases with exposure time
7. pH below 4 inhibits reaction (acid environments need buffering)
8. No heat required - gelation is purely chemical`,
      temperatureRange: 'Room temperature (gel formation is not heat-dependent)',
      keyReactions: [],
      equipment: ['Sodium alginate', 'Calcium chloride or calcium lactate gluconate', 'Precision scale', 'Immersion blender', 'Slotted spoon', 'Syringes or squeeze bottles'],
      keyTechniques: [
        { step: 'Hydrate alginate in liquid', science: 'Alginate must fully dissolve for even gelation', tip: 'Blend thoroughly, let rest to remove air bubbles' },
        { step: 'Prepare calcium bath (0.5%)', science: 'Too much calcium = tough skin, too little = fragile', tip: 'Calcium lactate gluconate has less bitter taste than chloride' },
        { step: 'Drop spheres carefully', science: 'Gentle drop creates round shape', tip: 'Use hemispherical measuring spoons for large spheres' },
        { step: 'Time precisely', science: 'Longer bath time = thicker membrane', tip: '2-3 min for basic, 3-5 min for reverse spherification' },
        { step: 'Rinse in clean water', science: 'Removes excess calcium and stops gelation', tip: 'Plain water bath, handle gently' },
      ],
      historicalContext: 'While alginate gelation was discovered industrially in the 1950s (Unilever), Ferran Adrià transformed it into haute cuisine at El Bulli. His olive oil caviar became an icon of molecular gastronomy.',
      healthBenefits: 'Sodium alginate is a prebiotic fiber. Technique allows dramatic presentation with minimal ingredients. Can reduce portion sizes while maintaining visual impact.',
      exampleDishes: ['Olive oil caviar', 'Melon caviar', 'Mojito spheres', 'Balsamic pearls', 'Mango ravioli'],
    },
    {
      id: 'ceviche',
      name: 'Ceviche (Acid Cooking)',
      nativeName: 'Ceviche / Cebiche',
      culture: 'peruvian',
      description: `Ceviche is the technique of "cooking" raw fish using acid (lime or lemon juice) rather than heat. This ancient method, originating in Peru over 2,000 years ago, produces a texture distinct from both raw and heat-cooked fish.

The science centers on protein denaturation. Fish proteins are normally folded into precise three-dimensional shapes held together by hydrogen bonds. Acid disrupts these bonds, causing proteins to unfold and tangle together - the same fundamental process that occurs with heat, but through different chemistry.

Lime juice has a pH around 2.5 (similar to stomach acid), which is acidic enough to denature most fish proteins within 15-30 minutes. As the acid penetrates, the fish turns from translucent to opaque white, firms up, and develops a texture reminiscent of cooked fish but with a fresh, raw quality.

However, acid denaturation differs from heat in important ways:
- Texture is firmer and more "raw" tasting
- Some proteins denature incompletely
- Acid doesn't kill all pathogens (freezing fish first is recommended)
- Over-marination makes fish mushy as acid continues breaking down proteins

The timing is critical: 15-30 minutes produces tender, opaque fish. Beyond 2 hours, the texture deteriorates. Traditional Peruvian ceviche is dressed just before serving, while Mexican-style often marinates longer.

Leche de tigre (tiger's milk) - the lime-chile-fish juice remaining after ceviche - is prized as a hangover cure and is now served as a dish on its own.`,
      shortDescription: 'Acid-denaturing raw fish proteins without heat',
      scienceExplanation: `1. Fresh fish proteins are folded, held by hydrogen bonds
2. Lime juice pH ~2.5 attacks hydrogen bonds
3. Proteins unfold (denature) similar to heat denaturation
4. Unfolded proteins tangle together (coagulate)
5. Light scattering by protein network creates opacity
6. Texture firms as protein network forms
7. Process continues until acid is neutralized or fish is removed
8. Over-marination leads to protein over-denaturation (mushiness)`,
      temperatureRange: 'Served cold (acid works at any temperature)',
      keyReactions: ['denaturation'],
      equipment: ['Non-reactive bowl (glass, ceramic)', 'Fresh limes', 'Sharp knife for thin slicing'],
      keyTechniques: [
        { step: 'Use freshest fish possible', science: 'Acid doesn\'t fully sterilize - freshness is safety', tip: 'Freeze fish first to kill parasites, or use sushi-grade' },
        { step: 'Cut fish into uniform pieces', science: 'Even size ensures even "cooking"', tip: '1/2" cubes or thin slices for faster marination' },
        { step: 'Add fresh lime juice', science: 'Citric acid begins denaturing immediately', tip: 'Juice should cover fish, use fresh limes only' },
        { step: 'Marinate 15-30 minutes', science: 'Time for acid to penetrate and denature', tip: 'Fish is "done" when opaque throughout' },
        { step: 'Drain and serve immediately', science: 'Stopping prevents over-denaturation', tip: 'Add salt, onion, chile just before serving' },
      ],
      historicalContext: 'Ceviche originated in Peru, possibly with the Moche civilization 2,000+ years ago. Spanish colonizers brought citrus, transforming the technique from using native fermented corn drink to lime juice.',
      healthBenefits: 'Raw fish preserves omega-3 fatty acids. High protein, low fat. Lime juice provides vitamin C. However, does not kill all bacteria - freshness and sourcing are critical for safety.',
      exampleDishes: ['Classic Peruvian ceviche', 'Tiradito', 'Aguachile (Mexican)', 'Leche de tigre shots', 'Ceviche mixto'],
    },
    {
      id: 'smoking',
      name: 'Low and Slow Smoking',
      nativeName: null,
      culture: 'american',
      description: `American barbecue smoking is a method of cooking meat at low temperatures (225-275°F) for extended periods (4-18+ hours) in a smoky environment. This technique transforms tough, collagen-rich cuts into tender, flavorful meals while imparting distinctive smoke flavor.

The science involves several simultaneous processes:

Collagen breakdown: At these temperatures, collagen slowly converts to gelatin without drying out the meat. A brisket's tough connective tissue becomes silky and unctuous over 12-16 hours.

The smoke ring: The pink ring beneath the bark of smoked meat isn't raw - it's a chemical reaction. Nitrogen dioxide from wood smoke reacts with myoglobin (the protein that makes meat red) to form nitrosomyoglobin, which is stable and doesn't gray with cooking. This reaction only occurs while meat is below 140°F, which is why the smoke ring forms early.

The stall: During smoking, meat temperature plateaus around 150-170°F for hours. This occurs because evaporative cooling from surface moisture matches the heat input. Wrapping meat in foil (the "Texas crutch") speeds through the stall by preventing evaporation.

Bark formation: The dark, flavorful crust (bark) forms through Maillard reactions between meat proteins, spice rub compounds, and smoke particles. This requires a dry surface - spritzing adds moisture but can slow bark development.

Different woods contribute different smoke flavors: hickory (strong, bacon-like), oak (medium, versatile), apple and cherry (mild, sweet), mesquite (intense, can be bitter).`,
      shortDescription: 'Extended low-temperature cooking with wood smoke',
      scienceExplanation: `1. Collagen converts to gelatin at 160-180°F over many hours
2. Low temp (225-275°F) allows conversion before meat dries out
3. NO₂ from smoke + myoglobin = pink smoke ring (nitrosomyoglobin)
4. Smoke ring only forms while meat surface is below 140°F
5. The "stall" at 150-170°F is evaporative cooling equilibrium
6. Bark = Maillard reaction + fat rendering + smoke particle adhesion
7. Different woods = different phenol and guaiacol compounds (smoke flavor)
8. Fat renders slowly, bastes meat internally`,
      temperatureRange: '225-275°F (107-135°C)',
      keyReactions: ['maillard-reaction', 'hydrolysis', 'oxidation'],
      equipment: ['Offset smoker or kettle grill', 'Wood chunks/chips', 'Instant-read thermometer', 'Spray bottle'],
      keyTechniques: [
        { step: 'Apply dry rub night before', science: 'Salt penetrates, draws out moisture, then reabsorbs', tip: 'Salt, pepper, paprika, garlic as base' },
        { step: 'Maintain 225-275°F', science: 'Low enough for collagen conversion, high enough for food safety', tip: 'Fire management is the core skill' },
        { step: 'Smoke heavily first 3-4 hours', science: 'Smoke ring forms before surface reaches 140°F', tip: 'Wood smoke early, can reduce later' },
        { step: 'Wrap at stall (optional)', science: 'Prevents evaporative cooling, speeds cooking', tip: 'Butcher paper breathes better than foil' },
        { step: 'Rest 1-2 hours', science: 'Juices redistribute, temperature equalizes', tip: 'Wrap in towels, hold in cooler' },
      ],
      historicalContext: 'American BBQ evolved from Caribbean techniques (barbacoa) combined with African, European, and Native American traditions. Regional styles developed based on local wood availability and cultural preferences.',
      healthBenefits: 'Long cooking breaks down tough cuts into digestible protein. Some smoke compounds have antioxidant properties. However, heavy smoking can create carcinogenic compounds - moderation advised.',
      exampleDishes: ['Texas brisket', 'Pulled pork', 'Spare ribs', 'Smoked turkey', 'Burnt ends'],
    },
    {
      id: 'kimchi-fermentation',
      name: 'Kimchi Fermentation',
      nativeName: '김치',
      culture: 'korean',
      description: `Kimchi fermentation is a sophisticated lacto-fermentation process that transforms salted vegetables into a complex, probiotic-rich food. While simple in concept, the microbiology and chemistry create one of the world's most distinctive fermented foods.

The process begins with salting, which draws water from cabbage via osmosis while killing undesirable bacteria. This creates an anaerobic, salty environment where lactic acid bacteria (LAB) thrive.

The microbial succession follows a predictable pattern:
1. Leuconostoc gelidum initiates fermentation, producing CO₂ and lactic acid
2. Weissella species increase acid production
3. Lactobacillus sakei dominates as acidity rises
4. Final bacterial counts reach 10⁷-10⁸ CFU/g

Research has shown that the fermentation bacteria originate primarily from napa cabbage and garlic - not from the ginger, chili, or environment. The starter culture is essentially on the vegetables themselves.

Optimal fermentation temperature is 39-50°F (4-10°C) for slow, flavorful fermentation, though room temperature fermentation (faster, more sour) is common. The fermentation produces:
- Lactic acid (sour taste, preservation)
- Acetic acid (vinegar notes)
- CO₂ (fizzy texture)
- Mannitol (slight sweetness)
- Bacteriocins (antimicrobial compounds)

Unlike sauerkraut, kimchi is typically less sour (lower final acidity) and often has fizzy carbonation from heterofermentative bacteria. The complex seasoning (gochugaru, fish sauce, garlic) adds flavor dimensions beyond simple sauerkraut.`,
      shortDescription: 'Lacto-fermentation of salted vegetables with chili and seasonings',
      scienceExplanation: `1. Salt (2-3%) draws water via osmosis, creating brine
2. Anaerobic environment develops (CO₂ displaces oxygen)
3. Leuconostoc species initiate fermentation (heterolactic)
4. Produce lactic acid, CO₂, and flavor compounds
5. pH drops from ~6 to ~4 over days
6. Lactobacillus species dominate at lower pH
7. Acidic environment inhibits spoilage organisms
8. Final product is shelf-stable at refrigeration temps`,
      temperatureRange: '39-50°F (4-10°C) for slow fermentation, room temp for fast',
      keyReactions: ['fermentation'],
      equipment: ['Large container', 'Weights (to keep vegetables submerged)', 'Fermentation crock or jar'],
      keyTechniques: [
        { step: 'Salt cabbage 2-3 hours', science: 'Osmosis draws water, creates brine, softens cell walls', tip: 'Use coarse sea salt, 2-3% by weight' },
        { step: 'Rinse and drain', science: 'Removes excess salt while keeping enough for fermentation', tip: 'Taste - should be pleasantly salty' },
        { step: 'Add paste (gochugaru, garlic, ginger, fish sauce)', science: 'Seasonings add flavor and may contribute LAB', tip: 'Paste should coat vegetables evenly' },
        { step: 'Pack tightly, submerge in brine', science: 'Anaerobic environment crucial for LAB dominance', tip: 'Press out air bubbles, weight down' },
        { step: 'Ferment 1-5 days at room temp', science: 'Bacteria multiply, produce acid', tip: 'Taste daily - refrigerate when sourness is right' },
      ],
      historicalContext: 'Kimchi has been made in Korea for at least 2,000 years. Originally made without chili (introduced in 16th century), the distinctive red kimchi is only 400 years old.',
      healthBenefits: 'Probiotic bacteria support gut health. High in vitamins C and K, fiber. Fermentation creates bioactive compounds. Low in calories, high in flavor.',
      exampleDishes: ['Baechu kimchi (napa cabbage)', 'Kkakdugi (radish)', 'Kimchi jjigae (stew)', 'Kimchi fried rice', 'Kimchi pancakes'],
    },
  ];
}

function getTemperatureData() {
  return [
    // Water events
    { id: 'water-freeze', temperatureC: 0, temperatureF: 32, eventName: 'Water Freezes', description: 'Ice crystals form, expanding food cells. Slow freezing creates larger crystals that damage texture.', category: 'water', visualIndicator: 'Ice forms on surface', reversible: true, relatedReactions: [], foodsAffected: ['Ice cream', 'Frozen vegetables', 'Frozen meat'], tips: 'Flash freeze to minimize crystal size' },
    { id: 'water-boil', temperatureC: 100, temperatureF: 212, eventName: 'Water Boils', description: 'Liquid water converts to steam. Maximum temperature for water-based cooking at sea level.', category: 'water', visualIndicator: 'Vigorous bubbling', reversible: true, relatedReactions: ['hydrolysis'], foodsAffected: ['Pasta', 'Rice', 'Boiled vegetables'], tips: 'Salt raises boiling point slightly' },

    // Protein events
    { id: 'enzyme-activity', temperatureC: 40, temperatureF: 104, eventName: 'Enzyme Activity Peak', description: 'Meat enzymes (calpain, cathepsin) most active, tenderizing protein. Used in dry-aging and slow cooking.', category: 'protein', visualIndicator: null, reversible: false, relatedReactions: ['hydrolysis'], foodsAffected: ['Dry-aged beef', 'Sous vide meat'], tips: 'Keep below 140°F for enzyme benefit' },
    { id: 'myosin-denature', temperatureC: 50, temperatureF: 122, eventName: 'Myosin Begins Denaturing', description: 'Primary muscle protein starts unfolding. Meat firms slightly but remains tender.', category: 'protein', visualIndicator: 'Slight firming', reversible: false, relatedReactions: ['denaturation'], foodsAffected: ['Steak', 'Fish', 'Chicken'], tips: 'Sous vide rare steak temp' },
    { id: 'collagen-shrink', temperatureC: 60, temperatureF: 140, eventName: 'Collagen Contracts', description: 'Connective tissue begins shrinking, can make meat tough if cooked quickly. Start of "well done" zone.', category: 'protein', visualIndicator: 'Meat shrinks visibly', reversible: false, relatedReactions: ['denaturation'], foodsAffected: ['Tough cuts', 'Brisket', 'Pork shoulder'], tips: 'Low and slow converts collagen to gelatin' },
    { id: 'egg-white-set', temperatureC: 62, temperatureF: 144, eventName: 'Egg White Sets', description: 'Albumin proteins coagulate, whites become opaque. Yolk still liquid at this temp.', category: 'protein', visualIndicator: 'Whites turn white', reversible: false, relatedReactions: ['denaturation'], foodsAffected: ['Soft-boiled eggs', 'Poached eggs'], tips: 'Perfect for jammy eggs' },
    { id: 'egg-yolk-thicken', temperatureC: 65, temperatureF: 149, eventName: 'Egg Yolk Thickens', description: 'Yolk proteins begin setting, creating jammy texture. Classic 63°C/145°F egg.', category: 'protein', visualIndicator: 'Yolk becomes jammy', reversible: false, relatedReactions: ['denaturation'], foodsAffected: ['Onsen eggs', 'Soft-boiled eggs'], tips: 'Japanese onsen tamago temp' },
    { id: 'actin-denature', temperatureC: 66, temperatureF: 150, eventName: 'Actin Denatures', description: 'Muscle structure protein coagulates. Major moisture loss begins. Meat becomes noticeably firmer.', category: 'protein', visualIndicator: 'Juice release increases', reversible: false, relatedReactions: ['denaturation'], foodsAffected: ['All meats'], tips: 'Keep below for juicy meat' },
    { id: 'egg-yolk-solid', temperatureC: 70, temperatureF: 158, eventName: 'Egg Yolk Fully Set', description: 'Yolk proteins completely coagulated. Chalky, crumbly yolk texture.', category: 'protein', visualIndicator: 'Yolk is solid yellow', reversible: false, relatedReactions: ['denaturation'], foodsAffected: ['Hard-boiled eggs'], tips: 'Don\'t exceed for creamy yolk' },
    { id: 'collagen-gelatin', temperatureC: 71, temperatureF: 160, eventName: 'Collagen → Gelatin', description: 'Connective tissue converts to gelatin. Requires time - faster at higher temps but more moisture loss.', category: 'protein', visualIndicator: 'Meat becomes tender', reversible: false, relatedReactions: ['hydrolysis'], foodsAffected: ['Braised meats', 'Stocks'], tips: 'The magic of braising' },

    // Sugar events
    { id: 'sugar-dissolve', temperatureC: 100, temperatureF: 212, eventName: 'Sugar Fully Dissolves', description: 'Sucrose dissolves completely in boiling water, creating simple syrup.', category: 'sugar', visualIndicator: 'Clear syrup', reversible: true, relatedReactions: [], foodsAffected: ['Simple syrup', 'Candy base'], tips: 'Don\'t stir once boiling' },
    { id: 'sugar-thread', temperatureC: 102, temperatureF: 215, eventName: 'Thread Stage', description: 'Sugar syrup forms thin threads when dropped from spoon. Used for syrups and preserves.', category: 'sugar', visualIndicator: 'Thin threads form', reversible: false, relatedReactions: ['caramelization'], foodsAffected: ['Fruit preserves', 'Glazes'], tips: 'Test with cold water' },
    { id: 'sugar-softball', temperatureC: 116, temperatureF: 240, eventName: 'Soft Ball Stage', description: 'Sugar forms a soft, pliable ball in cold water. Used for fudge, pralines, fondant.', category: 'sugar', visualIndicator: 'Soft ball in cold water', reversible: false, relatedReactions: ['caramelization'], foodsAffected: ['Fudge', 'Pralines', 'Italian meringue'], tips: 'Ball flattens when pressed' },
    { id: 'sugar-firmball', temperatureC: 121, temperatureF: 250, eventName: 'Firm Ball Stage', description: 'Sugar forms a firm ball that holds shape. Used for caramels and soft candies.', category: 'sugar', visualIndicator: 'Firm ball in cold water', reversible: false, relatedReactions: ['caramelization'], foodsAffected: ['Caramels', 'Marshmallows'], tips: 'Ball resists flattening' },
    { id: 'sugar-hardball', temperatureC: 132, temperatureF: 270, eventName: 'Hard Ball Stage', description: 'Sugar forms a hard ball. Used for divinity, nougat, rock candy.', category: 'sugar', visualIndicator: 'Hard ball in cold water', reversible: false, relatedReactions: ['caramelization'], foodsAffected: ['Nougat', 'Divinity', 'Gummies'], tips: 'Ball doesn\'t flatten' },
    { id: 'sugar-hardcrack', temperatureC: 149, temperatureF: 300, eventName: 'Hard Crack Stage', description: 'Sugar forms brittle threads that shatter. Used for lollipops, toffee, spun sugar.', category: 'sugar', visualIndicator: 'Brittle threads snap', reversible: false, relatedReactions: ['caramelization'], foodsAffected: ['Lollipops', 'Toffee', 'Brittle'], tips: 'Work fast - sets quickly' },
    { id: 'caramel-light', temperatureC: 160, temperatureF: 320, eventName: 'Light Caramel', description: 'Sugar begins browning via caramelization. Light amber color, mild caramel flavor.', category: 'sugar', visualIndicator: 'Light amber color', reversible: false, relatedReactions: ['caramelization'], foodsAffected: ['Caramel sauce', 'Crème caramel'], tips: 'Remove from heat - carries over' },
    { id: 'caramel-dark', temperatureC: 177, temperatureF: 350, eventName: 'Dark Caramel', description: 'Deep amber caramelization. Complex bitter-sweet flavors, intense aroma.', category: 'sugar', visualIndicator: 'Deep amber color', reversible: false, relatedReactions: ['caramelization'], foodsAffected: ['Caramel sauce', 'Crème brûlée'], tips: 'Seconds from burning' },
    { id: 'sugar-burn', temperatureC: 190, temperatureF: 374, eventName: 'Sugar Burns', description: 'Caramelization goes too far, producing bitter, acrid compounds. Black color.', category: 'sugar', visualIndicator: 'Black, smoking', reversible: false, relatedReactions: ['caramelization'], foodsAffected: ['Ruined candy'], tips: 'No recovery - start over' },

    // Fat events
    { id: 'butter-melt', temperatureC: 32, temperatureF: 90, eventName: 'Butter Melts', description: 'Butter fat crystals melt. Solid to liquid transition for baking and cooking.', category: 'fat', visualIndicator: 'Butter liquefies', reversible: true, relatedReactions: [], foodsAffected: ['Butter sauces', 'Baked goods'], tips: 'Cold butter = flaky pastry' },
    { id: 'butter-foam', temperatureC: 100, temperatureF: 212, eventName: 'Butter Foams', description: 'Water in butter boils off, creating foam. First step in clarifying butter.', category: 'fat', visualIndicator: 'Bubbling, foaming', reversible: false, relatedReactions: [], foodsAffected: ['Clarified butter', 'Ghee'], tips: 'Foam indicates water loss' },
    { id: 'butter-brown', temperatureC: 150, temperatureF: 302, eventName: 'Brown Butter (Beurre Noisette)', description: 'Milk solids undergo Maillard reaction, creating nutty aroma and brown color.', category: 'fat', visualIndicator: 'Nutty aroma, brown flecks', reversible: false, relatedReactions: ['maillard-reaction'], foodsAffected: ['Brown butter sauce', 'Baked goods'], tips: 'Watch carefully - burns fast' },
    { id: 'butter-smoke', temperatureC: 177, temperatureF: 350, eventName: 'Butter Smoke Point', description: 'Milk solids burn, producing acrid smoke. Clarified butter/ghee has higher smoke point.', category: 'fat', visualIndicator: 'Smoke, burnt smell', reversible: false, relatedReactions: ['oxidation'], foodsAffected: ['Pan sauces'], tips: 'Use clarified for high heat' },
    { id: 'olive-smoke', temperatureC: 190, temperatureF: 375, eventName: 'EVOO Smoke Point', description: 'Extra virgin olive oil smoke point. Despite myths, EVOO is stable for cooking due to antioxidants.', category: 'fat', visualIndicator: 'Visible smoke', reversible: false, relatedReactions: ['oxidation'], foodsAffected: ['Sautéed vegetables'], tips: 'Fine for sautéing despite myths' },
    { id: 'canola-smoke', temperatureC: 204, temperatureF: 400, eventName: 'Canola Oil Smoke Point', description: 'Neutral oil with high smoke point, suitable for frying.', category: 'fat', visualIndicator: 'Visible smoke', reversible: false, relatedReactions: ['oxidation'], foodsAffected: ['Fried foods', 'Stir-fry'], tips: 'Good all-purpose oil' },
    { id: 'peanut-smoke', temperatureC: 232, temperatureF: 450, eventName: 'Peanut Oil Smoke Point', description: 'High smoke point ideal for deep frying and high-heat wok cooking.', category: 'fat', visualIndicator: 'Visible smoke', reversible: false, relatedReactions: ['oxidation'], foodsAffected: ['Deep-fried foods', 'Wok cooking'], tips: 'Classic frying oil' },
    { id: 'avocado-smoke', temperatureC: 271, temperatureF: 520, eventName: 'Avocado Oil Smoke Point', description: 'Highest smoke point of common cooking oils. Excellent for very high heat cooking.', category: 'fat', visualIndicator: 'Visible smoke', reversible: false, relatedReactions: ['oxidation'], foodsAffected: ['Searing', 'High-heat cooking'], tips: 'Best for extreme heat' },

    // Starch events
    { id: 'starch-gelatin-potato', temperatureC: 56, temperatureF: 133, eventName: 'Potato Starch Gelatinizes', description: 'Potato starch granules begin absorbing water and swelling.', category: 'starch', visualIndicator: 'Thickening begins', reversible: false, relatedReactions: ['gelatinization'], foodsAffected: ['Mashed potatoes', 'Potato soup'], tips: 'Lower than other starches' },
    { id: 'starch-gelatin-corn', temperatureC: 62, temperatureF: 144, eventName: 'Corn Starch Gelatinizes', description: 'Corn starch begins thickening. Most common thickener for sauces.', category: 'starch', visualIndicator: 'Sauce thickens', reversible: false, relatedReactions: ['gelatinization'], foodsAffected: ['Gravy', 'Pie filling', 'Sauces'], tips: 'Mix with cold liquid first (slurry)' },
    { id: 'pasta-aldente', temperatureC: 70, temperatureF: 158, eventName: 'Pasta Al Dente Zone', description: 'Surface starch gelatinized, center retains some structure. Ideal pasta texture.', category: 'starch', visualIndicator: 'Slight white core visible', reversible: false, relatedReactions: ['gelatinization'], foodsAffected: ['Pasta'], tips: 'Test 2 min before package time' },

    // Chemical events
    { id: 'maillard-start', temperatureC: 140, temperatureF: 280, eventName: 'Maillard Reaction Begins', description: 'Amino acids and sugars begin reacting to form brown color and complex flavors.', category: 'chemical', visualIndicator: 'Browning begins', reversible: false, relatedReactions: ['maillard-reaction'], foodsAffected: ['All browned foods'], tips: 'Surface must be dry' },
    { id: 'maillard-peak', temperatureC: 155, temperatureF: 310, eventName: 'Maillard Reaction Peak', description: 'Optimal temperature range for Maillard browning. Balance of flavor development and speed.', category: 'chemical', visualIndicator: 'Deep golden brown', reversible: false, relatedReactions: ['maillard-reaction'], foodsAffected: ['Seared meat', 'Toast', 'Roasted vegetables'], tips: 'Perfect searing zone' },
    { id: 'acrylamide-form', temperatureC: 120, temperatureF: 248, eventName: 'Acrylamide Formation', description: 'Potentially carcinogenic compound begins forming in starchy foods. Higher at >175°C.', category: 'chemical', visualIndicator: 'Dark brown to black', reversible: false, relatedReactions: ['maillard-reaction'], foodsAffected: ['French fries', 'Toast', 'Coffee'], tips: 'Golden not burnt' },
  ];
}

function getMoleculeData() {
  return [
    {
      id: 'glutamate',
      name: 'L-Glutamic Acid',
      commonName: 'Umami / MSG',
      chemicalFormula: 'C₅H₉NO₄',
      molecularWeight: 147.13,
      category: 'taste',
      tasteProfile: { bitter: 0, sweet: 0, sour: 0, salty: 1, umami: 10 },
      aromaProfile: [],
      foundIn: ['Parmesan cheese', 'Tomatoes', 'Soy sauce', 'Kombu seaweed', 'Miso', 'Fish sauce', 'Mushrooms', 'Aged meats'],
      createdByReaction: null,
      thresholdPpm: 200,
      safetyNotes: 'Generally recognized as safe (GRAS). MSG sensitivity is not supported by scientific evidence.',
      synergies: ['inosinate', 'guanylate'],
      antagonists: [],
    },
    {
      id: 'inosinate',
      name: 'Inosine Monophosphate (IMP)',
      commonName: 'Umami Nucleotide (Meat)',
      chemicalFormula: 'C₁₀H₁₃N₄O₈P',
      molecularWeight: 348.21,
      category: 'taste',
      tasteProfile: { bitter: 0, sweet: 0, sour: 0, salty: 0, umami: 3 },
      aromaProfile: [],
      foundIn: ['Katsuobushi (bonito)', 'Pork', 'Beef', 'Chicken', 'Sardines', 'Tuna'],
      createdByReaction: null,
      thresholdPpm: 250,
      safetyNotes: 'Naturally occurring in all meats. Safe for consumption.',
      synergies: ['glutamate'],
      antagonists: [],
    },
    {
      id: 'guanylate',
      name: 'Guanosine Monophosphate (GMP)',
      commonName: 'Umami Nucleotide (Mushroom)',
      chemicalFormula: 'C₁₀H₁₄N₅O₈P',
      molecularWeight: 363.22,
      category: 'taste',
      tasteProfile: { bitter: 0, sweet: 0, sour: 0, salty: 0, umami: 4 },
      aromaProfile: [],
      foundIn: ['Dried shiitake', 'Dried porcini', 'Enoki mushrooms', 'Nori seaweed'],
      createdByReaction: null,
      thresholdPpm: 125,
      safetyNotes: 'Naturally occurring in mushrooms and seaweed. Safe for consumption.',
      synergies: ['glutamate'],
      antagonists: [],
    },
    {
      id: 'diacetyl',
      name: 'Diacetyl (2,3-Butanedione)',
      commonName: 'Buttery Flavor',
      chemicalFormula: 'C₄H₆O₂',
      molecularWeight: 86.09,
      category: 'aroma',
      tasteProfile: null,
      aromaProfile: ['Buttery', 'Creamy', 'Rich', 'Butterscotch'],
      foundIn: ['Butter', 'Cultured butter', 'Beer', 'Wine', 'Chardonnay', 'Caramel'],
      createdByReaction: 'caramelization',
      thresholdPpm: 0.015,
      safetyNotes: 'Naturally occurring. Industrial inhalation exposure linked to lung disease, but food consumption is safe.',
      synergies: [],
      antagonists: [],
    },
    {
      id: 'capsaicin',
      name: 'Capsaicin',
      commonName: 'Chili Heat',
      chemicalFormula: 'C₁₈H₂₇NO₃',
      molecularWeight: 305.41,
      category: 'taste',
      tasteProfile: { bitter: 0, sweet: 0, sour: 0, salty: 0, umami: 0 },
      aromaProfile: [],
      foundIn: ['Chili peppers', 'Hot sauce', 'Cayenne', 'Jalapeños', 'Habaneros'],
      createdByReaction: null,
      thresholdPpm: 0.1,
      safetyNotes: 'Binds to TRPV1 pain receptors. Avoid eye contact. Milk/fat neutralizes better than water.',
      synergies: [],
      antagonists: ['casein'],
    },
    {
      id: 'allicin',
      name: 'Allicin',
      commonName: 'Garlic Pungency',
      chemicalFormula: 'C₆H₁₀OS₂',
      molecularWeight: 162.27,
      category: 'aroma',
      tasteProfile: null,
      aromaProfile: ['Pungent', 'Sulfurous', 'Sharp', 'Garlicky'],
      foundIn: ['Fresh garlic', 'Onions', 'Leeks', 'Shallots'],
      createdByReaction: null,
      thresholdPpm: 0.0001,
      safetyNotes: 'Formed when garlic is cut/crushed. Heat destroys enzyme that creates it.',
      synergies: [],
      antagonists: [],
    },
    {
      id: 'vanillin',
      name: 'Vanillin',
      commonName: 'Vanilla Flavor',
      chemicalFormula: 'C₈H₈O₃',
      molecularWeight: 152.15,
      category: 'aroma',
      tasteProfile: null,
      aromaProfile: ['Sweet', 'Creamy', 'Warm', 'Floral'],
      foundIn: ['Vanilla beans', 'Vanilla extract', 'Oak-aged spirits', 'Coffee', 'Chocolate'],
      createdByReaction: 'maillard-reaction',
      thresholdPpm: 0.02,
      safetyNotes: 'GRAS. Natural or synthetic versions chemically identical.',
      synergies: ['coumarin'],
      antagonists: [],
    },
    {
      id: 'acrolein',
      name: 'Acrolein',
      commonName: 'Smoke/Burnt Fat',
      chemicalFormula: 'C₃H₄O',
      molecularWeight: 56.06,
      category: 'aroma',
      tasteProfile: null,
      aromaProfile: ['Acrid', 'Burnt', 'Irritating'],
      foundIn: ['Overheated oil', 'Smoke', 'Burnt fat'],
      createdByReaction: 'oxidation',
      thresholdPpm: 0.21,
      safetyNotes: 'Irritant to eyes and respiratory system. Avoid overheating cooking oils.',
      synergies: [],
      antagonists: [],
    },
    {
      id: 'linalool',
      name: 'Linalool',
      commonName: 'Floral/Citrus Aroma',
      chemicalFormula: 'C₁₀H₁₈O',
      molecularWeight: 154.25,
      category: 'aroma',
      tasteProfile: null,
      aromaProfile: ['Floral', 'Citrus', 'Fresh', 'Lavender-like'],
      foundIn: ['Coriander', 'Basil', 'Lavender', 'Citrus zest', 'Hops'],
      createdByReaction: null,
      thresholdPpm: 0.006,
      safetyNotes: 'GRAS. Common in essential oils and food flavoring.',
      synergies: [],
      antagonists: [],
    },
    {
      id: 'menthol',
      name: 'Menthol',
      commonName: 'Cooling Sensation',
      chemicalFormula: 'C₁₀H₂₀O',
      molecularWeight: 156.27,
      category: 'taste',
      tasteProfile: { bitter: 1, sweet: 0, sour: 0, salty: 0, umami: 0 },
      aromaProfile: ['Minty', 'Cool', 'Fresh'],
      foundIn: ['Peppermint', 'Spearmint', 'Menthol cigarettes', 'Chewing gum'],
      createdByReaction: null,
      thresholdPpm: 0.04,
      safetyNotes: 'Activates cold-sensing TRPM8 receptors. Creates cooling sensation without actual temperature change.',
      synergies: [],
      antagonists: ['capsaicin'],
    },
    {
      id: 'pyrazines',
      name: 'Pyrazines',
      commonName: 'Roasted/Nutty Aroma',
      chemicalFormula: 'C₄H₄N₂ (base)',
      molecularWeight: 80.09,
      category: 'aroma',
      tasteProfile: null,
      aromaProfile: ['Roasted', 'Nutty', 'Earthy', 'Chocolatey'],
      foundIn: ['Roasted coffee', 'Chocolate', 'Roasted nuts', 'Bread crust', 'Grilled meat'],
      createdByReaction: 'maillard-reaction',
      thresholdPpm: 0.002,
      safetyNotes: 'Naturally formed during browning reactions. Key to roasted food aromas.',
      synergies: ['furans'],
      antagonists: [],
    },
    {
      id: 'furans',
      name: 'Furans',
      commonName: 'Caramel/Sweet Aroma',
      chemicalFormula: 'C₄H₄O (base)',
      molecularWeight: 68.07,
      category: 'aroma',
      tasteProfile: null,
      aromaProfile: ['Caramel', 'Sweet', 'Brown sugar', 'Maple'],
      foundIn: ['Caramel', 'Brown sugar', 'Coffee', 'Baked goods', 'Maple syrup'],
      createdByReaction: 'caramelization',
      thresholdPpm: 0.003,
      safetyNotes: 'Some furans are potentially concerning at high levels; normal food consumption is safe.',
      synergies: ['pyrazines', 'maltol'],
      antagonists: [],
    },
    {
      id: 'maltol',
      name: 'Maltol',
      commonName: 'Toasted/Cotton Candy',
      chemicalFormula: 'C₆H₆O₃',
      molecularWeight: 126.11,
      category: 'aroma',
      tasteProfile: null,
      aromaProfile: ['Toasty', 'Caramel', 'Cotton candy', 'Sweet'],
      foundIn: ['Bread crust', 'Coffee', 'Caramel', 'Roasted malt', 'Cotton candy'],
      createdByReaction: 'maillard-reaction',
      thresholdPpm: 0.035,
      safetyNotes: 'GRAS. Used as flavor enhancer to intensify sweet perception.',
      synergies: ['furans', 'diacetyl'],
      antagonists: [],
    },
    {
      id: 'thiols',
      name: 'Thiols (Mercaptans)',
      commonName: 'Savory/Meaty Aroma',
      chemicalFormula: 'Variable (R-SH)',
      molecularWeight: null,
      category: 'aroma',
      tasteProfile: null,
      aromaProfile: ['Meaty', 'Savory', 'Roasted', 'Coffee-like'],
      foundIn: ['Roasted meat', 'Coffee', 'Roasted onions', 'Aged cheese'],
      createdByReaction: 'maillard-reaction',
      thresholdPpm: 0.00001,
      safetyNotes: 'Extremely low detection threshold. Key to meat and coffee aromas.',
      synergies: ['pyrazines'],
      antagonists: [],
    },
    {
      id: 'ethyl-acetate',
      name: 'Ethyl Acetate',
      commonName: 'Fruity/Solvent Aroma',
      chemicalFormula: 'C₄H₈O₂',
      molecularWeight: 88.11,
      category: 'aroma',
      tasteProfile: null,
      aromaProfile: ['Fruity', 'Sweet', 'Nail polish', 'Pear'],
      foundIn: ['Wine', 'Beer', 'Fermented foods', 'Ripe fruit', 'Vinegar'],
      createdByReaction: 'fermentation',
      thresholdPpm: 5,
      safetyNotes: 'Naturally produced during fermentation. Off-flavor at high concentrations.',
      synergies: [],
      antagonists: [],
    },
  ];
}
