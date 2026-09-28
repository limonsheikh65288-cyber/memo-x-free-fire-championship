// MEMO X Free Fire Championship Tournament Configuration

export const PRIZE_DISTRIBUTION = [
  { rank: 'Champion', bdt: '৳৬০,০০০', usd: '60,000 BDT', reward: 'Grand Championship Trophy + 4x MEMO Semiconductor Coolers + Ring', highlight: true },
  { rank: '1st Runner Up', bdt: '৳৩৫,০০০', usd: '35,000 BDT', reward: 'Silver Plaque + 4x MEMO Coolers', highlight: false },
  { rank: '2nd Runner Up', bdt: '৳২০,০০০', usd: '20,000 BDT', reward: 'Bronze Plaque + Tournament Medals', highlight: false },
  { rank: '4th Place', bdt: '৳৮,০০০', usd: '8,000 BDT', reward: 'Top 4 Certificate + Official Gaming Merchandise', highlight: false },
  { rank: '5th Place', bdt: '৳৬,০০০', usd: '6,000 BDT', reward: 'Prize Payout + Participant Badges', highlight: false },
  { rank: '6th Place', bdt: '৳৪,০০০', usd: '4,000 BDT', reward: 'Prize Payout + Participant Badges', highlight: false },
  { rank: 'Tournament MVP', bdt: '৳৫,০০০', usd: '5,000 BDT', reward: 'Predator Golden Rifle Award + MEMO Cooler', highlight: false },
  { rank: 'Best Clutcher', bdt: '৳৪,০০০', usd: '4,000 BDT', reward: 'Clutch King Trophy + MEMO Cooler', highlight: false },
];

export const MEMO_COOLER_SPECS = {
  name: 'MEMO Semiconductor Magnetic Phone Cooler',
  series: 'CX07 Extreme Cryo Edition',
  value: 'Free Milestone Reward',
  defaultTargetReferrals: 20,
  features: [
    { title: 'Peltier Cryo Core', desc: 'Active thermoelectric refrigeration plate drops phone surface temperature by up to 25°C in under 15 seconds.' },
    { title: 'Zero Frame Drops', desc: 'Prevents CPU/GPU thermal throttling during intense Free Fire 60fps / 120fps high-tier tournament gameplay.' },
    { title: 'Dual Mount Flexibility', desc: 'Supports MagSafe direct magnetic snap and includes spring-loaded universal silicone clip for all smartphones.' },
    { title: 'Aero-Turbine 7,500 RPM', desc: 'Ultra-quiet 24dB acoustic profile ensuring voice chat mic picks up zero background fan noise.' },
    { title: 'Digital LED Thermometer', desc: 'Real-time numerical surface temperature readout directly on the cooler hub.' },
    { title: 'Type-C 30W Super Charge', desc: 'High-efficiency fast power delivery with internal thermal safety protection.' }
  ]
};

export const TOURNAMENT_RULES = [
  {
    category: 'Tournament Structure & Slots',
    question: 'How many teams will compete, and what is the stage breakdown?',
    answer: 'The tournament has a dynamic team capacity managed live by administration. Teams will be split into Groups. Top teams from each group proceed to the Semi-Finals, and top squads battle in the Grand Finals.'
  },
  {
    category: 'Device & Emulator Policies',
    question: 'Are emulators (PC/BlueStacks) or iPads allowed?',
    answer: 'ONLY physical smartphones (Android / iOS) are permitted. Emulators, keyboard/mouse setups, and tablets are strictly prohibited. Every player must pass a room check; suspicious recoil or aim files will lead to immediate disqualification.'
  },
  {
    category: 'Scoring Matrix (Official Free Fire Esports)',
    question: 'What is the point system for placement and kills?',
    answer: 'Standard Garena Competitive Scoring: 1st Place = 12 pts, 2nd Place = 9 pts, 3rd Place = 8 pts, 4th = 7 pts, 5th = 6 pts, 6th = 5 pts, 7th = 4 pts, 8th = 3 pts, 9th = 2 pts, 10th = 1 pt, 11th-12th = 0 pts. Each verified Kill grants 1 point.'
  },
  {
    category: 'Cooler Campaign & Referral Milestone',
    question: 'How do I claim my free MEMO Phone Cooler?',
    answer: 'Share your personal referral link. When friends visit and register, your verified count increases in real-time. Once you reach the admin-set referral target (default: 20), unlock the Claim button to submit your shipping address for free doorstep delivery.'
  },
  {
    category: 'Communication & Room Credentials',
    question: 'Where will Room ID and Custom Room Passwords be shared?',
    answer: 'All Custom Room IDs and Passwords will be sent strictly inside the official WhatsApp Captains Group and Telegram Channel 15 minutes before scheduled match times.'
  },
  {
    category: 'Prize Payout & Verification',
    question: 'How and when will the ৳১,৪২,০০০ prize pool be distributed?',
    answer: 'Prize disbursements take place within 24 hours of the Grand Finals closing ceremony via bKash, Nagad, or direct Bangladeshi Bank Transfer directly to the team captain upon player UID verification.'
  }
];

export const MATCH_SCHEDULE = [
  { stage: 'Group Stage (Day 1)', date: 'Oct 15, 2026', time: '04:00 PM BST', maps: 'Bermuda · Purgatory · Kalahari', status: 'Upcoming' },
  { stage: 'Group Stage (Day 2)', date: 'Oct 16, 2026', time: '04:00 PM BST', maps: 'Alpine · NexTerra · Bermuda', status: 'Upcoming' },
  { stage: 'Semi-Finals (Day 3)', date: 'Oct 17, 2026', time: '06:00 PM BST', maps: 'Bermuda · Purgatory · Kalahari · Alpine', status: 'Upcoming' },
  { stage: 'Grand Finals (Day 4)', date: 'Oct 18, 2026', time: '07:00 PM BST', maps: '6 Map Marathon (Full Roster Live)', status: 'Grand Stage' },
];
