/** Retrieval module — rich mock data + generators (UI demo only) */

export const MOCK_PANORAMA =
  'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=1200&q=80'
export const MOCK_CROP = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
export const MOCK_FACE_THUMB = 'https://images.unsplash.com/photo-1599566150163-4ae9d7d7d0c5?auto=format&fit=crop&w=200&q=80'
export const MOCK_FACE_THUMB2 = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
export const MOCK_FACE_THUMB3 = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80'
export const MOCK_BODY_THUMB = 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80'
export const MOCK_BODY_THUMB2 = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
export const MOCK_VEHICLE = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80'
export const MOCK_PLATE_CLOSE = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=400&q=80'
export const MOCK_NONMOTOR = 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=600&q=80'

export const MAP_CENTER_LON_LAT: [number, number] = [121.4737, 31.2304]

const DEVICES = [
  'Cam-HX-Jiangwan-NB',
  'Face-B02-Guoquan',
  'PTZ-C12-NorthBund',
  'Cam-Subway-L4-Exit3',
  'LPR-Ring-A3-West',
  'Face-Mall-Entrance-A',
  'Cam-Park-B1-Lane2',
  'PTZ-Cross-Henan-Rd',
  'Cam-School-Gate-S',
  'LPR-Tunnel-Out-7',
  'Face-Office-Lobby',
  'Cam-Riverside-Walk',
  'Cam-Airport-T1-Arrival',
  'Face-Airport-T2-Checkin',
  'PTZ-Airport-P1-Exit',
  'LPR-Airport-Link-5'
]

const STREETS = [
  'Jiangwan Road, Hongkou',
  'Guoquan North Rd, Yangpu',
  'North Bund riverside',
  'West Nanjing Road, Jingan',
  'Lujiazui ring footbridge',
  'Wujiaochang plaza',
  'Tongji University gate',
  'Wenshui East Rd',
  'Middle Ring / Huta Rd',
  'Songhu Road express',
  'Dalian Road tunnel mouth',
  'Xincun Road market',
  'Hailun Road metro plaza',
  'Siping Road IT park',
  'Gonghexin Rd residential',
  'Airport Terminal 1 Arrival Hall',
  'Airport Terminal 2 Departure Level',
  'Airport VIP Lounge Entrance',
  'Airport Parking Garage P1'
]

function padNum(n: number, w: number) {
  return String(n).padStart(w, '0')
}

/** Library 1:N identity match for a single capture (sorted by score, desc) */
export interface IdentityMatch {
  rank: number
  score: number
  name: string
  idMask: string
  dataSource: string
  sampleFaceUrl: string
}

/** Optional graph layout hints for the family map (see FamilyRelationGraph) */
export interface FamilyGraphMember {
  id: string
  relation: string
  name: string
  idMask: string
}

export interface FamilyGraphData {
  members: FamilyGraphMember[]
  /** If absent, all members link to logical center (selected identity) */
  centerLabel?: string
}

export interface CaptureHit {
  id: string
  score: number
  time: string
  device: string
  address: string
  lonLat: [number, number]
  type: 'face' | 'body' | 'mix'
  panoramaUrl: string
  cropUrl: string
  faceAttrs: Record<string, string>
  bodyAttrs: Record<string, string>
  realName?: string
  idCard?: string
  identityMatches: IdentityMatch[]
  familyGraph: FamilyGraphData
  family: { relation: string; name: string; idMask: string }[]
  companions?: { 
    name: string; 
    relation: string; 
    candidates: IdentityMatch[] 
  }[]
  vehicleLinks: { plate: string; relation: string }[]
}

const ID_LIBS = [
  'Resident portrait (city)',
  'Driver license (mock)',
  'Railway real-name',
  'Hotel 90d stay',
  'Enterprise access',
  'Bank VIP (masked)',
  'Metro long-stay',
  'Social card sample',
  'Temp residence',
  'Delivery platform KYC'
]
const ID_NAMES = [
  'Zhang*Wei',
  'Zhang*San',
  'Zhang*Yi',
  'Li*Na',
  'Wang*Ke',
  'Zhao*',
  'Liu*Feng',
  'Chen*Bin',
  'Sun*',
  'Wu*Hao',
  'Xu*Lin',
  'Gao*',
  'Ma*Qiang',
  'Feng*',
  'Ding*'
]

