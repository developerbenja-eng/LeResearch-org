/**
 * Dominant-color tags per species for the Quick ID filter tool.
 *
 * Each species gets 1–3 colors describing its most visible field marks.
 * The Quick ID UI uses these to filter candidates when a user says
 * "I saw a red bird with black wings" or similar.
 *
 * Colors are kept to a small fixed palette to keep the UI simple.
 */

export type Color =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'brown'
  | 'black'
  | 'white'
  | 'gray';

export const COLOR_LABELS: Record<Color, string> = {
  red: 'Red',
  orange: 'Orange',
  yellow: 'Yellow',
  green: 'Green',
  blue: 'Blue',
  brown: 'Brown',
  black: 'Black',
  white: 'White',
  gray: 'Gray',
};

export const COLOR_SWATCHES: Record<Color, string> = {
  red: 'bg-rose-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-400',
  green: 'bg-emerald-500',
  blue: 'bg-sky-500',
  brown: 'bg-amber-800',
  black: 'bg-slate-900',
  white: 'bg-slate-100',
  gray: 'bg-slate-400',
};

/** speciesId → dominant colors (1–3 each) */
export const SPECIES_COLORS: Record<string, Color[]> = {
  // Year-round residents
  'northern-cardinal': ['red', 'black'],
  'northern-mockingbird': ['gray', 'white'],
  'carolina-chickadee': ['black', 'white', 'gray'],
  'carolina-wren': ['brown', 'white'],
  'tufted-titmouse': ['gray', 'white'],
  'white-breasted-nuthatch': ['blue', 'white', 'black'],
  'brown-thrasher': ['brown', 'white'],
  'american-robin': ['orange', 'gray', 'black'],
  'blue-jay': ['blue', 'white', 'black'],
  'eastern-bluebird': ['blue', 'orange', 'white'],
  'american-goldfinch': ['yellow', 'black'],
  'mourning-dove': ['brown', 'gray'],
  'belted-kingfisher': ['blue', 'white'],
  'eastern-phoebe': ['gray', 'white'],
  'downy-woodpecker': ['black', 'white', 'red'],
  'red-bellied-woodpecker': ['red', 'black', 'white'],
  'northern-flicker': ['brown', 'yellow', 'black'],
  'pileated-woodpecker': ['black', 'red', 'white'],
  'wood-duck': ['green', 'red', 'white'],
  'great-blue-heron': ['blue', 'gray'],
  'great-egret': ['white'],
  'killdeer': ['brown', 'white', 'orange'],
  'turkey-vulture': ['black', 'red'],
  'red-tailed-hawk': ['brown', 'white'],
  'red-shouldered-hawk': ['orange', 'brown', 'black'],
  'coopers-hawk': ['gray', 'orange', 'white'],
  'barred-owl': ['brown', 'white'],
  'great-horned-owl': ['brown', 'orange'],
  'bald-eagle': ['brown', 'white', 'yellow'],
  'eastern-meadowlark': ['yellow', 'brown', 'black'],
  'red-winged-blackbird': ['black', 'red', 'yellow'],

  // Summer breeders
  'mississippi-kite': ['gray', 'white'],
  'ruby-throated-hummingbird': ['green', 'red', 'white'],
  'chimney-swift': ['gray', 'black'],
  'prothonotary-warbler': ['yellow', 'gray'],
  'yellow-billed-cuckoo': ['brown', 'white', 'yellow'],
  'indigo-bunting': ['blue'],
  'summer-tanager': ['red'],
  'red-eyed-vireo': ['green', 'white'],
  'eastern-kingbird': ['black', 'white'],
  'barn-swallow': ['blue', 'orange'],
  'purple-martin': ['blue', 'black'],
  'common-yellowthroat': ['yellow', 'black'],
  'white-eyed-vireo': ['yellow', 'green', 'white'],

  // Winter visitors
  'white-throated-sparrow': ['brown', 'white', 'yellow'],
  'dark-eyed-junco': ['gray', 'white'],
  'cedar-waxwing': ['brown', 'yellow', 'red'],
  'yellow-rumped-warbler': ['gray', 'yellow', 'black'],
  'ruby-crowned-kinglet': ['green', 'white'],
  'hermit-thrush': ['brown', 'white'],
  'american-white-pelican': ['white', 'black'],

  // Migrants
  'american-redstart': ['black', 'orange'],
  'magnolia-warbler': ['yellow', 'black', 'white'],
  'tennessee-warbler': ['green', 'white'],
  'black-throated-green-warbler': ['yellow', 'green', 'black'],
  'black-and-white-warbler': ['black', 'white'],
  'greater-yellowlegs': ['gray', 'yellow', 'white'],
  'solitary-sandpiper': ['brown', 'white'],
  'sandhill-crane': ['gray', 'red'],
  'broad-winged-hawk': ['brown', 'white'],
  'yellow-warbler': ['yellow'],
  'chestnut-sided-warbler': ['yellow', 'brown', 'white'],
  'scarlet-tanager': ['red', 'black'],
  'gray-catbird': ['gray', 'black'],
  'ovenbird': ['brown', 'white', 'orange'],

  // Montgomery Bell trip targets (upland TN forest)
  'wood-thrush': ['brown', 'white'],
  'hooded-warbler': ['yellow', 'black'],
  'worm-eating-warbler': ['brown', 'white'],
  'kentucky-warbler': ['yellow', 'black', 'green'],
  'louisiana-waterthrush': ['brown', 'white'],
  'yellow-throated-vireo': ['yellow', 'green', 'white'],
  'acadian-flycatcher': ['green', 'white'],
  'wild-turkey': ['brown', 'black', 'red'],
  'pine-warbler': ['yellow', 'green'],

  // West TN Mississippi Flyway targets (Reelfoot, Big Hill Pond)
  'snow-goose': ['white', 'black'],
  'anhinga': ['black', 'white'],
  'swainsons-warbler': ['brown', 'yellow'],
  'least-bittern': ['brown', 'yellow', 'black'],

  // West TN Kentucky Lake / river targets (Natchez Trace, Kentucky Lake parks)
  'osprey': ['brown', 'white', 'black'],
  'common-loon': ['gray', 'white', 'black'],
  'prairie-warbler': ['yellow', 'black'],
  'yellow-breasted-chat': ['yellow', 'green'],
  'chuck-wills-widow': ['brown'],
  'northern-parula': ['blue', 'yellow', 'green'],
  'great-crested-flycatcher': ['yellow', 'brown', 'gray'],
  'yellow-throated-warbler': ['yellow', 'gray', 'black'],
  'warbling-vireo': ['gray', 'white'],
  'eastern-towhee': ['black', 'orange', 'white'],
  'cerulean-warbler': ['blue', 'white'],
  'black-throated-blue-warbler': ['blue', 'black', 'white'],
  'canada-warbler': ['gray', 'yellow', 'black'],
  'golden-winged-warbler': ['gray', 'yellow', 'black'],
};

