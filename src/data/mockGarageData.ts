import { Vehicle, Owner, GarageEvent, CommunityPost, PostComment, SpotlightConfig, CommunityPoll } from '../types/garage';

export const GASCANCO_ADMIN_USER: Owner = {
  id: 'user-gascanco-admin',
  name: 'GASCANCO',
  handle: 'gascanco',
  email: 'Gascanco@gmail.com',
  role: 'admin',
  isAdmin: true,
  avatar: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80',
  coverPhoto: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=80',
  location: 'Costa Mesa, CA',
  bio: 'Official GASCANCO Administrator Account. Curating community builds, track events, and automotive culture.',
  memberSince: 'January 2020',
  shopifyCustomerId: 'SH-ADMIN-01',
  isFollowing: false,
};

export const CURRENT_MOCK_USER: Owner = GASCANCO_ADMIN_USER;

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-skyline-r34',
    year: 1999,
    make: 'Nissan',
    model: 'Skyline GT-R',
    trim: 'V-Spec',
    chassis: 'BNR34',
    nickname: 'Midnight Blue Ghost',
    color: 'Bayside Blue (TV2)',
    engine: '2.6L Twin-Turbo Inline-6 (RB26DETT)',
    transmission: 'Getrag 6-Speed Manual',
    drivetrain: 'AWD',
    horsepower: '585 whp @ 1.5 bar',
    primaryImage: '/src/assets/images/skyline_r34_gtr_1791130465206.jpg',
    galleryImages: [
      '/src/assets/images/skyline_r34_gtr_1791130465206.jpg'
    ],
    owner: {
      id: 'user-kazuki',
      name: 'Kazuki Tanaka',
      handle: 'Kazuki Tanaka',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      location: 'Costa Mesa, CA',
      bio: 'Lifelong RB fanatic. Imported this V-Spec under 25-year rule. Pure early-2000s Daikoku Futo street inspiration.',
      memberSince: 'January 2022',
      shopifyCustomerId: 'SH-102941',
      isFollowing: false,
    },
    category: 'Tuner & JDM',
    buildStatus: 'Track Dedicated',
    featured: true,
    viewsCount: 4820,
    likesCount: 642,
    createdAt: '2024-03-12',
    updatedAt: '2024-09-28',
    visibility: 'public',
    modifications: [
      {
        id: 'mod-1',
        category: 'Engine & Performance',
        partName: 'Twin GT-SS Turbochargers & Manifolds',
        brand: 'HKS',
        description: 'Responsive ceramic ball-bearing turbos tuned for snappy boost onset at 3,200 RPM.',
        installedDate: 'May 2024'
      },
      {
        id: 'mod-2',
        category: 'Engine & Performance',
        partName: 'Forged Piston & Con-Rod Assembly',
        brand: 'Tomei',
        description: 'Tomei 86.5mm forged pistons with balanced H-beam rods.'
      },
      {
        id: 'mod-3',
        category: 'Exhaust',
        partName: 'Super Turbo Muffler Titanium Cat-Back',
        brand: 'HKS',
        description: '90mm titanium piping with burnt tips. Deep, non-raspy straight-six roar.'
      },
      {
        id: 'mod-4',
        category: 'Wheels & Tires',
        partName: 'TE37 Saga S-Plus 18x10.5 +15 (Bronze)',
        brand: 'Volk Racing / Rays',
        description: 'Wrapped in Bridgestone Potenza RE-71RS 275/35R18.'
      },
      {
        id: 'mod-5',
        category: 'Suspension & Chassis',
        partName: 'Ohlins Road & Track DFV Coilovers',
        brand: 'Ohlins',
        description: 'Corner balanced at 3,420 lbs with 54/46 weight distribution.'
      },
      {
        id: 'mod-6',
        category: 'Brakes',
        partName: '6-Piston 355mm Front Big Brake Kit',
        brand: 'Brembo Racing',
        description: 'Endless ME20 endurance brake pads with stainless braided lines.'
      },
      {
        id: 'mod-7',
        category: 'Exterior & Aero',
        partName: 'Z-Tune Style Carbon Front Fenders & Bumper',
        brand: 'Nismo Omori Factory',
        description: 'Vented carbon arches with integrated aero carnards.'
      },
      {
        id: 'mod-8',
        category: 'Interior',
        partName: 'MFD Screen Upgrade & Alcantara Wheel',
        brand: 'Nismo',
        description: 'Replaced aged factory LCD with modern high-res CAN-bus telemetry display.'
      }
    ],
    buildUpdates: [
      {
        id: 'upd-1',
        vehicleId: 'veh-skyline-r34',
        title: 'Shakedown Session at Buttonwillow CW13',
        date: 'September 28, 2024',
        content: 'Finally got the R34 out to Buttonwillow for the first shakedown on the new Ohlins DFVs and 275 Potenza RE-71RS. Water temp held steady at 88C even during the 20-minute afternoon session thanks to the HKS oil cooler ducting. Clocked a 1:54.2 on low boost (1.1 bar). Next step is dialing in rear rebound.',
        images: [
          '/src/assets/images/skyline_r34_gtr_1791130465206.jpg'
        ],
        likesCount: 148
      },
      {
        id: 'upd-2',
        vehicleId: 'veh-skyline-r34',
        title: 'Installed Nismo Titanium Strut Brace & Plumbing',
        date: 'July 14, 2024',
        content: 'Cleaned up the engine bay harness and installed the ultra-rare Nismo hollow titanium front tower bar. Also refreshed all fuel lines with PTFE braided hose and -6AN fittings.',
        images: [
          '/src/assets/images/skyline_r34_gtr_1791130465206.jpg'
        ],
        likesCount: 96
      }
    ],
    crewAndSponsors: [
      {
        id: 'crew-1',
        name: 'Apex Speedworks',
        role: 'Twin-Turbo & Dyno Calibration',
        handle: 'apex_speedworks',
        type: 'shop',
        verified: true
      },
      {
        id: 'crew-2',
        name: 'Craftsman Race Works',
        role: 'Chassis & Custom Roll Cage',
        handle: 'craftsman_raceworks',
        type: 'crew',
        verified: true
      },
      {
        id: 'crew-3',
        name: 'Volk Racing / Rays Japan',
        role: 'Wheel & Aero Sponsor',
        url: 'https://rayswheels.co.jp',
        type: 'sponsor',
        verified: true
      },
      {
        id: 'crew-4',
        name: 'Midnight Shutter Co.',
        role: 'Lead Track Photographer',
        handle: 'midnight_shutter',
        type: 'crew'
      }
    ]
  },
  {
    id: 'veh-civic-si',
    year: 1991,
    make: 'Honda',
    model: 'Civic',
    trim: 'Si Hatchback (EF9)',
    nickname: 'The Little Green Demon',
    color: 'Tahitian Green Pearl',
    engine: '1.8L DOHC VTEC (B18C5 Integra Type R)',
    transmission: 'S80 5-Speed Manual w/ Helical LSD',
    drivetrain: 'FWD',
    horsepower: '215 whp @ 8,400 RPM',
    primaryImage: '/src/assets/images/civic_si_ef9_1791130474543.jpg',
    galleryImages: [
      '/src/assets/images/civic_si_ef9_1791130474543.jpg'
    ],
    owner: CURRENT_MOCK_USER,
    category: 'Tuner & JDM',
    buildStatus: 'Daily Driver',
    featured: false,
    viewsCount: 3120,
    likesCount: 428,
    createdAt: '2023-08-19',
    updatedAt: '2024-10-01',
    visibility: 'public',
    modifications: [
      {
        id: 'mod-civ-1',
        category: 'Engine & Performance',
        partName: 'B18C5 Integra Type R Crate Engine Swap',
        brand: 'Honda OEM / Spoon Sports',
        description: 'Refreshed with Spoon balanced valve train, Toda spec-B cams, and Skunk2 Ultra intake manifold.',
        installedDate: 'August 2023'
      },
      {
        id: 'mod-civ-2',
        category: 'Exhaust',
        partName: 'Street 4-2-1 Header & Spoon N1 Exhaust',
        brand: 'Spoon Sports',
        description: 'Straight 60mm stainless exhaust with classic slash-cut single tip. Screams at crossover.'
      },
      {
        id: 'mod-civ-3',
        category: 'Wheels & Tires',
        partName: 'Mugen RNR 15x6.5 +38 in Gunmetal',
        brand: 'Mugen',
        description: 'Mounted with Yokohama Advan Neova AD08R 205/50R15.'
      },
      {
        id: 'mod-civ-4',
        category: 'Suspension & Chassis',
        partName: 'Koni Yellow Shocks & Ground Control Sleeves',
        brand: 'Ground Control',
        description: 'Eibach springs (550 lb/in front, 600 lb/in rear). Hardrace spherical bushings throughout.'
      },
      {
        id: 'mod-civ-5',
        category: 'Brakes',
        partName: 'Spoon Twin-Block 4-Piston Calipers',
        brand: 'Spoon Sports',
        description: 'Fastbrakes 280mm 2-piece slotted rotors with Hawk DTC-60 track pads.'
      },
      {
        id: 'mod-civ-6',
        category: 'Interior',
        partName: 'Recaro SR3 Confetti Bucket Seats',
        brand: 'Recaro',
        description: 'Period-correct 90s OEM Recaro seats mounted on low-position Bride rails.'
      }
    ],
    buildUpdates: [
      {
        id: 'upd-civ-1',
        vehicleId: 'veh-civic-si',
        title: 'Hondata S300 V3 Dyno Tune & Road Test',
        date: 'October 01, 2024',
        content: 'Spent 4 hours on the Dynojet at Speed Factory in Tacoma. Smoothed out the VTEC crossover dip at 5,400 RPM and picked up 11 wheel horsepower in the mid-range. Total peak came in at 214.8 whp on 92 pump gas with safe AFRs across the entire tach. Driving this featherweight (2,120 lbs) to work with a huge grin every morning.',
        images: [
          '/src/assets/images/civic_si_ef9_1791130474543.jpg'
        ],
        likesCount: 89
      },
      {
        id: 'upd-civ-2',
        vehicleId: 'veh-civic-si',
        title: 'Restored OEM Sunroof Cassette & Fresh Weatherstripping',
        date: 'May 18, 2024',
        content: 'Drop the headliner, cleaned out 30 years of rusted drain tubes, and coated the inner sunroof frame with POR-15 rust inhibitor. No more rainy Pacific Northwest leaks!',
        images: [
          '/src/assets/images/civic_si_ef9_1791130474543.jpg'
        ],
        likesCount: 62
      }
    ]
  },
  {
    id: 'veh-tacoma-trd',
    year: 2021,
    make: 'Toyota',
    model: 'Tacoma',
    trim: 'TRD Pro Double Cab',
    nickname: 'Cascade Crawler',
    color: 'Cement Grey',
    engine: '3.5L V6 w/ Magnuson TVS1900 Supercharger',
    transmission: '6-Speed Manual',
    drivetrain: '4WD',
    horsepower: '370 hp / 330 lb-ft torque',
    primaryImage: '/src/assets/images/tacoma_trd_pro_1791130486225.jpg',
    galleryImages: [
      '/src/assets/images/tacoma_trd_pro_1791130486225.jpg'
    ],
    owner: CURRENT_MOCK_USER,
    category: 'Overland & 4x4',
    buildStatus: 'Overland Rig',
    featured: false,
    viewsCount: 2840,
    likesCount: 310,
    createdAt: '2023-11-04',
    updatedAt: '2024-09-15',
    visibility: 'public',
    modifications: [
      {
        id: 'mod-tac-1',
        category: 'Engine & Performance',
        partName: 'TVS1900 Roots Supercharger Kit',
        brand: 'Magnuson',
        description: 'Complete with intercooler and CARB calibrated ECU flash. Massive torque boost for highway mountain passes while fully loaded.'
      },
      {
        id: 'mod-tac-2',
        category: 'Suspension & Chassis',
        partName: '3" IMS Remote Reservoir Extended Travel Lift',
        brand: 'Dobinsons Spring & Suspension',
        description: 'Heavy constant load rear leaf pack (+800 lbs capacity) and billet upper control arms.'
      },
      {
        id: 'mod-tac-3',
        category: 'Wheels & Tires',
        partName: 'Method 701 Bead Grip 17x8.5 (Matte Black)',
        brand: 'Method Race Wheels',
        description: 'Wrapped in Falken Wildpeak A/T4W 285/75R17 (33.8" overall diameter).'
      },
      {
        id: 'mod-tac-4',
        category: 'Exterior & Aero',
        partName: 'Classic Hybrid Front Winch Bumper & Skid Plates',
        brand: 'CBI Offroad Fab',
        description: 'Full 3/16" steel armor with Warn VR EVO 10-S synthetic rope winch.'
      },
      {
        id: 'mod-tac-5',
        category: 'Exterior & Aero',
        partName: 'Contour Aluminum Truck Bed Canopy',
        brand: 'Alu-Cab',
        description: 'Integrated dual gullwing side doors, load bars, and 200W solar panel.'
      },
      {
        id: 'mod-tac-6',
        category: 'Electronics & Audio',
        partName: 'BantamX Dual Battery Power Distribution',
        brand: 'sPOD',
        description: 'Bluetooth touchscreen controlling Baja Designs Squadron Pro ditch lights and fridge.'
      }
    ],
    buildUpdates: [
      {
        id: 'upd-tac-1',
        vehicleId: 'veh-tacoma-trd',
        title: '5 Days along the Oregon Backcountry Discovery Route',
        date: 'September 15, 2024',
        content: 'Pushed through Section 3 and 4 of the OBDR. Airing down to 14 PSI on the Method Bead Grips transformed the ride through deep volcanic washboard and lava rock trails. The Alu-Cab canopy kitchen setup made wilderness base camp effortless.',
        images: [
          '/src/assets/images/tacoma_trd_pro_1791130486225.jpg'
        ],
        likesCount: 112
      }
    ]
  },
  {
    id: 'veh-ford-f100',
    year: 1974,
    make: 'Ford',
    model: 'F-100',
    trim: 'Custom Stepside Rat Rod',
    nickname: 'The Rust Rooster',
    color: 'Original Patina Red / Satin Clear',
    engine: '5.0L Gen 3 Coyote V8 w/ Twin 62mm Turbos',
    transmission: 'Tremec T-56 Magnum 6-Speed Manual',
    drivetrain: 'RWD',
    horsepower: '740 rwhp @ 12 psi',
    primaryImage: '/src/assets/images/ford_f100_ratrod_1791130497932.jpg',
    galleryImages: [
      '/src/assets/images/ford_f100_ratrod_1791130497932.jpg'
    ],
    owner: {
      id: 'user-hank',
      name: 'Hank Vance',
      handle: 'Hank Vance',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      location: 'Fort Worth, TX',
      bio: 'Old school fabricator. Barn finds, cut torches, high boost, and zero fake fiberglass.',
      memberSince: 'March 2021',
      shopifyCustomerId: 'SH-409184',
      isFollowing: false,
    },
    category: 'Muscle & Rat Rod',
    buildStatus: 'Show / Weekend',
    featured: false,
    viewsCount: 5210,
    likesCount: 890,
    createdAt: '2023-01-10',
    updatedAt: '2024-08-20',
    visibility: 'public',
    modifications: [
      {
        id: 'mod-f1-1',
        category: 'Engine & Performance',
        partName: 'Twin Turbo 5.0L Coyote Crate Engine',
        brand: 'Ford Performance / BorgWarner',
        description: 'Dual SX-E 62mm turbos plumbed with pie-cut raw titanium piping and air-to-water intercooler.'
      },
      {
        id: 'mod-f1-2',
        category: 'Suspension & Chassis',
        partName: 'Crown Victoria Front Clip Swap & Air Ride',
        brand: 'AccuAir / Custom Tubular',
        description: 'Tubular crossmember, rack and pinion steering, and e-Level air management for ground laydown.'
      },
      {
        id: 'mod-f1-3',
        category: 'Wheels & Tires',
        partName: 'Detroit Steel Ambassador 20x9 front, 20x11 rear',
        brand: 'Detroit Steel Wheels',
        description: 'Finished in distressed matte black with bullet lug nuts and Mickey Thompson street radials.'
      },
      {
        id: 'mod-f1-4',
        category: 'Brakes',
        partName: 'Forged Dynalite 4-Piston 13" Brakes',
        brand: 'Wilwood Engineering',
        description: 'Drilled and slotted rotors with manual tandem master cylinder.'
      },
      {
        id: 'mod-f1-5',
        category: 'Interior',
        partName: 'Hand-Riveted Aluminum Bomber Seats',
        brand: 'Custom Fab',
        description: 'Distressed saddle leather seat pads, 4-point latch harnesses, and a brass knuckle 6-speed shifter.'
      }
    ],
    buildUpdates: [
      {
        id: 'upd-f1-1',
        vehicleId: 'veh-ford-f100',
        title: 'Texas Mile Burnout & Dyno Pulls',
        date: 'August 20, 2024',
        content: 'Brought the Rooster out to the shop barbecue. Made 742 horsepower on 12 pounds of boost through the Tremec 6-speed. The sound of twin wastegates dumping through the passenger fender will never get old.',
        images: [
          '/src/assets/images/ford_f100_ratrod_1791130497932.jpg'
        ],
        likesCount: 245
      }
    ],
    crewAndSponsors: [
      {
        id: 'crew-f1-1',
        name: 'Iron & Rust Fab Lab',
        role: 'Chassis Chop & Custom Z-Frame',
        handle: 'ironandrust_fab',
        type: 'crew',
        verified: true
      },
      {
        id: 'crew-f1-2',
        name: 'Vintage V8 Speed Supply',
        role: '428 FE Big Block Assembly & Dyno',
        handle: 'vintage_v8_supply',
        type: 'shop',
        verified: true
      },
      {
        id: 'crew-f1-3',
        name: 'Pinstriping by Bones',
        role: 'Hand-Laid 1-Shot Enamel Artwork',
        handle: 'bones_pinstripe',
        type: 'crew'
      }
    ]
  },
  {
    id: 'veh-subaru-wrx',
    year: 2004,
    make: 'Subaru',
    model: 'Impreza WRX STI',
    trim: 'Blobeye',
    nickname: 'Blue Boxer',
    color: 'World Rally Blue Pearl (02C)',
    engine: '2.5L Turbo Flat-4 (EJ257)',
    transmission: '6-Speed Manual w/ DCCD',
    drivetrain: 'AWD',
    horsepower: '420 whp @ 22 psi',
    primaryImage: '/src/assets/images/subaru_wrx_sti_1791130523919.jpg',
    galleryImages: [
      '/src/assets/images/subaru_wrx_sti_1791130523919.jpg'
    ],
    owner: {
      id: 'user-sam',
      name: 'Sam Delgado',
      handle: 'Sam Delgado',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
      location: 'Salt Lake City, UT',
      bio: 'Canyon carver, rally enthusiast, and winter snow drifter in the Wasatch Mountains.',
      memberSince: 'July 2023',
      shopifyCustomerId: 'SH-310842',
      isFollowing: false,
    },
    category: 'Tuner & JDM',
    buildStatus: 'Daily Driver',
    featured: false,
    viewsCount: 2450,
    likesCount: 380,
    createdAt: '2023-09-02',
    updatedAt: '2024-09-10',
    visibility: 'public',
    modifications: [
      {
        id: 'mod-sub-1',
        category: 'Engine & Performance',
        partName: 'Dominator 1.5XTR Ball Bearing Turbo',
        brand: 'Blouch Performance',
        description: 'Tuned with Cobb Accessport on E85 flex-fuel setup.'
      },
      {
        id: 'mod-sub-2',
        category: 'Exhaust',
        partName: 'Q300 Stainless 3" Turboback',
        brand: 'Invidia',
        description: 'Signature deep rumble without drone on highway commutes.'
      },
      {
        id: 'mod-sub-3',
        category: 'Wheels & Tires',
        partName: 'RPF1 17x9 +35 (Gold)',
        brand: 'Enkei',
        description: 'Classic rally tribute combo wrapped in Michelin Pilot Sport 4S.'
      },
      {
        id: 'mod-sub-4',
        category: 'Suspension & Chassis',
        partName: 'Tar-Spec 24mm Front & Rear Sway Bars',
        brand: 'Whiteline',
        description: 'Anti-lift kit and heavy-duty endlinks eliminating understeer.'
      }
    ],
    buildUpdates: [
      {
        id: 'upd-sub-1',
        vehicleId: 'veh-subaru-wrx',
        title: 'Guardsman Pass Canyon Run at Sunrise',
        date: 'September 10, 2024',
        content: 'Zero traffic, crisp 45-degree morning air, and the EJ257 making all the right turbo flutter noises. The differential in manual lock mode gives incredible exit traction out of tight hairpins.',
        images: [
          '/src/assets/images/subaru_wrx_sti_1791130523919.jpg'
        ],
        likesCount: 77
      }
    ]
  },
  {
    id: 'veh-porsche-gt3',
    year: 2018,
    make: 'Porsche',
    model: '911',
    trim: 'GT3 Touring (991.2)',
    nickname: 'Weissach Spec',
    color: 'Chalk (Kreide)',
    engine: '4.0L Naturally Aspirated Flat-6 (9,000 RPM)',
    transmission: '6-Speed GT Sports Manual',
    drivetrain: 'RWD',
    horsepower: '520 hp @ 8,800 RPM',
    primaryImage: '/src/assets/images/porsche_911_gt3_1791130508631.jpg',
    galleryImages: [
      '/src/assets/images/porsche_911_gt3_1791130508631.jpg'
    ],
    owner: {
      id: 'user-elena',
      name: 'Elena Rostova',
      handle: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      location: 'Malibu, CA',
      bio: 'Angeles Crest Highway weekend runner. NA purist and manual gearbox advocate.',
      memberSince: 'November 2021',
      shopifyCustomerId: 'SH-924102',
      isFollowing: false,
    },
    category: 'Euro & Track',
    buildStatus: 'Track Dedicated',
    featured: false,
    viewsCount: 6810,
    likesCount: 940,
    createdAt: '2023-04-18',
    updatedAt: '2024-09-22',
    visibility: 'public',
    modifications: [
      {
        id: 'mod-por-1',
        category: 'Exhaust',
        partName: 'Street Inconel Race Headers & Valved Muffler',
        brand: 'Dundon Motorsports',
        description: 'Weight reduction of 28 lbs, plus that spine-tingling screaming 9,000 RPM GT3 wail.'
      },
      {
        id: 'mod-por-2',
        category: 'Wheels & Tires',
        partName: 'BBS FI-R Forged Monobloc (Platinum Silver)',
        brand: 'BBS Wheels',
        description: '20x9 front (17.4 lbs) and 20x12 rear (19.8 lbs). Unsprung weight shaved significantly.'
      },
      {
        id: 'mod-por-3',
        category: 'Suspension & Chassis',
        partName: 'Solid Monoball Bushings & RSS Billet Links',
        brand: 'RSS / Manthey Racing',
        description: 'Crisp, telepathic steering feedback without rubber deflection under high-G braking.'
      },
      {
        id: 'mod-por-4',
        category: 'Interior',
        partName: 'Half Cage & Houndstooth Bucket Inserts',
        brand: 'GMG Racing / Custom Upholstery',
        description: 'Satin black chromoly roll bar paired with vintage Pepita wool seat cushions.'
      }
    ],
    buildUpdates: [
      {
        id: 'upd-por-1',
        vehicleId: 'veh-porsche-gt3',
        title: 'Laguna Seca Track Day with PCA Golden Gate',
        date: 'September 22, 2024',
        content: 'Hit Laguna Seca under 92dB sound restrictions with the Dundon muffled exhaust tips. Dropped into the Corkscrew lap after lap. The manual 6-speed auto-blip function is phenomenal, but heel-toeing it manually is where the real joy lives.',
        images: [
          '/src/assets/images/porsche_911_gt3_1791130508631.jpg'
        ],
        likesCount: 198
      }
    ]
  },
  {
    id: 'veh-mazda-rx7',
    year: 1993,
    make: 'Mazda',
    model: 'RX-7',
    trim: 'FD3S Series 6',
    nickname: 'Apex Seal Survivor',
    color: 'Vintage Red (NU)',
    engine: '1.3L Twin-Rotor (13B-REW Single Turbo)',
    transmission: '5-Speed Manual',
    drivetrain: 'RWD',
    horsepower: '460 whp @ 17 psi',
    primaryImage: '/src/assets/images/mazda_rx7_fd_1791130533675.jpg',
    galleryImages: [
      '/src/assets/images/mazda_rx7_fd_1791130533675.jpg'
    ],
    owner: {
      id: 'user-derek',
      name: 'Derek Wu',
      handle: 'Derek Wu',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      location: 'Austin, TX',
      bio: 'Wankel engine mechanic. Premixing 2-stroke in the gas tank since 2015.',
      memberSince: 'September 2022',
      shopifyCustomerId: 'SH-612984',
      isFollowing: false,
    },
    category: 'Tuner & JDM',
    buildStatus: 'Under Construction',
    featured: false,
    viewsCount: 3790,
    likesCount: 512,
    createdAt: '2023-06-25',
    updatedAt: '2024-09-05',
    visibility: 'public',
    modifications: [
      {
        id: 'mod-rx-1',
        category: 'Engine & Performance',
        partName: 'BorgWarner EFR 8374 Turbo Conversion',
        brand: 'Turblown Engineering',
        description: 'V-band tubular manifold with Turbosmart 50mm external wastegate and large front-mount intercooler.'
      },
      {
        id: 'mod-rx-2',
        category: 'Exterior & Aero',
        partName: 'Facer N1 Front Bumper & Rear Diffuser',
        brand: 'RE-Amemiya',
        description: 'Iconic Japanese rotary tuning aero package with carbon undertray.'
      },
      {
        id: 'mod-rx-3',
        category: 'Wheels & Tires',
        partName: 'Advan Racing GT Beyond 18x9.5 +22 / 18x10.5 +15',
        brand: 'Yokohama Advan',
        description: 'Machining and racing hyper black finish on Toyo Proxes R888R.'
      }
    ],
    buildUpdates: [
      {
        id: 'upd-rx-1',
        vehicleId: 'veh-mazda-rx7',
        title: 'Rewired Haltech Elite 1500 with Custom Mil-Spec Loom',
        date: 'September 05, 2024',
        content: 'Tore out the 30-year-old crusty factory engine harness and built a brand-new raychem heatshrink loom with Deutsch autosport quick-disconnect connectors. Cleaned up sensor ground noise completely.',
        images: [
          '/src/assets/images/mazda_rx7_fd_1791130533675.jpg'
        ],
        likesCount: 88
      }
    ]
  },
  {
    id: 'veh-jeep-xj',
    year: 1996,
    make: 'Jeep',
    model: 'Cherokee (XJ)',
    trim: 'Sport 4x4',
    nickname: 'The Brick',
    color: 'Forest Green Pearl',
    engine: '4.0L High Output Inline-6',
    transmission: 'AX-15 5-Speed Manual',
    drivetrain: '4WD',
    horsepower: '190 hp / 225 lb-ft',
    primaryImage: '/src/assets/images/jeep_cherokee_xj_1791130559160.jpg',
    galleryImages: [
      '/src/assets/images/jeep_cherokee_xj_1791130559160.jpg'
    ],
    owner: {
      id: 'user-travis',
      name: 'Travis Cole',
      handle: 'Travis Cole',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
      location: 'Moab, UT',
      bio: 'Rock crawling in Utah. The 4.0L inline six will outlive humanity.',
      memberSince: 'February 2023',
      shopifyCustomerId: 'SH-519230',
      isFollowing: false,
    },
    category: 'Overland & 4x4',
    buildStatus: 'Daily Driver',
    featured: false,
    viewsCount: 1980,
    likesCount: 295,
    createdAt: '2023-10-14',
    updatedAt: '2024-07-30',
    visibility: 'public',
    modifications: [
      {
        id: 'mod-xj-1',
        category: 'Suspension & Chassis',
        partName: '4.5" Super-Flex Short Arm Lift Kit',
        brand: 'Rubicon Express',
        description: 'Fox 2.0 performance series shocks and HD slip-yoke eliminator.'
      },
      {
        id: 'mod-xj-2',
        category: 'Wheels & Tires',
        partName: 'Cragar Soft 8 Steel Wheels 15x8',
        brand: 'Cragar',
        description: 'Fitted with 33x12.50R15 BFGoodrich Mud-Terrain KM3s.'
      },
      {
        id: 'mod-xj-3',
        category: 'Exterior & Aero',
        partName: 'Vanguard Winch Bumper & Rock Sliders',
        brand: 'JCR Offroad',
        description: 'Heavy duty unibody stiffeners welded from front bumper horns to rear shackle pockets.'
      }
    ],
    buildUpdates: [
      {
        id: 'upd-xj-1',
        vehicleId: 'veh-jeep-xj',
        title: 'Hell\'s Revenge Trail Run with Zero Mechanicals',
        date: 'July 30, 2024',
        content: 'Walked right up the Escalator obstacle. Detroit locker engaged smoothly and the 4.0L purred like a sewing machine.',
        images: [
          '/src/assets/images/jeep_cherokee_xj_1791130559160.jpg'
        ],
        likesCount: 94
      }
    ]
  },
  {
    id: 'veh-bmw-e30',
    year: 1988,
    make: 'BMW',
    model: 'M3',
    trim: 'E30 Group A Homologation',
    nickname: 'Box Flare Icon',
    color: 'Alpine White II',
    engine: '2.3L Naturally Aspirated S14B23',
    transmission: 'Getrag 265 Dogleg 5-Speed',
    drivetrain: 'RWD',
    horsepower: '240 hp @ 7,800 RPM',
    primaryImage: '/src/assets/images/bmw_m3_e30_1791130544159.jpg',
    galleryImages: [
      '/src/assets/images/bmw_m3_e30_1791130544159.jpg'
    ],
    owner: {
      id: 'user-bavarian',
      name: 'Marcus Lindqvist',
      handle: 'Marcus Lindqvist',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
      location: 'Seattle, WA',
      bio: 'DTM historic racing enthusiast. Keeping the high-revving S14 singing on Pacific Northwest coastal backroads.',
      memberSince: 'May 2022',
      shopifyCustomerId: 'SH-772910',
      isFollowing: false,
    },
    category: 'Euro & Track',
    buildStatus: 'Show / Weekend',
    featured: false,
    viewsCount: 4410,
    likesCount: 680,
    createdAt: '2023-05-11',
    updatedAt: '2024-09-18',
    visibility: 'public',
    modifications: [
      {
        id: 'mod-e30-1',
        category: 'Engine & Performance',
        partName: 'Carbon Fiber Airbox & Alpha-N Tune',
        brand: 'MaxxAlpha / S14 Motorsport',
        description: 'Deleted restrictive AFM flapper door. Glorious induction bark that echoes off canyon walls.'
      },
      {
        id: 'mod-e30-2',
        category: 'Wheels & Tires',
        partName: 'BBS RS 16x8 Front / 16x9 Rear 3-Piece Mesh',
        brand: 'BBS Wheels',
        description: 'Polished step lips with gold hardware.'
      },
      {
        id: 'mod-e30-3',
        category: 'Suspension & Chassis',
        partName: 'Track / School Coilovers & Camber Plates',
        brand: 'Ground Control / Koni',
        description: 'Custom valved Koni inserts in shortened strut housings.'
      }
    ],
    buildUpdates: [
      {
        id: 'upd-e30-1',
        vehicleId: 'veh-bmw-e30',
        title: 'Valve Adjustment & Shims Checked at 145,000 Miles',
        date: 'September 18, 2024',
        content: 'Pulled the magnesium cam cover and checked lash on all 16 valves with the micrometer. Four exhaust valves needed minor shim adjustments. Cam lobes look like mirrors.',
        images: [
          '/src/assets/images/bmw_m3_e30_1791130544159.jpg'
        ],
        likesCount: 130
      }
    ]
  },
  {
    id: 'veh-crf450r-moto',
    year: 2023,
    make: 'Honda',
    model: 'CRF450R',
    trim: 'Supermoto & Track Rig',
    nickname: 'The Rip Stick',
    color: 'Matte Anthracite & Fluorescent Orange',
    engine: '449cc Unicam 4-Valve Single',
    transmission: '5-Speed Manual w/ Slipper Clutch',
    drivetrain: 'RWD',
    horsepower: '58 hp @ 9,500 RPM',
    primaryImage: '/src/assets/images/crf450r_supermoto_1791130569915.jpg',
    galleryImages: [
      '/src/assets/images/crf450r_supermoto_1791130569915.jpg'
    ],
    owner: {
      id: 'user-jordan',
      name: 'Jordan Miller',
      handle: 'Jordan Miller',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
      location: 'Phoenix, AZ',
      bio: 'Desert moto tracks, kart track supermoto sliding, and building custom paddock haulers.',
      memberSince: 'October 2023',
      shopifyCustomerId: 'SH-812049',
      isFollowing: false,
    },
    category: 'Moto & Haulers',
    buildStatus: 'Track Dedicated',
    featured: false,
    viewsCount: 1720,
    likesCount: 260,
    createdAt: '2024-01-20',
    updatedAt: '2024-08-12',
    visibility: 'public',
    modifications: [
      {
        id: 'mod-crf-1',
        category: 'Exhaust',
        partName: 'RS-12 Full Titanium Exhaust System',
        brand: 'Yoshimura',
        description: 'Significant weight savings and enhanced low-end torque punch out of corners.'
      },
      {
        id: 'mod-crf-2',
        category: 'Engine & Performance',
        partName: 'TorqDrive Manual Slipper Clutch',
        brand: 'Rekluse',
        description: 'Eliminates rear-wheel chatter and hop when downshifting hard into corners.'
      },
      {
        id: 'mod-crf-3',
        category: 'Wheels & Tires',
        partName: '17" Pro Series Supermoto Wheels & Dunlop Slicks',
        brand: 'Excel Rim / Haan Hubs',
        description: '17x3.5 front, 17x5.0 rear laced with heavy duty stainless spokes.'
      }
    ],
    buildUpdates: [
      {
        id: 'upd-crf-1',
        vehicleId: 'veh-crf450r-moto',
        title: 'Kart Track Open Test Night at Apex Motor Club',
        date: 'August 12, 2024',
        content: 'Backed it in sideways into Turn 3 all evening. The Rekluse clutch makes backing into corners so predictable. Loading the bike into the shop van covered in tire marbles was the best feeling.',
        images: [
          '/src/assets/images/crf450r_supermoto_1791130569915.jpg'
        ],
        likesCount: 74
      }
    ]
  }
];