function buildIdentityMatches(i: number): IdentityMatch[] {
  const baseScores = [98.6, 95.2, 91.0, 87.3, 84.0, 80.0, 76.0]
  const offset = (i % 4) * 0.3
  const raw = baseScores.map((s, r) => {
    const sc = Math.max(60, s - offset - r * 0.05 * (1 + (i % 3)))
    return {
      rank: 0,
      score: Math.round(sc * 10) / 10,
      name: ID_NAMES[(i + r) % ID_NAMES.length]!,
      idMask: `310110**********${padNum(20 + (i * 2 + r) % 60, 2)}`,
      dataSource: ID_LIBS[(i + r) % ID_LIBS.length]!,
      sampleFaceUrl: (r + i) % 2 ? MOCK_FACE_THUMB : MOCK_CROP
    }
  })
  const sorted = raw.sort((a, b) => b.score - a.score)
  sorted.forEach((row, idx) => {
    row.rank = idx + 1
  })
  return sorted
}

function buildFamilyGraphForHit(i: number): FamilyGraphData {
  const m: FamilyGraphMember[] = [
    { id: 'm1', relation: 'Spouse', name: 'Li*Na', idMask: '310***********12' },
    { id: 'm2', relation: 'Son', name: 'Zhang*Tong', idMask: '310***********33' },
    { id: 'm3', relation: 'Daughter', name: 'Zhang*Xue', idMask: '310***********44' },
    { id: 'm4', relation: 'Father', name: 'Zhang*Shan', idMask: '310***********01' },
    { id: 'm5', relation: 'Mother', name: 'Wang*', idMask: '320***********22' }
  ]
  return {
    members: m,
    centerLabel: 'Selected identity (top match or row click)'
  }
}

function oneCapture(i: number): CaptureHit {
  const type: CaptureHit['type'] = i % 5 === 0 ? 'body' : i % 7 === 0 ? 'mix' : 'face'
  const hour = 6 + (i % 14)
  const min = (i * 7) % 60
  const day = 22 - (i % 5)
  const score = Math.max(62, 99.2 - i * 0.35 - (i % 3) * 0.1)
  const lon = 121.4 + (i % 20) * 0.01
  const lat = 31.22 + (i % 15) * 0.006
  const plates = ['SH A D1**1', 'SH B 9**K', 'SE 5**Q', 'ZJ A 0**2', 'SH C 7**3']
  const identityMatches = buildIdentityMatches(i)
  const best = identityMatches[0]!
  const familyGraph = buildFamilyGraphForHit(i)
  return {
    id: `CAP-202604${padNum(day, 2)}${padNum(1000 + i, 4)}`,
    score: Math.round(score * 10) / 10,
    time: `2026-04-${padNum(day, 2)} ${padNum(hour, 2)}:${padNum(min, 2)}:33`,
    device: DEVICES[i % DEVICES.length]!,
    address: `${STREETS[i % STREETS.length]!} (sector ${(i % 4) + 1})`,
    lonLat: [lon, lat],
    type,
    panoramaUrl: MOCK_PANORAMA,
    cropUrl: type === 'body' 
      ? (i % 2 === 0 ? MOCK_BODY_THUMB : MOCK_BODY_THUMB2) 
      : (i % 3 === 0 ? MOCK_FACE_THUMB : i % 3 === 1 ? MOCK_FACE_THUMB2 : MOCK_FACE_THUMB3),
    faceAttrs: {
      Gender: i % 2 ? 'Male' : 'Female',
      'Age group': ['Child', 'Young', 'Middle', 'Senior'][i % 4]!,
      Mask: ['On', 'Off', 'Any'][i % 3]!,
      Glasses: i % 3 ? 'No' : 'Yes',
      Hat: ['No', 'Cap', 'Helmet'][i % 3]!
    },
    bodyAttrs: {
      'Top / coat': ['Dark jacket', 'Hoodie', 'Trench', 'Polo', 'Suit'][i % 5]!,
      'Bottom / pants': ['Jeans', 'Chinos', 'Shorts', 'Skirt', 'Joggers'][i % 5]!,
      Bag: ['None', 'Backpack', 'Shoulder', 'Trolley'][i % 4]!,
      Hair: ['Short', 'Long', 'Bun', 'Bald cap'][i % 4]!
    },
    realName: best.name,
    idCard: best.idMask,
    identityMatches,
    familyGraph,
    family:
      i % 4 === 0
        ? [
            { relation: 'Spouse', name: 'Li*', idMask: '310***********32' },
            { relation: 'Child', name: 'Zhang*Tong', idMask: '310***********01' }
          ]
        : i % 4 === 1
          ? [{ relation: 'Parent', name: 'Wang*', idMask: '320***********88' }]
          : familyGraph.members.slice(0, 3).map((m) => ({ relation: m.relation, name: m.name, idMask: m.idMask })),
    companions: [
      { 
        name: 'Ahmed*Ali', 
        relation: 'High Frequency', 
        candidates: buildIdentityMatches(i + 10).map(m => ({...m, name: m.name.replace('Zhang', 'Ali')})) 
      },
      { 
        name: 'Saif*Hassan', 
        relation: 'Colleague', 
        candidates: buildIdentityMatches(i + 20).map(m => ({...m, name: m.name.replace('Zhang', 'Hassan')})) 
      },
      { 
        name: 'Fatima*Omar', 
        relation: 'Friend', 
        candidates: buildIdentityMatches(i + 30).map(m => ({...m, name: m.name.replace('Zhang', 'Omar')})) 
      },
      { 
        name: 'Salem*Khalfan', 
        relation: 'Unknown', 
        candidates: buildIdentityMatches(i + 40).map(m => ({...m, name: m.name.replace('Zhang', 'Khalfan')})) 
      }
    ],
    vehicleLinks: [
      { plate: plates[i % plates.length]!, relation: i % 2 ? 'Registered owner' : 'Fleet / company' }
    ]
  }
}

