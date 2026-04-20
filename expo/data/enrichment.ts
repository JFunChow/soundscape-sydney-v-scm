export interface SpotEnrichment {
  indigenousName?: string;
  custodians: string;
  culturalSignificance: string;
  historyTimeline: { year: string; event: string }[];
  funFact: string;
  soundInterpretation: string;
  backupImageUrl?: string;
  additionalArchive?: { imageUrl: string; period: string; description: string; source?: string }[];
}

export const enrichmentById: Record<string, SpotEnrichment> = {
  'botanic-garden': {
    indigenousName: 'Woccanmagully',
    custodians: 'Gadigal people of the Eora Nation',
    culturalSignificance:
      'Used for initiation ceremonies and the Kangaroo and Dog Dance. A gathering place woven into seasonal life on Sydney Harbour.',
    historyTimeline: [
      { year: 'pre-1788', event: 'Ceremonial ground for the Gadigal people.' },
      { year: '1788', event: 'Governor Phillip sets land aside as Government Domain.' },
      { year: '1816', event: 'Macquarie founds the Royal Botanic Garden at Farm Cove.' },
      { year: '1960s', event: 'Cove ceases to be used as a naval anchorage.' },
    ],
    funFact:
      'The Botanic Garden is home to the Wollemi Pine — a living fossil thought extinct for 2 million years until rediscovered nearby in 1994.',
    soundInterpretation:
      'Rainbow lorikeets and noisy miners layer above the low rumble of the harbour ferries. Mornings favour birdsong; afternoons drift into the hum of the city beyond the sea wall.',
    backupImageUrl: 'https://images.unsplash.com/photo-1524429656589-6633a470097c?w=1200',
  },
  'sydney-opera-house': {
    indigenousName: 'Tubowgule / Dubbagullee',
    custodians: 'Gadigal people of the Eora Nation',
    culturalSignificance:
      'Bennelong Point was a meeting place where fresh water met salt. Oyster shells gathered by Gadigal women over generations were later burnt by convicts for lime mortar.',
    historyTimeline: [
      { year: 'pre-1788', event: 'Tubowgule — a gathering and oyster-harvesting island.' },
      { year: '1790', event: 'Governor Phillip builds a brick hut for Woollarawarre Bennelong.' },
      { year: '1818', event: 'Fort Macquarie built on the point.' },
      { year: '1973', event: 'Jørn Utzon\u2019s Opera House opens to the public.' },
    ],
    funFact:
      'The Opera House sails are clad in 1,056,006 Swedish-made ceramic tiles — and no two sails share the exact same curve.',
    soundInterpretation:
      'Tourist chatter, ferry horns, and seagulls frame the space. Inside the Concert Hall, reverberation is sculpted to hold an orchestra like water in a bowl.',
    backupImageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200',
  },
  'circular-quay': {
    custodians: 'Gadigal people of the Eora Nation',
    culturalSignificance:
      'Known as Warrane, this sheltered cove was a fishing ground for Gadigal women who paddled nawi (bark canoes) with small fires burning on board to cook their catch.',
    historyTimeline: [
      { year: 'pre-1788', event: 'Warrane — a fishing cove of the Gadigal.' },
      { year: '1837\u20131844', event: 'Semi-Circular Quay constructed from convict labour.' },
      { year: '1956', event: 'Elevated Circular Quay railway station completes the City Circle.' },
    ],
    funFact:
      'The quay is paved with over 60 bronze "Writers Walk" plaques — quotes from Australian authors embedded into the footpath.',
    soundInterpretation:
      'Ferry engines, rolling luggage, buskers, and the rhythmic slap of wake against the seawall make this one of Sydney\u2019s most densely layered soundscapes.',
    backupImageUrl: 'https://images.unsplash.com/photo-1523059623039-a9ed027e7fad?w=1200',
  },
  'lavender-bay': {
    indigenousName: 'Quibaree (Gooweebahree)',
    custodians: 'Cammeraigal people of the Eora Nation',
    culturalSignificance:
      'Quibaree — believed to mean "fresh water" — was a protected bay used for fishing. The Cammeraigal fished with shell hooks and canoe-borne hand lines.',
    historyTimeline: [
      { year: 'pre-1788', event: 'A freshwater bay fished by the Cammeraigal.' },
      { year: '1824', event: 'HMS Buffalo moored here as the prison hulk Phoenix.' },
      { year: '1820s\u201330s', event: 'Renamed Lavender Bay after boatswain George Lavender.' },
      { year: '1932', event: 'The Sydney Harbour Bridge opens overhead.' },
    ],
    funFact:
      'Wendy Whiteley\u2019s Secret Garden, on the bay\u2019s slope, was carved out of a derelict railway cutting and is tended entirely by volunteers.',
    soundInterpretation:
      'Water laps between the piles of the old wharf; the harbour bridge traffic hums above like a distant tide. At dawn the bay feels almost rural.',
    backupImageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200',
  },
  'lavender-bay-2': {
    indigenousName: 'Quibaree',
    custodians: 'Cammeraigal people of the Eora Nation',
    culturalSignificance:
      'Same ancestral waters as Lavender Bay — a fishing and gathering ground for the Cammeraigal, with freshwater seepage along the foreshore.',
    historyTimeline: [
      { year: 'pre-1788', event: 'Fishing bay of the Cammeraigal.' },
      { year: '1932', event: 'The Sydney Harbour Bridge transforms the skyline.' },
    ],
    funFact:
      'The view from Lavender Bay is the classic angle used in many postcards of the Harbour Bridge\u2014 framed by Luna Park\u2019s grinning face.',
    soundInterpretation:
      'Distant rollercoaster shrieks from Luna Park mix with ferry wash and gulls. The bridge acts as a low, steady drone.',
  },
  'china-town': {
    custodians: 'Gadigal people of the Eora Nation',
    culturalSignificance:
      'Haymarket sits on Gadigal land. From the 1870s, Chinese market gardeners and merchants made this their community anchor, following the gold rush migrations.',
    historyTimeline: [
      { year: 'pre-1788', event: 'Gadigal country on the edge of the Tank Stream catchment.' },
      { year: '1860s', event: 'Chinese market gardeners settle around Dixon Street.' },
      { year: '1980', event: 'Dixon Street pedestrianised as Chinatown\u2019s civic heart.' },
      { year: '2013', event: 'Lin Utzon\u2019s "Golden Water Mouth" tree installed.' },
    ],
    funFact:
      'Every Friday night, Dixon Street closes to traffic and transforms into the largest night food market in the Sydney CBD.',
    soundInterpretation:
      'A chorus of languages, wok hei sizzle, and the hydraulic hiss of buses along George Street. Festival drums punctuate Lunar New Year.',
    backupImageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200',
  },
  'central-station': {
    custodians: 'Gadigal people of the Eora Nation',
    culturalSignificance:
      'Built over the old Devonshire Street Cemetery, which held burials from 1820. The site has layered histories — Gadigal land, early colonial graveyard, then transport hub.',
    historyTimeline: [
      { year: 'pre-1788', event: 'Gadigal country, part of the Tank Stream catchment.' },
      { year: '1906', event: 'Central Station opens with its iconic clock tower (added 1921).' },
      { year: '2024', event: 'Sydney Metro opens vast new underground platforms.' },
    ],
    funFact:
      'The clock tower\u2019s four faces are 5 metres wide each, and the tower once housed a bell that was silenced during WWII.',
    soundInterpretation:
      'Metallic train announcements bounce across tiled walls. Footsteps, suitcase wheels, and the low whine of arriving trains weave a constantly moving rhythm.',
    backupImageUrl: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=1200',
  },
  'central-station-indoor': {
    custodians: 'Gadigal people of the Eora Nation',
    culturalSignificance:
      'The Grand Concourse is the acoustic soul of Central — a sandstone hall designed in the Federation Free Classical style.',
    historyTimeline: [
      { year: '1906', event: 'Grand Concourse opens with steam-era platforms.' },
      { year: '1926', event: 'Electrified trains arrive.' },
    ],
    funFact:
      'The tiled floor still carries scuffs from a century of workers\u2019 boots — the sandstone walls amplify every footfall.',
    soundInterpretation:
      'An echo chamber of announcements, departures, and distant station pianos — deeper and more cavernous than the open-air platforms.',
  },
  'central-station-exit-6': {
    custodians: 'Gadigal people of the Eora Nation',
    culturalSignificance:
      'Chalmers Street marks the boundary between the railway precinct and Surry Hills\u2019 terrace-lined streets.',
    historyTimeline: [
      { year: '1890s', event: 'Chalmers Street developed as a tram corridor.' },
      { year: '2024', event: 'Exit 6 links to the new Sydney Metro platforms.' },
    ],
    funFact:
      'This corner is one of the busiest pedestrian crossings in NSW — over 20,000 people cross here every weekday.',
    soundInterpretation:
      'Constant street traffic, door seals hissing on buses, and the hum of thousands of footsteps moving in and out of the station.',
  },
  'saint-marys-cathedral': {
    custodians: 'Gadigal people of the Eora Nation',
    culturalSignificance:
      'The cathedral stands on high ground that once overlooked the Tank Stream valley — Gadigal land before colonisation. Construction stretched over 60 years of neo-Gothic masonry.',
    historyTimeline: [
      { year: '1821', event: 'Foundation stone laid by Governor Macquarie.' },
      { year: '1882', event: 'Fire destroys the original building.' },
      { year: '2000', event: 'Spires finally added, completing the design.' },
    ],
    funFact:
      'The crypt floor contains a terrazzo mosaic that took 15 years to lay — one of the largest of its kind in the world.',
    soundInterpretation:
      'Bells on the hour, organ pipes seeping through the sandstone walls, and the deep quiet of the nave. A space shaped for low frequencies.',
    backupImageUrl: 'https://images.unsplash.com/photo-1564510714747-69c3bc1fab41?w=1200',
  },
  'chatswood-station': {
    custodians: 'Cammeraygal people of the Eora Nation',
    culturalSignificance:
      'Chatswood sits on Cammeraygal country. The name "Chatswood" honours Charlotte Harnett, wife of an early local mayor.',
    historyTimeline: [
      { year: 'pre-1788', event: 'Cammeraygal country with forest tracks to the harbour.' },
      { year: '1890', event: 'First railway station opens.' },
      { year: '2019', event: 'Becomes the interchange for Sydney\u2019s first Metro line.' },
    ],
    funFact:
      'Chatswood was the first Sydney station where train doors were opened automatically by driverless Metro trains.',
    soundInterpretation:
      'The soft warning chime of Metro doors, announcements in multiple languages, and the gentle whoosh of arriving trains — quieter than older stations because the Metro is rubber-tyred on some sections and heavily dampened.',
  },
  'town-hall': {
    custodians: 'Gadigal people of the Eora Nation',
    culturalSignificance:
      'Built over the old Sydney Burial Ground (1792\u20131820). Gadigal land reshaped twice — first into a cemetery, then into Sydney\u2019s civic centre.',
    historyTimeline: [
      { year: '1869', event: 'Foundation stone laid.' },
      { year: '1889', event: 'Grand Organ installed — one of the largest in the world.' },
      { year: '1932', event: 'Harbour Bridge opening broadcast live from the Town Hall.' },
    ],
    funFact:
      'The Centennial Hall organ has 8,756 pipes. Its 64-foot reed stop produces notes so low they are felt more than heard.',
    soundInterpretation:
      'George Street traffic, the pulse of pedestrians crossing six ways, buskers amplified by the sandstone facade, and occasionally, organ vibrations escaping the great hall upstairs.',
    backupImageUrl: 'https://images.unsplash.com/photo-1600544651406-e5f9b4a09c1c?w=1200',
  },
  'cremorne-point': {
    custodians: 'Cammeraygal people of the Eora Nation',
    culturalSignificance:
      'Known to the Cammeraygal as a rich fishing shoreline. Middens of oyster and mussel shells still emerge from erosion along the foreshore walk.',
    historyTimeline: [
      { year: 'pre-1788', event: 'Cammeraygal fishing country.' },
      { year: '1856', event: 'Cremorne Pleasure Gardens opens with public entertainments.' },
      { year: '1908', event: 'Cremorne Reserve dedicated as public open space.' },
    ],
    funFact:
      'MacCallum Pool, carved into the rocks here, has been free to the public since 1922 and is maintained by volunteers.',
    soundInterpretation:
      'Lapping water against the seawall, cicadas in summer, distant ferry wakes, and the occasional splash of swimmers in the tidal pool.',
    backupImageUrl: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1200',
  },
  'cremorne-point-manly-drive': {
    custodians: 'Cammeraygal people of the Eora Nation',
    culturalSignificance:
      'Military Road follows an old ridge track. For the Cammeraygal, the ridgelines of the north shore were travel routes linking harbour bays.',
    historyTimeline: [
      { year: 'pre-1788', event: 'Ridge-top pathway for the Cammeraygal.' },
      { year: '1870s', event: 'Military Road cut through for coastal defence access.' },
    ],
    funFact:
      'Military Road was originally a foot track to the cannon emplacements at Middle Head — hence the name.',
    soundInterpretation:
      'Traffic rolls past roadside lilly pilly and jacaranda — a strong anthrophony layered with seasonal birds nesting in suburban gardens.',
  },
  'yena-picnic-area': {
    indigenousName: 'Yena (meaning "to walk")',
    custodians: 'Gweagal people of the Dharawal Nation',
    culturalSignificance:
      'Kamay (Botany Bay) is where the Gweagal first encountered the Endeavour in 1770. The shore still holds middens and grinding grooves.',
    historyTimeline: [
      { year: 'pre-1770', event: 'Gweagal country, a shellfish and fishing shore.' },
      { year: '1770', event: 'First contact at Kamay \u2014 Gweagal warriors confront Cook\u2019s landing party.' },
      { year: '1988', event: 'Site declared part of Kamay Botany Bay National Park.' },
    ],
    funFact:
      'The Yena walking track is marked with Gweagal language words \u2014 the word Yena itself means "to walk".',
    soundInterpretation:
      'Crashing Pacific surf, banksia seed pods rattling in the wind, New Holland honeyeaters whistling in coastal heath.',
    backupImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
  },
  'depena-reserve': {
    custodians: 'Bidjigal people of the Dharug and Eora nations',
    culturalSignificance:
      'Georges River estuary was and is rich fishing country. The mangrove flats were used for eel and flathead gathering.',
    historyTimeline: [
      { year: 'pre-1788', event: 'Bidjigal fishing and gathering shore.' },
      { year: '1960s', event: 'Reserve formally protected amid post-war suburban expansion.' },
    ],
    funFact:
      'The reserve\u2019s mangroves are a nursery for juvenile flathead \u2014 a species central to Sydney\u2019s estuarine diet for thousands of years.',
    soundInterpretation:
      'Mangroves creak with the tide. Whistling kites cry overhead; in the distance, boats from Sandringham Bay thread the channel.',
  },
  'little-bay-beach': {
    custodians: 'Bidjigal and Gadigal people',
    culturalSignificance:
      'Shell middens and spear-sharpening grooves still appear along the Little Bay cliffs — evidence of long-standing Aboriginal occupation.',
    historyTimeline: [
      { year: 'pre-1788', event: 'Bidjigal fishing bay \u2014 middens and grooves remain.' },
      { year: '1882', event: 'Coast Hospital established for smallpox quarantine.' },
      { year: '2021', event: 'Little Bay Beach wrapped by Christo and Jeanne-Claude\u2019s legacy project.' },
    ],
    funFact:
      'In 1969, Christo and Jeanne-Claude wrapped the entire coastline at Little Bay in fabric \u2014 their first large-scale "wrapped coast" artwork.',
    soundInterpretation:
      'Sheltered surf, kelp crackling as waves withdraw, and the whistle of wind across the sandstone headland.',
    backupImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
  },
  'lady-robinsons-beach': {
    custodians: 'Bidjigal and Gweagal people',
    culturalSignificance:
      'Kamay (Botany Bay) is the first documented point of sustained contact between Aboriginal people and British colonists. The beach extends the long fishing shoreline of the northern bay.',
    historyTimeline: [
      { year: 'pre-1788', event: 'Bay fishing country shared by neighbouring clans.' },
      { year: '1881', event: 'Named after Lady Nea Robinson, wife of the NSW governor.' },
      { year: '1920s', event: 'Sydney Airport\u2019s first runway breaks ground nearby.' },
    ],
    funFact:
      'Jets from Sydney Airport pass 300 metres overhead every few minutes \u2014 this is one of the closest beaches to an active international runway in the world.',
    soundInterpretation:
      'A cyclical crescendo of jet engines over a constant wash of bay waves. Few places express anthrophony so directly.',
  },
  'flat-rock-gully': {
    custodians: 'Cammeraygal people of the Eora Nation',
    culturalSignificance:
      'A steep bush gully with rock shelters and engraved sites \u2014 part of the Cammeraygal network of inland tracks.',
    historyTimeline: [
      { year: 'pre-1788', event: 'Cammeraygal bushland with shelters and carvings.' },
      { year: '1930s', event: 'Used as a council tip, later rehabilitated.' },
      { year: '2000s', event: 'Bush regeneration restores native understorey.' },
    ],
    funFact:
      'The creek here still flows clearly after rain \u2014 rare for inner-city Sydney, where most waterways are piped underground.',
    soundInterpretation:
      'Dense canopy absorbs traffic. Lyrebirds have been reported imitating chainsaws and camera shutters, a living archive of the gully\u2019s sounds.',
    backupImageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200',
  },
  'world-square': {
    custodians: 'Gadigal people of the Eora Nation',
    culturalSignificance:
      'Sat empty as a construction pit for over two decades \u2014 locals called it "The Hole". It opened as a mixed-use plaza in 2004.',
    historyTimeline: [
      { year: 'pre-1788', event: 'Gadigal country, close to the Tank Stream headwaters.' },
      { year: '1983\u20132004', event: 'Sydney\u2019s most famous abandoned building site \u2014 "The Hole".' },
      { year: '2004', event: 'World Square plaza opens.' },
    ],
    funFact:
      'At its peak "The Hole" collected enough rainwater to attract urban eels \u2014 who were evacuated by wildlife carers before construction resumed.',
    soundInterpretation:
      'Enclosed plaza acoustics: escalator hum, food-court chatter, rubber soles on polished stone, and the blunt thud of CBD buses outside.',
  },
  'city-driving': {
    custodians: 'Gadigal people of the Eora Nation',
    culturalSignificance:
      'The CBD grid follows the paths cut by early colonial surveyors over Gadigal country, often retracing older walking routes.',
    historyTimeline: [
      { year: '1820s', event: 'Street grid formally laid out.' },
      { year: '2019', event: 'Light rail returns to George Street.' },
    ],
    funFact:
      'Sydney\u2019s CBD streets were originally designed for bullock carts \u2014 which is why they are narrower than those in Melbourne.',
    soundInterpretation:
      'Engine idle, turn signals, the door chime of the light rail, and reflected traffic noise bouncing between glass facades.',
  },
  'surry-hill': {
    custodians: 'Gadigal people of the Eora Nation',
    culturalSignificance:
      'A working-class terrace suburb built on the ridge above the Tank Stream. Once the heart of Sydney\u2019s rag trade.',
    historyTimeline: [
      { year: 'pre-1788', event: 'Gadigal ridge country above the Tank Stream.' },
      { year: '1880s', event: 'Terrace houses built for textile workers.' },
      { year: '2000s', event: 'Cafes and design studios transform the high streets.' },
    ],
    funFact:
      'Kim Ledger once owned a Crown Street pub \u2014 his son Heath Ledger used to live in a terrace two blocks away.',
    soundInterpretation:
      'Espresso machines, weekend brunch chatter, scooters on narrow lanes, and distant sirens from the hospitals on the ridge.',
    backupImageUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=1200',
  },
  'coogee-beach': {
    custodians: 'Bidjigal people of the Eora Nation',
    culturalSignificance:
      'The name Coogee is from the Dharug word "koojah", meaning "smelly place" \u2014 a reference to the seaweed once piled on the shore.',
    historyTimeline: [
      { year: 'pre-1788', event: 'Bidjigal fishing and gathering bay.' },
      { year: '1928', event: 'Giant Wedding Cake Island landmark named.' },
      { year: '1989', event: 'Coogee Pier demolished.' },
    ],
    funFact:
      'Wedding Cake Island, 1km offshore, gets its name from how surf foam stacks on it in three tiers during big swells.',
    soundInterpretation:
      'Swell on the sand, children\u2019s voices carrying off the headlands, gulls, and the faint metallic clang of rigging from the sailing club.',
    backupImageUrl: 'https://images.unsplash.com/photo-1506260408121-e353d10b87c7?w=1200',
  },
  'unsw': {
    custodians: 'Bidjigal people of the Eora Nation',
    culturalSignificance:
      'Built on the former Kensington Racecourse, on Bidjigal country. UNSW now has one of Australia\u2019s longest-running Nura Gili Indigenous centres.',
    historyTimeline: [
      { year: 'pre-1788', event: 'Bidjigal country, sandhills and swamp.' },
      { year: '1949', event: 'NSW University of Technology founded.' },
      { year: '2019', event: 'Light rail connects campus to the CBD.' },
    ],
    funFact:
      'The Scientia building at UNSW is shaped like a lantern — at night it glows, a deliberate nod to the "light of knowledge".',
    soundInterpretation:
      'Library hush punctuated by footsteps on polished concrete, the rolling whir of the L2 light rail, and conversations in dozens of languages.',
  },
  'centennial-park': {
    indigenousName: 'Kangaroo Ground',
    custodians: 'Gadigal and Bidjigal people',
    culturalSignificance:
      'Before it was dammed and landscaped, Centennial Park was the Lachlan Swamps \u2014 a vital fresh water source for Sydney and for the Gadigal people.',
    historyTimeline: [
      { year: 'pre-1788', event: 'Lachlan Swamps \u2014 fresh water and reed country.' },
      { year: '1888', event: 'Dedicated as a park for Australia\u2019s centenary.' },
      { year: '1901', event: 'Federation declared at the park\u2019s Commonwealth Stone.' },
    ],
    funFact:
      'The park\u2019s ponds still sit on Sydney\u2019s original fresh water source \u2014 the Lachlan Swamps once supplied most of the early city.',
    soundInterpretation:
      'Cockatoos scream at dusk, horse hooves padding on sand tracks, and the distant cheer of weekend sport drifting over open lawns.',
    backupImageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200',
  },
  'dickens-drive-centennial-park': {
    custodians: 'Gadigal and Bidjigal people',
    culturalSignificance:
      'One of the carriage loops cut through the former Lachlan Swamps \u2014 now lined with Moreton Bay figs over 130 years old.',
    historyTimeline: [
      { year: '1888', event: 'Dickens Drive planted with exotic and native trees.' },
    ],
    funFact:
      'Several of the figs along Dickens Drive have individual heritage listings \u2014 they are among the oldest street trees in Sydney.',
    soundInterpretation:
      'Wind in fig canopies, cyclists on gravel, and distant flying foxes in Centennial\u2019s palm grove.',
  },
  'hyde-park': {
    custodians: 'Gadigal people of the Eora Nation',
    culturalSignificance:
      'Originally a ceremonial ground and hunting area. Became Australia\u2019s first public park in 1810 under Governor Macquarie.',
    historyTimeline: [
      { year: 'pre-1788', event: 'Gadigal ceremonial ground.' },
      { year: '1810', event: 'Declared public parkland by Macquarie.' },
      { year: '1934', event: 'Archibald Fountain unveiled.' },
    ],
    funFact:
      'The Archibald Fountain chimes every quarter hour and was designed by French sculptor Fran\u00e7ois Sicard \u2014 despite celebrating French-Australian WWI cooperation.',
    soundInterpretation:
      'Fountain water, pigeons, chess players arguing, and the distant chime of St Mary\u2019s bells carried on the breeze.',
    backupImageUrl: 'https://images.unsplash.com/photo-1566133291786-3cb4a1a3c7e4?w=1200',
  },
  'state-library-nsw': {
    custodians: 'Gadigal people of the Eora Nation',
    culturalSignificance:
      'Holds the largest collection of Indigenous language records in NSW, including Bennelong\u2019s 1796 letter \u2014 the earliest known writing by an Aboriginal person.',
    historyTimeline: [
      { year: '1826', event: 'Australian Subscription Library founded.' },
      { year: '1910', event: 'Moved to its current Macquarie Street home.' },
      { year: '2018', event: 'John B Fairfax wing opens with new galleries.' },
    ],
    funFact:
      'The famous marble Shakespeare Room was modelled on an Elizabethan long hall \u2014 but is climate controlled to 19\u00b0C, perfect for readers.',
    soundInterpretation:
      'Turning pages, the whisper of climate control, occasional laptop keys, and the muted outside hum of Macquarie Street.',
    backupImageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200',
  },
  'sydney-park': {
    custodians: 'Gadigal people of the Eora Nation',
    culturalSignificance:
      'Once brickworks kilns that fired clay for much of inner Sydney\u2019s early housing. Restored wetlands now filter stormwater for the city.',
    historyTimeline: [
      { year: 'pre-1788', event: 'Gadigal swamp country.' },
      { year: '1871', event: 'St Peters Brickworks begins firing.' },
      { year: '1991', event: 'Park opens on the rehabilitated brickwork site.' },
    ],
    funFact:
      'The park\u2019s wetlands capture 840 million litres of stormwater every year \u2014 enough to fill 336 Olympic pools.',
    soundInterpretation:
      'Frog chorus after rain, ibis wings overhead, reeds rustling, and distant trains from the Erskineville line.',
    backupImageUrl: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=1200',
  },
  'campbell-road-bridge': {
    custodians: 'Gadigal people of the Eora Nation',
    culturalSignificance:
      'Spans the old goods line at Alexandria \u2014 a working-class industrial precinct on Gadigal country.',
    historyTimeline: [
      { year: '1915', event: 'Goods line extended through Alexandria.' },
      { year: '2020', event: 'Freight line revived for WestConnex hauls.' },
    ],
    funFact:
      'Despite being in the inner city, Campbell Road is one of the few places in Sydney where you can still see long freight trains thunder past.',
    soundInterpretation:
      'Metallic clangs from shunting yards, trucks rumbling on concrete, and steam-like squeal as freight wheels meet curves.',
  },
  'alexandria': {
    custodians: 'Gadigal people of the Eora Nation',
    culturalSignificance:
      'Historically a brickworks, abattoir, and tannery district. Today a mix of warehouse cafes and design studios, still tied to its industrial past.',
    historyTimeline: [
      { year: '1868', event: 'Alexandria incorporated as a borough.' },
      { year: '1900s', event: 'Home of Sydney\u2019s abattoirs and tanneries.' },
      { year: '2010s', event: 'Warehouse conversions dominate McEvoy Street.' },
    ],
    funFact:
      'Several Alexandria cafes occupy former horse stables \u2014 look for iron tethering rings still in the walls.',
    soundInterpretation:
      'Delivery vans, warehouse roller doors, espresso grinders, and the distant roar of the Westconnex tunnel portals.',
  },
  'sydney-opera-house-2': {
    custodians: 'Gadigal people of the Eora Nation',
    culturalSignificance:
      'Northern view of Bennelong Point \u2014 Tubowgule \u2014 looking toward the Harbour Bridge.',
    historyTimeline: [
      { year: '1973', event: 'Opera House opens.' },
      { year: '2007', event: 'Listed as UNESCO World Heritage.' },
    ],
    funFact:
      'The Opera House\u2019s sails were originally meant to be white, but look faintly pink at dawn thanks to the matte ceramic finish.',
    soundInterpretation:
      'Harbour ferries, the slap of water against the seawall, camera shutters, and the muffled swell of an orchestra tuning inside.',
  },
  'manly-wormhole': {
    custodians: 'Gayamagal people of the Eora Nation',
    culturalSignificance:
      'A natural rock tunnel cut by a century of swell. Reachable only at low tide along the Manly-to-Shelly headland.',
    historyTimeline: [
      { year: 'pre-1788', event: 'Gayamagal coastal fishing country.' },
      { year: '1880s', event: 'Local fishermen use the tunnel as a shortcut.' },
    ],
    funFact:
      'The tunnel is so small most adults have to crawl \u2014 and it is completely impassable at high tide.',
    soundInterpretation:
      'Amplified ocean: the crash of swell magnified through the rock, interrupted by silence between sets.',
    backupImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
  },
  'manly-harbour-drive': {
    custodians: 'Gayamagal people of the Eora Nation',
    culturalSignificance:
      'Manly Cove was a seasonal gathering site \u2014 the name "Manly" came from Governor Phillip\u2019s description of the "manly" bearing of the Gayamagal people he met here.',
    historyTimeline: [
      { year: 'pre-1788', event: 'Gayamagal gathering and fishing cove.' },
      { year: '1855', event: 'First passenger ferry runs to Manly.' },
    ],
    funFact:
      'The ferry journey from Circular Quay to Manly has run continuously since 1855 \u2014 one of the world\u2019s longest-running commuter ferries.',
    soundInterpretation:
      'Loud ocean swell on one side of the peninsula, calm harbour lapping on the other \u2014 in some spots you can hear both at once.',
  },
  'chinese-garden-of-friendship': {
    custodians: 'Gadigal people of the Eora Nation',
    culturalSignificance:
      'Opened in 1988 as a gift from Sydney\u2019s sister city Guangzhou. Built beside the old Tank Stream corridor on Gadigal country.',
    historyTimeline: [
      { year: '1988', event: 'Garden opens for the Australian Bicentenary.' },
      { year: '2018', event: 'Listed on the NSW State Heritage Register.' },
    ],
    funFact:
      'Every stone and roof tile in the garden was quarried and fired in China, then shipped to Sydney and hand-assembled by artisans from Guangdong.',
    soundInterpretation:
      'Trickling water, bamboo leaves in breeze, koi surfacing, and the quiet click of camera shutters \u2014 a deliberate acoustic shelter from the city.',
    backupImageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200',
  },
  'brickpit-ring-walk': {
    custodians: 'Wangal people of the Eora Nation',
    culturalSignificance:
      'Sydney Olympic Park lies on Wangal country along Haslams Creek. The brickpit once fired 3 billion bricks \u2014 now a sanctuary for the endangered green and golden bell frog.',
    historyTimeline: [
      { year: 'pre-1788', event: 'Wangal wetland country along Haslams Creek.' },
      { year: '1911\u20131988', event: 'State Brickworks fires more than 3 billion bricks.' },
      { year: '2005', event: 'The suspended Ring Walk opens above the frog habitat.' },
    ],
    funFact:
      'The Brickpit Ring Walk is suspended 18.5 metres above the ground to avoid disturbing the endangered green and golden bell frog population below.',
    soundInterpretation:
      'In summer dusk, the frogs call in a chorus audible across the ring \u2014 a high electronic-sounding ping against a backdrop of wetland insects.',
    backupImageUrl: 'https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?w=1200',
  },
};