export const MOCK_POPULAR_MAKES = [
  'All Makes',
  'Nissan',
  'Honda',
  'Toyota',
  'Ford',
  'Porsche',
  'Subaru',
  'BMW',
  'Mazda',
  'Jeep'
];

export const MOCK_CATEGORIES = [
  'All',
  'Tuner & JDM',
  'Overland & 4x4',
  'Euro & Track',
  'Muscle & Rat Rod',
  'Daily Drivers & Keis',
  'Moto & Haulers'
];

export const SAMPLE_VEHICLE_PRESETS = [
  {
    year: 1998,
    make: 'Toyota',
    model: 'Supra',
    trim: 'Turbo (JZA80)',
    color: 'Super White',
    engine: '3.0L Twin-Turbo 2JZ-GTE',
    transmission: 'V160 6-Speed Manual',
    drivetrain: 'RWD' as const,
    category: 'Tuner & JDM' as const,
    image: '/src/assets/images/skyline_r34_gtr_1791130465206.jpg'
  },
  {
    year: 1985,
    make: 'Toyota',
    model: 'Corolla',
    trim: 'GT-S (AE86 Trueno)',
    color: 'High-Tech Two-Tone Panda',
    engine: '1.6L DOHC 16V (4A-GE)',
    transmission: 'T50 5-Speed Manual',
    drivetrain: 'RWD' as const,
    category: 'Tuner & JDM' as const,
    image: '/src/assets/images/civic_si_ef9_1791130474543.jpg'
  },
  {
    year: 2022,
    make: 'Ford',
    model: 'Bronco',
    trim: 'Badlands Sasquatch',
    color: 'Area 51 Blue',
    engine: '2.7L EcoBoost Twin-Turbo V6',
    transmission: '10-Speed Automatic',
    drivetrain: '4WD' as const,
    category: 'Overland & 4x4' as const,
    image: '/src/assets/images/tacoma_trd_pro_1791130486225.jpg'
  },
  {
    year: 2002,
    make: 'Mazda',
    model: 'Miata',
    trim: 'Special Edition (NB2)',
    color: 'British Racing Green',
    engine: '1.8L VVT BP-Z3',
    transmission: '6-Speed Manual w/ Torsen LSD',
    drivetrain: 'RWD' as const,
    category: 'Daily Drivers & Keis' as const,
    image: '/src/assets/images/mazda_rx7_fd_1791130533675.jpg'
  }
];