const CAPTURE_COUNT = 48

export function mockCaptureResults(): CaptureHit[] {
  return Array.from({ length: CAPTURE_COUNT }, (_, i) => oneCapture(i))
}

export interface VehicleHit {
  id: string
  score: number
  time: string
  device: string
  address: string
  lonLat: [number, number]
  plate: string
  panoramaUrl: string
  vehicleCropUrl: string
  brand: string
  color: string
  country: string
  vehicleType: string
  plateColor: string
  ownerName: string
  ownerIdMask: string
  ownerPhoneMask: string
  relations: { type: string; name: string; desc: string }[]
}

const PLATES = [
  'SH A D12K1',
  'SH B 88X9',
  'SH D 01P2',
  'ZJ A 90Q3',
  'SH C 55L0',
  'SE 3A 777',
  'SH A 66N8',
  'SH E 12R4',
  'SH K 9**2',
  'SH M 0**0'
]
const BRANDS = ['VW', 'BMW', 'Toyota', 'BYD', 'Tesla', 'Audi', 'Honda', 'Mercedes', 'Nissan', 'Ford']
const VEH_TYPES = [
  'Sedan / small passenger',
  'SUV',
  'Van',
  'Truck (light)',
  'Bus / large passenger',
  'Sedan / small passenger',
  'MPV',
  'New energy car'
]
const LPRS = [
  'LPR-Elevated-Exit-2',
  'LPR-Tunnel-Out-7',
  'LPR-Mall-Entry-N',
  'LPR-Ring-A3-West',
  'LPR-CBD-East-1',
  'LPR-Airport-Link-4',
  'LPR-Port-Gate-2',
  'LPR-Suburb-North-9'
]

function oneVehicle(i: number): VehicleHit {
  const p = PLATES[i % PLATES.length]!
  const day = 22 - (i % 6)
  const hour = 5 + (i % 16)
  const min = (i * 3) % 60
  const score = Math.max(71, 99.4 - i * 0.28)
  return {
    id: `VHC-202604${padNum(day, 2)}${padNum(2000 + i, 4)}`,
    score: Math.round(score * 10) / 10,
    time: `2026-04-${padNum(day, 2)} ${padNum(hour, 2)}:${padNum(min, 2)}:01`,
    device: LPRS[i % LPRS.length]!,
    address: `${STREETS[(i + 3) % STREETS.length]!} · camera lane ${(i % 3) + 1}`,
    lonLat: [121.41 + (i % 12) * 0.01, 31.25 + (i % 10) * 0.006],
    plate: p,
    panoramaUrl: MOCK_PANORAMA,
    vehicleCropUrl: MOCK_VEHICLE,
    brand: BRANDS[i % BRANDS.length]!,
    color: ['White', 'Black', 'Silver', 'Red', 'Blue', 'Grey'][i % 6]!,
    country: 'CN',
    vehicleType: VEH_TYPES[i % VEH_TYPES.length]!,
    plateColor: ['Blue', 'Yellow', 'Green (new energy)'][i % 3]!,
    ownerName: ['Chen**', 'Wu**', 'Sun**', 'Xu**', 'Ma**', 'Gao**', 'Ding**'][i % 7]!,
    ownerIdMask: `310***********${padNum(40 + (i % 50), 2)}`,
    ownerPhoneMask: `1${(i % 3) + 3}8****${padNum(1000 + i, 4).slice(0, 4)}`,
    relations: [
      { type: 'Same household', name: 'Chen*Lin', desc: 'Spouse · same address' },
      { type: 'Company', name: `Fleet unit ${(i % 5) + 1}`, desc: 'Vehicle under company' }
    ]
  }
}

