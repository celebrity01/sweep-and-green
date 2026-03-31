// All 18 Sokoto LGAs with their wards
export const SOKOTO_LGAS: Record<string, string[]> = {
  'Sokoto North': ['Arkilla', 'Bado', 'Gagi', 'Gidan Igwai', 'Kauran Fawa', 'Kilgori', 'Magajin Gari I', 'Magajin Gari II', 'Marna', 'Runjin Sambo', 'Takalmawa', 'Tudun Wada'],
  'Sokoto South': ['Amanawa', 'Binji I', 'Binji II', 'Dogon Dawa', 'Gawakuke', 'Gidan Dare', 'Hale', 'Kanchewa', 'Kware', 'Kwanni', 'Rafin Jini', 'Ruwa Kanya', 'Sarkin Adar', 'Sarkin Zamfarawa', 'Waziri'],
  'Sokoto East': ['Achida', 'Badawa', 'Bodinga', 'Gande', 'Gwiwa', 'Kalgo', 'Kebbe', 'Kworonfare', 'Rabah North', 'Rabah South', 'Tureta East', 'Tureta West', 'Wurno East', 'Wurno West'],
  'Sokoto West': ['Danchadi', 'Dange', 'Gidan Madi', 'Gwadabawa North', 'Gwadabawa South', 'Illela Central', 'Illela North', 'Illela South', 'Lugu', 'Tangaza East', 'Tangaza West'],
  'Dange-Shuni': ['Dange', 'Shuni', 'Kirare', 'Marke', 'Gumbi', 'Raka', 'Wajke East', 'Wajke West'],
  'Gwadabawa': ['Gwadabawa', 'Gagare', 'Maikabo', 'Malunfashi', 'Mariamin', 'Ungushi', 'Ɗankama', 'Haliru Ruwa'],
  'Illela': ['Illela', 'Giyawa', 'Kaura', 'Kyadawa', 'Samama', 'Tudu', 'Wasagu', 'Zango'],
  'Isa': ['Isa', 'Charanchi', 'Dorawar Sabo', 'Faru', 'Ɗankama', 'Sabon Birni', 'Tsibiri', 'Yogun Daka'],
  'Kware': ['Kware', 'Bodinga', 'Dogon Kurmi', 'Gumbi', 'Kilgori', 'Kwartachi', 'Sankara', 'Wamako North'],
  'Rabah': ['Rabah', 'Birnin Bunni', 'Dundaye', 'Girabshi', 'Katanga', 'Kilgori', 'Kwargaba', 'Tambar'],
  'Shagari': ['Shagari', 'Danjawa', 'Gande', 'Gwazange', 'Jigawa', 'Kebbe', 'Kinaye', 'Kwatar Waziri'],
  'Silame': ['Silame', 'Danchadi', 'Gidadawa', 'Gwiwa', 'Kurya', 'Lajinge', 'Maikwari', 'Sandamu'],
  'Tambuwal': ['Tambuwal', 'Bagel', 'Bakemi', 'Kuchi', 'Kwalen Gagare', 'Salau', 'Tambari', 'Yarbesse'],
  'Tangaza': ['Tangaza', 'Bingi', 'Damri', 'Danchadi', 'Gidan Tambus', 'Kurfa', 'Shiyar Ganuwar', 'Yaruwa'],
  'Tureta': ['Tureta', 'Badawa', 'Gazari', 'Jabe', 'Jangeru', 'Kauran Namoda', 'Kworonfare', 'Madawa'],
  'Wamako': ['Wamako', 'Dundaye', 'Gumbi', 'Kwak', 'Maikwari', 'Mankwani', 'Runjin Alkali', 'Zankwai'],
  'Wurno': ['Wurno', 'Ambarura', 'Barayar Zaki', 'Dingyadi', 'Gande', 'Kwachiri', 'Lambara', 'Rawayau'],
  'Yabo': ['Yabo', 'Bagaye', 'Durbawa', 'Gidan Goga', 'Gusami', 'Kaya', 'Kofar Arewa', 'Zaggazaga'],
}

export const SOKOTO_LGA_NAMES = Object.keys(SOKOTO_LGAS)

export const WASTE_TYPES = [
  'Household waste',
  'Industrial waste',
  'Medical waste',
  'Construction debris',
  'Open burning',
  'Blocked drainage',
]

export const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', color: '#27AE60', description: 'Minor accumulation, non-urgent' },
  { value: 'medium', label: 'Medium', color: '#E67E22', description: 'Moderate issue, needs attention soon' },
  { value: 'high', label: 'High', color: '#E74C3C', description: 'Serious hazard, urgent response needed' },
  { value: 'critical', label: 'Critical', color: '#C0392B', description: 'Immediate danger, dispatch now' },
]

export const POINTS_RULES = {
  report_submitted: 50,
  report_resolved: 100,
  daily_bonus: 20,
  referral: 200,
  profile_complete: 100,
  monthly_top_reporter: 500,
}

export const REWARDS = [
  { id: 'airtime_100', label: 'MTN/Airtel ₦100 Airtime', points: 500, icon: '📱', delivery: 'instant' },
  { id: 'data_1gb', label: '1GB Data Bundle', points: 1000, icon: '📶', delivery: 'instant' },
  { id: 'cash_500', label: '₦500 POS Cash', points: 2000, icon: '💵', delivery: 'bank_transfer' },
  { id: 'cash_1000', label: '₦1,000 POS Cash', points: 3500, icon: '💰', delivery: 'bank_transfer' },
]