export const INITIAL_EVENTS: GarageEvent[] = [
  {
    id: 'evt-1',
    title: 'Angeles Crest Dawn Patrol Canyon Cruise',
    eventType: 'Canyon Cruise',
    date: 'Saturday, Oct 26, 2024',
    time: '6:45 AM PST',
    location: 'Shell Station, 4522 Angeles Crest Hwy, La Cañada, CA',
    description: 'Early morning spirited run up Highway 2 to Newcomb\'s Ranch overlook before tourist traffic. Strict drive-your-own-pace etiquette. Radio channel 4-0. Coffee stop at Mt. Wilson.',
    coverImage: '/src/assets/images/mazda_rx7_fd_1791130533675.jpg',
    organizer: {
      id: 'user-kazuki',
      name: 'Kazuki Tanaka',
      handle: 'Kazuki Tanaka',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      location: 'Costa Mesa, CA',
      bio: 'Lifelong RB fanatic. Daikoku Futo street inspiration.',
      memberSince: 'January 2022',
      shopifyCustomerId: 'SH-102941',
    },
    attendeesCount: 38,
    isAttending: true,
    createdAt: '2024-10-01',
    updates: [
      {
        id: 'upd-evt-1-1',
        title: 'Staging & Radio FRS Channel 7',
        content: 'Lower Shell lot staging opens at 6:15 AM. FRS radio locked to Ch 7. Morning canyon dew expected above 4,000 ft, take warm-up lap gently.',
        date: '2 hrs ago',
        tag: 'Staging & Comms',
        authorName: 'Kazuki Tanaka'
      },
      {
        id: 'upd-evt-1-2',
        title: 'Route Briefing & Overlook Stop',
        content: 'Clear pavement confirmed up to Mt. Wilson turnoff. Mandatory drivers briefing at 6:40 AM sharp before rolling out.',
        date: 'Yesterday',
        tag: 'Route Notice',
        authorName: 'Kazuki Tanaka'
      }
    ]
  },
  {
    id: 'evt-2',
    title: 'Big Willow Autumn Track Day & Time Attack',
    eventType: 'Track Day',
    date: 'Friday, Nov 8, 2024',
    time: '7:30 AM PST',
    location: 'Willow Springs International Raceway, Rosamond, CA',
    description: 'Full day open lapping on "The Fastest Road in the West". Point-by passing in intermediate, open passing in advanced run groups. Timing transponders available at track office.',
    coverImage: '/src/assets/images/bmw_m3_e30_1791130544159.jpg',
    organizer: CURRENT_MOCK_USER,
    attendeesCount: 46,
    isAttending: true,
    createdAt: '2024-10-02',
    updates: [
      {
        id: 'upd-evt-2-1',
        title: 'Tech Inspection & Transponders',
        content: 'Tech inspection bays open 7:00 AM at Garages 1-4. Rental transponders available at timing tower with driver ID.',
        date: '1 day ago',
        tag: 'Tech Inspection',
        authorName: 'Alex Rivera'
      },
      {
        id: 'upd-evt-2-2',
        title: 'Run Group Schedule Finalized',
        content: 'Intermediate group starts warm-up laps at 8:30 AM. Front straight point-by passing only for intermediate.',
        date: '3 days ago',
        tag: 'Schedule',
        authorName: 'Alex Rivera'
      }
    ]
  },
  {
    id: 'evt-3',
    title: 'Old Town Cars & Coffee + Bakery Hangout',
    eventType: 'Cars & Coffee',
    date: 'Sunday, Nov 17, 2024',
    time: '8:00 AM PST',
    location: '4th & Elm Plaza, Costa Mesa, CA',
    description: 'Low-key community gathering. All Japanese classics, European track builds, rat rods, and overland rigs welcome. Respect the venue—strictly no revving or burnouts.',
    coverImage: '/src/assets/images/porsche_911_gt3_1791130508631.jpg',
    organizer: {
      id: 'user-sam',
      name: 'Sam Vance',
      handle: 'Sam Vance',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      location: 'Newport Beach, CA',
      bio: 'Naturally aspirated or bust. PCA instructor.',
      memberSince: 'March 2022',
      shopifyCustomerId: 'SH-304912',
    },
    attendeesCount: 64,
    isAttending: false,
    createdAt: '2024-10-03',
    updates: [
      {
        id: 'upd-evt-3-1',
        title: 'Bakery Overflow Lot Reserved',
        content: '4th & Elm management opened the east lot for classic Japanese and air-cooled Porsche chassis until 11:00 AM.',
        date: '3 days ago',
        tag: 'Parking Access',
        authorName: 'Sam Vance'
      }
    ]
  }
];