const VEHICLE_COUNT = 36

export function mockVehicleResults(): VehicleHit[] {
  return Array.from({ length: VEHICLE_COUNT }, (_, i) => oneVehicle(i))
}

export interface FusionHit {
  id: string
  targetType: 'face' | 'body' | 'vehicle' | 'nonmotor'
  title: string
  score: number
  time: string
  extra: string
  thumb: string
}

const FUS_TITLES: Record<FusionHit['targetType'], string[]> = {
  face: [
    'Face watchlist match',
    'Multi-lib portrait fusion',
    'Stranger high-risk sim.',
    'Access control re-identify',
    'Checkpoint repeat visitor'
  ],
  body: [
    'Body trail correlation',
    'Gait + color fusion',
    'Cross-cam re-ID',
    'Enter-exit pattern',
    'Night infrared body hit'
  ],
  vehicle: [
    'Co-travel (space-time hit)',
    'Plate + window OCR fusion',
    'Fleet convoy',
    'Parking log collision',
    'Toll gate repeat'
  ],
  nonmotor: [
    'Non-motor co-travel',
    'Rider + box feature',
    'Shared-bike same rider',
    'E-scooter plate assist',
    'Delivery same station'
  ]
}

const FUS_ORDER: FusionHit['targetType'][] = ['face', 'body', 'vehicle', 'nonmotor']
const FUS_EXTRAS = ['Rider#', 'Line L4', 'HUB-7', 'N/A', 'Link']

function oneFusion(i: number): FusionHit {
  const targetType = FUS_ORDER[i % 4]!
  const titles = FUS_TITLES[targetType]
  const title = titles[i % titles.length]!
  const thumb =
    targetType === 'vehicle' || targetType === 'nonmotor' ? (i % 2 ? MOCK_PLATE_CLOSE : MOCK_NONMOTOR) : i % 2 ? MOCK_BODY_THUMB : MOCK_FACE_THUMB
  const extraPool = [STREETS[i % STREETS.length]!, PLATES[i % PLATES.length]!, ...FUS_EXTRAS]
  return {
    id: `FUS-${padNum(200 + i, 4)}`,
    targetType,
    title,
    score: Math.round(Math.max(55, 96 - i * 0.4) * 10) / 10,
    time: `2026-04-22 ${padNum(6 + (i % 12), 2)}:${padNum((i * 5) % 60, 2)}:00`,
    extra: extraPool[i % extraPool.length]!,
    thumb
  }
}

const FUSION_COUNT = 44

export function mockFusionResults(): FusionHit[] {
  return Array.from({ length: FUSION_COUNT }, (_, i) => oneFusion(i))
}

export interface ArchiveLibMatch {
  id: string
  libName: string
  matchScore: number
  personId: string
  personLabel?: string
  lastSync?: string
  libSizeLabel?: string
  rank: number
}

const LIB_NAMES = [
  'Resident portrait (Hongkou)',
  'Metro gate fusion',
  'Hotel / lodging (SH)',
  'Enterprise access HR',
  'Elderly care registry',
  'Rental property tenants',
  'University staff',
  'Hospital visitor 90d',
  'Airport long-stay',
  'Railway real-name',
  'Bank VIP (masked)',
  'Social security sample',
  'COVID vax + portrait',
  'Community grid officers',
  'Temporary residence',
  'Driver license (mock)',
  'Court auxiliary list',
  'Nuclear plant zone',
  'Port bonded staff',
  'Free trade zone R&D',
  'Tech park badge',
  'Construction worker IC',
  'Migrant worker reg.',
  'Taxi / ride-hail driver',
  'Delivery platform ID',
  'School parent pass',
  'Sport event volunteer',
  'Expo temp contractor',
  'Concert staff black/white',
  'Marathon runner pack'
]

