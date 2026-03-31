import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseKey) {
  console.error('Please provide a SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const LGAs = [
  'Sokoto North', 'Sokoto South', 'Wamakko', 'Dange Shuni', 'Bodinga',
  'Yabo', 'Shagari', 'Tambuwal', 'Kebbe', 'Tureta'
];

const WARD_MAP: Record<string, string[]> = {
  'Sokoto North': ['Magajin Gari A', 'Magajin Gari B', 'Magajin Rafi A', 'Magajin Rafi B'],
  'Sokoto South': ['Rijiyar Dorowa', 'Tudun Wada', 'Minanata', 'Gagi'],
  'Wamakko': ['Wamakko', 'Gumbi', 'Dundaye', 'Kalanbaina']
};

const WASTE_TYPES = ['Plastic', 'Organic', 'E-Waste', 'Medical', 'General'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];
const STATUSES = ['pending', 'assigned', 'in_progress', 'resolved', 'rejected'];

async function seed() {
  console.log('Starting seed process...');

  try {
    // 1. Create Users
    console.log('Creating users...');

    // We will use existing users if they exist, else we rely on anonymous reports
    const { data: existingUsers } = await supabase.from('users').select('id, role');

    const residentIds: string[] = existingUsers?.filter((u: any) => u.role === 'resident').map((u: any) => u.id) || [];
    const crewIds: string[] = existingUsers?.filter((u: any) => u.role === 'crew').map((u: any) => u.id) || [];

    // 2. Create Reports
    console.log('Creating reports...');
    for (let i = 0; i < 50; i++) {
      const lga = LGAs[i % 3];
      const wards = WARD_MAP[lga] || ['Ward 1'];
      const ward = wards[Math.floor(Math.random() * wards.length)];

      const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
      const hasReporter = residentIds.length > 0 && Math.random() > 0.3;
      const reporterId = hasReporter ? residentIds[Math.floor(Math.random() * residentIds.length)] : null;
      const assignedCrew = (status !== 'pending' && status !== 'rejected' && crewIds.length > 0) ?
        crewIds[Math.floor(Math.random() * crewIds.length)] : null;

      const lat = 13.06 + (Math.random() - 0.5) * 0.1;
      const lng = 5.23 + (Math.random() - 0.5) * 0.1;

      const report = {
        reporter_id: reporterId,
        photo_url: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        waste_type: WASTE_TYPES[Math.floor(Math.random() * WASTE_TYPES.length)],
        severity: SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)],
        latitude: lat,
        longitude: lng,
        address_string: faker.location.streetAddress() + ', Sokoto',
        lga,
        ward,
        description: faker.lorem.sentence(),
        status,
        assigned_crew_id: assignedCrew,
        resolved_at: status === 'resolved' ? new Date().toISOString() : null,
        is_anonymous: !hasReporter
      };

      const { error } = await supabase.from('reports').insert(report);
      if (error) {
        console.error('Error creating report:', error);
      }
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  }
}

seed();