export const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'post-ad-gascanco-drop-1',
    title: 'GASCANCO Heavyweight Work Hoodie',
    content: 'Engineered for late nights turning wrenches in cold bays. 450GSM ultra-dense heavyweight fleece, oil-resistant finish, reinforced elbow panels, and official GASCANCO badge embroidery. Available now directly on our Shopify store.',
    category: 'Sponsored Drop',
    author: GASCANCO_ADMIN_USER,
    dateStr: 'Just now',
    isAdvertisement: true,
    shopifyProduct: {
      title: 'GASCANCO Heavyweight Work Hoodie',
      price: '$68.00 USD',
      originalPrice: '$82.00 USD',
      productUrl: 'https://gascanco.com/collections/apparel',
      ctaText: 'Shop on Shopify',
    },
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80',
    ],
    likesCount: 78,
    commentsCount: 14,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'post-yt-1',
    content: 'Just uploaded our telemetry analysis & in-car footage from the Buttonwillow CW13 shakedown session! Check the braking zone into Phil Hill: https://www.youtube.com/watch?v=0k1T4Q7r2X0',
    dateStr: '15 mins ago',
    author: CURRENT_MOCK_USER,
    vehicleId: 'veh-civic-si',
    vehicleName: '1991 Honda Civic Si',
    likesCount: 28,
    commentsCount: 5,
    createdAt: new Date().toISOString(),
    linkPreview: {
      type: 'youtube',
      url: 'https://www.youtube.com/watch?v=0k1T4Q7r2X0',
      youtubeId: '0k1T4Q7r2X0',
      title: 'Time Attack Hot Lap & Pedal Telemetry - Buttonwillow CW13',
      description: 'In-car camera telemetry review, threshold braking points, and apex speeds at Buttonwillow Raceway.',
      image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
      domain: 'youtube.com'
    }
  },
  {
    id: 'post-multi-1',
    content: 'Multi-angle breakdown of the new track setup. Freshly dialed in -3.2° front camber, rolled fenders, and torqued down the 15x8 Volk TE37s with 225/45 Falken RT660s. Ready for technical shakedowns.',
    dateStr: '1 hour ago',
    author: CURRENT_MOCK_USER,
    vehicleId: 'veh-civic-si',
    vehicleName: '1991 Honda Civic Si',
    likesCount: 35,
    commentsCount: 8,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    images: [
      '/src/assets/images/civic_si_ef9_1791130474543.jpg',
      '/src/assets/images/honda_civic_ef9_1791130143895.jpg',
      '/src/assets/images/bmw_e30_m3_1791130232909.jpg'
    ]
  },
  {
    id: 'post-1',
    title: 'Brake pad compound recommendations for 20-minute track sessions?',
    category: 'Question / Advice',
    vehicleId: 'veh-civic-si',
    vehicleName: '1991 Honda Civic Si',
    dateStr: '2 hours ago',
    content: 'Finished bleeding the Motul RBF660 and putting fresh slotted rotors on the EF9. Experienced slight pedal softening at Turn 7 at PIR last week with street pads. Looking between Hawk DTC-60 and Winmax W5. Anyone running these on sub-2,200 lb chassis?',
    imageUrl: '/src/assets/images/civic_si_ef9_1791130474543.jpg',
    author: CURRENT_MOCK_USER,
    likesCount: 14,
    commentsCount: 6,
    createdAt: '2024-10-05T08:00:00Z'
  },
  {
    id: 'post-2',
    title: 'RB26 oil pan baffle and crank collar install completed!',
    category: 'Shop Talk',
    vehicleId: 'veh-skyline-r34',
    vehicleName: '1999 Nissan Skyline GT-R',
    dateStr: 'Yesterday',
    content: 'Welded in the Tomei oil pan baffle kit and extended sump capacity by 1.2 liters. High-G sweeping turns at Big Willow were starving standard R34 pickups. Peace of mind is priceless when revving to 8,200 RPM.',
    imageUrl: '/src/assets/images/skyline_r34_gtr_1791130465206.jpg',
    author: {
      id: 'user-kazuki',
      name: 'Kazuki Tanaka',
      handle: 'Kazuki Tanaka',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      location: 'Costa Mesa, CA',
      bio: 'Lifelong RB fanatic. Daikoku Futo street inspiration.',
      memberSince: 'January 2022',
      shopifyCustomerId: 'SH-102941',
    },
    likesCount: 42,
    commentsCount: 9,
    createdAt: '2024-10-04T16:30:00Z'
  },
  {
    id: 'post-3',
    title: 'Spotted this raw 1954 Ford F-100 idling outside the machine shop',
    category: 'Spotted',
    dateStr: '2 days ago',
    content: 'You could hear the twin Holley 4-barrels loping half a mile away. Chopped cab, hand-fabricated boxed chassis, and real patina. Pure American craftsmanship in its most honest form.',
    imageUrl: '/src/assets/images/ford_f100_ratrod_1791130497932.jpg',
    author: {
      id: 'user-travis',
      name: 'Travis Bennett',
      handle: 'Travis Bennett',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      location: 'Austin, TX',
      bio: 'Track day addict, BMW CCA club racer.',
      memberSince: 'May 2022',
      shopifyCustomerId: 'SH-671049',
    },
    likesCount: 31,
    commentsCount: 4,
    createdAt: '2024-10-03T12:15:00Z'
  }
];