function oneLibMatch(i: number): ArchiveLibMatch {
  const score = Math.max(61, 99.0 - i * 0.45 - (i % 2) * 0.1)
  return {
    id: `L${100 + i}`,
    libName:
      LIB_NAMES[i % LIB_NAMES.length] +
      (i >= LIB_NAMES.length ? ` (batch ${1 + Math.floor(i / LIB_NAMES.length)})` : ''),
    matchScore: Math.round(score * 10) / 10,
    personId: 'P-ARC-10086',
    personLabel: i % 4 === 0 ? 'Flagged' : 'Standard',
    lastSync: `2026-04-${padNum(20 + (i % 3), 2)} 0${(i % 9) + 1}:00:00`,
    libSizeLabel: `${(120 + (i * 13) % 800).toLocaleString('en-US')}K faces`,
    rank: i + 1
  }
}

const ARCHIVE_LIB_COUNT = 32

export function mockArchiveLibMatches(): ArchiveLibMatch[] {
  return Array.from({ length: ARCHIVE_LIB_COUNT }, (_, i) => oneLibMatch(i))
}

export interface ArchiveDetail {
  personId: string
  realName: string
  idCardMask: string
  trackPoints: { t: string; place: string; lonLat: [number, number] }[]
  lairs: { name: string; count: string; type: 'day' | 'night' }[]
  dayNight: { daytime: string; night: string; peak: string }
  companions: { name: string; relation: string; meetCount: string }[]
  family: { relation: string; name: string }[]
}

const TRACK_LOCS = [
  'Jiangwan Town Metro – Exit 5',
  'Hongkou Football Stadium',
  'Guangzhong Road residential (masked)',
  'Raffles City office tower',
  'North Bund waterfront',
  'Wujiaochang Wanda',
  'Tongji campus east gate',
  'Dalian Road Metro B1',
  'Caohejing tech park',
  'Xujiahui bus hub',
  'Lujiazui footbridge (west)',
  'Century Av. / Xikang',
  'Pudong airport T2 (mock)',
  'Hongqiao rail north square',
  'Minhang Wanda plaza'
]

function buildTrack(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = 15 + (i % 10)
    const h = 5 + (i * 2) % 18
    const m = (i * 7) % 60
    return {
      t: `04-${padNum(d, 2)} ${padNum(h, 2)}:${padNum(m, 2)}`,
      place: `${TRACK_LOCS[i % TRACK_LOCS.length]} · rec #${i + 1}`,
      lonLat: [121.44 + (i % 9) * 0.01, 31.24 + (i % 7) * 0.005] as [number, number]
    }
  })
}

function buildLairs(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const isDay = i % 3 !== 0
    return {
      name: isDay
        ? `Day cluster: ${STREETS[i % STREETS.length]} (tower ${(i % 4) + 1})`
        : `Night lair: Lane ${(i % 5) + 1} (masked)`,
      count: `${8 + (i * 3) % 50} hits / 30d · conf ${(0.7 + (i % 20) * 0.01).toFixed(2)}`,
      type: (isDay ? 'day' : 'night') as 'day' | 'night'
    }
  })
}

const COMPANION_NAMES = [
  'Li*',
  'Zhang*Tong',
  'Wang*Ke',
  'Zhou*Yi',
  'Sun*Bin',
  'Ma*Hao',
  'Feng*',
  'Ding*Qiang',
  'Cao*',
  'Jiang*Ming'
]
const COMP_REL = [
  'Same household',
  'Colleague (HR)',
  'Project contractor',
  'Gym same floor',
  'Neighbour 6F',
  'School pickup',
  'Same ride-hail',
  'Court witness pool',
  'Delivery co-route',
  'Night shift canteen'
]

function buildCompanions(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    name: COMPANION_NAMES[i % COMPANION_NAMES.length] + (i >= 10 ? ` (${i})` : ''),
    relation: COMP_REL[i % COMP_REL.length]!,
    meetCount: `${1 + (i % 8)} / last 7d; ${(i * 2) % 20}d window`
  }))
}