export function getColorsFor(speciesId: string): Color[] {
  return SPECIES_COLORS[speciesId] ?? [];
}

/**
 * Short field-mark-style color descriptions per species.
 * Shown as hover tooltips on species cards in Quick ID results.
 */
export const COLOR_DESCRIPTIONS: Record<string, string> = {
  'northern-cardinal': 'All red with black mask (male); warm tan w/ red wash (female)',
  'northern-mockingbird': 'Slim gray with white wing-patches',
  'carolina-chickadee': 'Black cap + bib, white cheeks, gray back',
  'carolina-wren': 'Warm rusty brown with bold white eyebrow',
  'tufted-titmouse': 'Soft gray-blue with pointed crest',
  'white-breasted-nuthatch': 'Blue-gray back, black cap, white face',
  'brown-thrasher': 'Rusty-brown with streaky white chest + yellow eye',
  'american-robin': 'Gray back, warm orange breast',
  'blue-jay': 'Bright blue with black necklace + crest',
  'eastern-bluebird': 'Sky-blue back, rust-orange breast',
  'american-goldfinch': 'Yellow body + black wings (male summer); olive (winter)',
  'mourning-dove': 'Slim tan-brown with long pointed tail',
  'belted-kingfisher': 'Blue-gray with shaggy crest, white collar',
  'eastern-phoebe': 'Plain gray-brown, pale belly, pumps tail',
  'downy-woodpecker': 'Black-and-white checkered, small red nape spot',
  'red-bellied-woodpecker': 'Zebra-back with red cap',
  'northern-flicker': 'Brown-barred with black bib + yellow wing-shafts',
  'pileated-woodpecker': 'Crow-sized, black with flaming red crest',
  'wood-duck': 'Iridescent green head, red eye, spectacular patterning',
  'great-blue-heron': 'Huge blue-gray with long S-neck',
  'great-egret': 'Tall, all-white with yellow bill + black legs',
  'killdeer': 'Tan with two black chest bands',
  'turkey-vulture': 'Huge dark bird with bald red head',
  'red-tailed-hawk': 'Brown above, pale below, brick-red tail',
  'red-shouldered-hawk': 'Rufous-barred chest + checkered wings',
  'coopers-hawk': 'Gray back, rusty-barred chest, long banded tail',
  'barred-owl': 'Brown-and-white owl, dark eyes, horizontal chest bars',
  'great-horned-owl': 'Massive, ear tufts, yellow eyes, mottled brown',
  'bald-eagle': 'White head + tail on dark-brown body (adults)',
  'eastern-meadowlark': 'Yellow chest with bold black V',
  'red-winged-blackbird': 'Black with red-and-yellow shoulder patch (male)',
  'mississippi-kite': 'Pale gray raptor with ghost-white head',
  'ruby-throated-hummingbird': 'Green back, ruby throat (male), tiny',
  'chimney-swift': 'Cigar-shaped, dark gray, stiff curved wings',
  'prothonotary-warbler': 'Glowing golden head + chest, blue-gray wings',
  'yellow-billed-cuckoo': 'Slim brown, long tail with white spots, yellow bill',
  'indigo-bunting': 'Electric blue all over (male); tan (female)',
  'summer-tanager': 'Entirely rose-red, no black',
  'red-eyed-vireo': 'Plain olive-green with white eyebrow + red eye',
  'eastern-kingbird': 'Black back, white chest + white tail-tip',
  'barn-swallow': 'Blue back, rusty throat, deeply forked tail',
  'purple-martin': 'Large dark glossy blue-purple swallow',
  'common-yellowthroat': 'Yellow throat with black bandit mask (male)',
  'white-eyed-vireo': 'Olive back, yellow spectacles, pale eye',
  'white-throated-sparrow': 'Striped head with white throat + yellow lores',
  'dark-eyed-junco': 'Slate-gray above, white belly, pink bill',
  'cedar-waxwing': 'Sleek tan-brown with black mask + yellow tail-tip',
  'yellow-rumped-warbler': 'Streaky gray-brown with bright yellow rump',
  'ruby-crowned-kinglet': 'Tiny olive-gray with white eye-ring',
  'hermit-thrush': 'Brown back with warm reddish tail, spotted chest',
  'american-white-pelican': 'Enormous white with black wingtips + yellow bill',
  'american-redstart': 'Black + flame-orange patches (male)',
  'magnolia-warbler': 'Yellow with black streaks + half-white tail',
  'tennessee-warbler': 'Plain olive-green with white underparts',
  'black-throated-green-warbler': 'Yellow face + black throat bib',
  'black-and-white-warbler': 'Black-and-white zebra stripes',
  'greater-yellowlegs': 'Tall slim shorebird on bright yellow legs',
  'solitary-sandpiper': 'Dark-backed sandpiper with white eye-ring',
  'sandhill-crane': 'Huge gray with bare red crown patch',
  'broad-winged-hawk': 'Chunky brown buteo with bold banded tail',
  'yellow-warbler': 'Entirely canary-yellow (male w/ rusty chest streaks)',
  'chestnut-sided-warbler': 'Yellow crown + chestnut-brown side stripes',
  'scarlet-tanager': 'Scarlet red body with jet-black wings',
  'gray-catbird': 'Slate-gray with black cap, rusty under-tail',
  'ovenbird': 'Brown-backed, streaked chest, orange crown stripe',
  'wood-thrush': 'Cinnamon-brown back, bold black spots on white belly',
  'hooded-warbler': 'Yellow face with jet-black hood (male); plain yellow (female)',
  'worm-eating-warbler': 'Plain buffy-olive with bold black-and-buff head stripes',
  'kentucky-warbler': 'Yellow throat with black sideburns + yellow spectacles',
  'louisiana-waterthrush': 'Brown back, streaked white belly, walks + bobs on streams',
  'yellow-throated-vireo': 'Olive back, bright yellow throat + spectacles, white wing bars',
  'acadian-flycatcher': 'Plain olive-green with white wing bars + pale eye-ring',
  'wild-turkey': 'Huge iridescent bronze bird with bare blue-and-red head',
  'pine-warbler': 'Olive-yellow with white wing bars, always in pines',
  'snow-goose': 'White body with black wingtips (or dark "blue morph")',
  'anhinga': 'Long snake-neck, black body with silver wing streaks',
  'swainsons-warbler': 'Plain olive-brown, white eyebrow — the plainest warbler',
  'least-bittern': 'Tiny buff-and-chestnut heron that climbs cattails',
  'osprey': 'Brown above, white below, dark eye-stripe, crooked wings',
  'common-loon': 'Large diver, dagger bill, gray-and-white in winter',
  'prairie-warbler': 'Yellow with black side-streaks, wags tail constantly',
  'yellow-breasted-chat': 'Bright yellow breast, olive above, white spectacles, heavy bill',
  'chuck-wills-widow': 'Cryptic mottled brown nightjar with enormous gape',
  'northern-parula': 'Blue-gray with yellow throat, green back patch, chest band',
  'great-crested-flycatcher': 'Olive above, yellow belly, rusty-red tail, loud WHEEP',
  'yellow-throated-warbler': 'Bright yellow throat, black-and-white face, gray back',
  'warbling-vireo': 'Plain gray-olive, whitish below, faint eyebrow — the plainest bird',
  'eastern-towhee': 'Black head + back, rufous sides, white belly, red eye (male)',
  'cerulean-warbler': 'Sky-blue above, white below with dark blue necklace (male)',
  'black-throated-blue-warbler': 'Navy-blue above, black throat, white pocket handkerchief (male)',
  'canada-warbler': 'Blue-gray above, yellow below with black necklace of streaks',
  'golden-winged-warbler': 'Gray body with golden wing patch + crown, black mask (male)',
};

export function getColorDescription(speciesId: string): string | null {
  return COLOR_DESCRIPTIONS[speciesId] ?? null;
}

export const ALL_COLORS: Color[] = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'brown',
  'black',
  'white',
  'gray',
];