export const INITIAL_COMMENTS: PostComment[] = [
  // --- Comments on post-yt-1 (Buttonwillow telemetry & pedal analysis) ---
  {
    id: 'comm-yt-1',
    postId: 'post-yt-1',
    author: {
      id: 'user-kazuki',
      name: 'Kazuki Tanaka',
      handle: 'Kazuki Tanaka',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      location: 'Costa Mesa, CA',
      bio: 'Lifelong RB fanatic. Daikoku Futo street inspiration.',
      memberSince: 'January 2022',
    },
    content: 'That Turn 2 trail-braking entry is textbook. What initial brake bias percentage were you targeting with the Wilwood proportioning valve?',
    photoUrl: '/src/assets/images/civic_si_ef9_1791130474543.jpg',
    createdAt: '12 mins ago',
    likesCount: 6,
    dislikesCount: 0,
  },
  {
    id: 'comm-yt-1-reply',
    postId: 'post-yt-1',
    parentId: 'comm-yt-1',
    author: CURRENT_MOCK_USER,
    content: 'Dialed in 62% front / 38% rear. Kept the rear end planted under heavy compression into the sweeper without triggering snap oversteer.',
    createdAt: '8 mins ago',
    likesCount: 4,
    dislikesCount: 0,
  },
  {
    id: 'comm-yt-1-reply-2',
    postId: 'post-yt-1',
    parentId: 'comm-yt-1',
    author: {
      id: 'user-kazuki',
      name: 'Kazuki Tanaka',
      handle: 'Kazuki Tanaka',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      location: 'Costa Mesa, CA',
      bio: 'Lifelong RB fanatic. Daikoku Futo street inspiration.',
      memberSince: 'January 2022',
    },
    content: 'That explains why the telemetry trace showed zero counter-steer correction after apex. Super dialed setup.',
    createdAt: '5 mins ago',
    likesCount: 2,
    dislikesCount: 0,
  },
  {
    id: 'comm-yt-2',
    postId: 'post-yt-1',
    author: {
      id: 'user-travis',
      name: 'Travis Bennett',
      handle: 'Travis Bennett',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      location: 'Austin, TX',
      bio: 'Track day addict, BMW CCA club racer.',
      memberSince: 'May 2022',
    },
    content: 'In-car camera mount is rock solid. Roll cage clamp or suction cup on the rear quarter glass?',
    createdAt: '10 mins ago',
    likesCount: 3,
    dislikesCount: 0,
  },
  {
    id: 'comm-yt-2-reply',
    postId: 'post-yt-1',
    parentId: 'comm-yt-2',
    author: CURRENT_MOCK_USER,
    content: 'Billet aluminum clamp directly onto the main hoop harness bar. Zero vibration even over the FIA curbing.',
    createdAt: '4 mins ago',
    likesCount: 3,
    dislikesCount: 0,
  },

  // --- Comments on post-multi-1 (Volk TE37s & -3.2° camber fitment) ---
  {
    id: 'comm-multi-1',
    postId: 'post-multi-1',
    author: {
      id: 'user-kazuki',
      name: 'Kazuki Tanaka',
      handle: 'Kazuki Tanaka',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      location: 'Costa Mesa, CA',
      bio: 'Lifelong RB fanatic. Daikoku Futo street inspiration.',
      memberSince: 'January 2022',
    },
    content: 'Those bronze TE37s against the Tahitian Green Pearl look unreal. Did you have to shave the inner fender lip or just heat-gun roll it?',
    photoUrl: '/src/assets/images/honda_civic_ef9_1791130143895.jpg',
    createdAt: '45 mins ago',
    likesCount: 8,
    dislikesCount: 0,
  },
  {
    id: 'comm-multi-1-reply',
    postId: 'post-multi-1',
    parentId: 'comm-multi-1',
    author: CURRENT_MOCK_USER,
    content: 'Just a gentle heat-gun roll with an Eastwood roller and about 15 minutes of patience per side. Cleared 225/45 RT660s with zero rub at full bump.',
    createdAt: '30 mins ago',
    likesCount: 5,
    dislikesCount: 0,
  },

  // --- Comments on post-1 (Brake pad recommendations) ---
  {
    id: 'comm-p1-1',
    postId: 'post-1',
    author: {
      id: 'user-travis',
      name: 'Travis Bennett',
      handle: 'Travis Bennett',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      location: 'Austin, TX',
      bio: 'Track day addict, BMW CCA club racer.',
      memberSince: 'May 2022',
    },
    content: 'Go Hawk DTC-60 without hesitation. Ran them on my E30 M3 at COTA in 95°F ambient heat. Initial bite is aggressive but extremely modular once friction material reaches operating temp.',
    createdAt: '1 hour ago',
    likesCount: 7,
    dislikesCount: 0,
  },
  {
    id: 'comm-p1-2',
    postId: 'post-1',
    author: {
      id: 'user-kazuki',
      name: 'Kazuki Tanaka',
      handle: 'Kazuki Tanaka',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      location: 'Costa Mesa, CA',
      bio: 'Lifelong RB fanatic. Daikoku Futo street inspiration.',
      memberSince: 'January 2022',
    },
    content: 'Winmax W5 is great if you want less rotor wear on slotted blanks, but DTC-60 handles sudden thermal spikes way better if you are threshold braking from 110+ mph into Turn 1.',
    createdAt: '50 mins ago',
    likesCount: 4,
    dislikesCount: 0,
  },
  {
    id: 'comm-p1-2-reply',
    postId: 'post-1',
    parentId: 'comm-p1-2',
    author: CURRENT_MOCK_USER,
    content: 'Ordered a front axle set of DTC-60s! Going to pair them with titanium brake pad heat shields from Gascanco.',
    createdAt: '35 mins ago',
    likesCount: 3,
    dislikesCount: 0,
  },

  // --- Comments on post-2 (RB26 Tomei oil pan baffle) ---
  {
    id: 'comm-p2-1',
    postId: 'post-2',
    author: CURRENT_MOCK_USER,
    content: 'Clean TIG bead work on that sump extension! Did you pressure-test the pan before bolting it back up to the block?',
    createdAt: 'Yesterday',
    likesCount: 9,
    dislikesCount: 0,
  },
  {
    id: 'comm-p2-1-reply',
    postId: 'post-2',
    parentId: 'comm-p2-1',
    author: {
      id: 'user-kazuki',
      name: 'Kazuki Tanaka',
      handle: 'Kazuki Tanaka',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      location: 'Costa Mesa, CA',
      bio: 'Lifelong RB fanatic. Daikoku Futo street inspiration.',
      memberSince: 'January 2022',
    },
    content: 'Yes sir! Soaked it with solvent overnight and ran a 5 PSI soapy water bubble test along all seams. Bone dry.',
    photoUrl: '/src/assets/images/skyline_r34_gtr_1791130465206.jpg',
    createdAt: 'Yesterday',
    likesCount: 6,
    dislikesCount: 0,
  },

  // --- Comments on build update (act-upd-upd-1) ---
  {
    id: 'comm-b-1',
    postId: 'act-upd-upd-1',
    author: {
      id: 'user-travis',
      name: 'Travis Bennett',
      handle: 'Travis Bennett',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      location: 'Austin, TX',
      bio: 'Track day addict, BMW CCA club racer.',
      memberSince: 'May 2022',
    },
    content: 'How are the Ohlins DFV high-speed valving handling Buttonwillow off-camber washboard curbing? Any chassis unsettling over Phil Hill?',
    createdAt: 'September 29, 2024',
    likesCount: 5,
    dislikesCount: 0,
  },
  {
    id: 'comm-b-1-reply',
    postId: 'act-upd-upd-1',
    parentId: 'comm-b-1',
    author: {
      id: 'user-kazuki',
      name: 'Kazuki Tanaka',
      handle: 'Kazuki Tanaka',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      location: 'Costa Mesa, CA',
      bio: 'Lifelong RB fanatic. Daikoku Futo street inspiration.',
      memberSince: 'January 2022',
    },
    content: 'The Dual Flow Valve blow-off eliminates jarring kickback you get on standard coilovers. Car stayed completely composed even when clipping the inside rumble strips.',
    createdAt: 'September 29, 2024',
    likesCount: 4,
    dislikesCount: 0,
  }
];
 