export function mockArchiveDetail(): ArchiveDetail {
  return {
    personId: 'P-ARC-10086',
    realName: 'Zhao*Wei',
    idCardMask: '310110**********33',
    trackPoints: buildTrack(28),
    lairs: buildLairs(12),
    dayNight: {
      daytime: 'Mall / office clusters, transit hubs',
      night: 'Mainly residential, two night-work sites',
      peak: '07:00–09:00, 12:00–13:00, 18:30–21:00'
    },
    companions: buildCompanions(16),
    family: [
      { relation: 'Wife', name: 'Li*' },
      { relation: 'Son', name: 'Zhao*Tong' },
      { relation: 'Father', name: 'Zhao*Shan' }
    ]
  }
}

export interface VehicleArchiveData {
  plate: string
  owner: string
  ownerMask: string
  lairs: { name: string; count: string; weight: number }[]
  trackPoints: { t: string; place: string; lonLat: [number, number] }[]
  relations: { type: string; name: string; note: string }[]
  passStats?: { label: string; value: string }[]
}

const VA_TRACK = [
  'Middle Ring on-ramp',
  'Songhu Road express',
  'Hailun Road curve',
  'Riverside Av. (slow traffic)',
  'Office tower garage B2',
  'Hypermarket car park 3F',
  'Gas station (eastbound)',
  'Primary school pick-up line',
  'Container terminal approach',
  'High-speed link merge',
  'Toll station ETC lane',
  'Hospital emergency loop',
  'Stadium event parking P4',
  'Suburb warehouse gate',
  'Logistics park ramp',
  'Cross-border bridge (mock)',
  'Night market side street',
  'Metro park-and-ride',
  'Ferry port queue',
  'Tech campus visitor gate'
]

const LAIR_SEEDS = [
  'Jingan underground car park',
  'Yangpu office B2',
  'Putuo big-box lot',
  'Pudong residential lane',
  'Changning hospital deck',
  'Minhang P+R east',
  'Baoshan port zone',
  'Fengxian sub-center',
  'Qingpu logistics hub',
  'Songjiang campus outer',
  'Jiading industrial ring',
  'Jinshan chemical fence'
]

function buildVehicleTrack(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = 12 + (i % 12)
    const h = 4 + (i * 3) % 20
    const m = (i * 5) % 60
    return {
      t: `04-${padNum(d, 2)} ${padNum(h, 2)}:${padNum(m, 2)}`,
      place: `${VA_TRACK[i % VA_TRACK.length]} #${i + 1} (LPR-CHK-${100 + (i % 50)})`,
      lonLat: [121.4 + (i % 11) * 0.01, 31.22 + (i % 8) * 0.006] as [number, number]
    }
  })
}

function buildVehicleLairs(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    name: `${LAIR_SEEDS[i % LAIR_SEEDS.length]} (rank ${i + 1})`,
    count: `Stays: ${5 + (i * 2) % 60}; peak ${(i % 2) + 1} slot`,
    weight: 48 - i * 1.2 + (i % 3)
  }))
}

const REL_EXTRAS = [
  { type: 'Same household', name: 'Chen*Lin', note: 'Spouse' },
  { type: 'Fleet', name: 'SH A 9**00', note: 'Company car' },
  { type: 'Leasing', name: 'Rental Co. 08', note: 'Long lease' },
  { type: 'Dealer', name: '4S-Hub North', note: 'Service log' },
  { type: 'Co-owner', name: 'Xu*', note: 'Joint reg. 2024' },
  { type: 'Impound (released)', name: 'Lot-7', note: '2025-01' },
  { type: 'Insurance', name: 'Policy #908**', note: 'Full coverage' },
  { type: 'Toll plan', name: 'ETC-AUTO', note: 'Autopay' }
]

export function mockVehicleArchive(): VehicleArchiveData {
  return {
    plate: 'SH A D12K1',
    owner: 'Chen**',
    ownerMask: '310***********56',
    lairs: buildVehicleLairs(12),
    trackPoints: buildVehicleTrack(32),
    relations: REL_EXTRAS,
    passStats: [
      { label: '7d / unique cameras', value: '42' },
      { label: '30d / total hits', value: '386' },
      { label: 'Avg dwell (min)', value: '6.2' }
    ]
  }
}

export const MOCK_TOTALS = {
  capture: CAPTURE_COUNT,
  vehicle: VEHICLE_COUNT,
  fusion: FUSION_COUNT,
  archiveLib: ARCHIVE_LIB_COUNT
} as const