export const INITIAL_SPOTLIGHT_CONFIG: SpotlightConfig = {
   vehicleId: 'veh-skyline-r34',
   badge: 'COMMUNITY SPOTLIGHT',
   headline: 'Track Dedicated BNR34 V-Spec',
   reason: 'Curated by GASCANCO Admin for authentic early-2000s Daikoku street inspiration and meticulously balanced 585whp twin-turbo execution.',
   active: true,
   updatedAt: '2024-10-15',
 };
 
export const INITIAL_POLLS: CommunityPoll[] = [
   {
     id: 'poll-engine-platform',
     question: 'Ultimate Weekend Track Day Engine Platform?',
     description: 'Balancing reliability, powerband, aftermarket parts support, and high-RPM thrills on technical road courses.',
     category: 'Engine Tech & Track',
     author: GASCANCO_ADMIN_USER,
     status: 'active',
     createdAt: '2 hours ago',
     totalVotes: 326,
     options: [
       { id: 'opt-1', text: 'Honda K20 / K24 High-Rev VTEC', votes: 142, voterUserIds: [] },
       { id: 'opt-2', text: 'Toyota 2JZ-GTE Turbo Inline-6', votes: 88, voterUserIds: [] },
       { id: 'opt-3', text: 'BMW B58 3.0L TwinPower Turbo', votes: 64, voterUserIds: [] },
       { id: 'opt-4', text: 'GM LS3 6.2L Naturally Aspirated V8', votes: 32, voterUserIds: [] },
     ],
   },
   {
     id: 'poll-meet-style',
     question: 'Next GASCANCO Sunset Meet Location:',
     description: 'Help us choose the next gathering spot with ample lighting, coffee vendors, and zero-tolerance sound regulations.',
     category: 'Community Events',
     author: GASCANCO_ADMIN_USER,
     status: 'active',
     createdAt: '1 day ago',
     totalVotes: 189,
     options: [
       { id: 'loc-1', text: 'Huntington Beach Coastal Lot (Pacific Coast Hwy)', votes: 94, voterUserIds: [] },
       { id: 'loc-2', text: 'Ortega Highway Mountain Lookout Overlook', votes: 56, voterUserIds: [] },
       { id: 'loc-3', text: 'Downtown Los Angeles Arts District Rooftop', votes: 39, voterUserIds: [] },
     ],
   }
 ];

