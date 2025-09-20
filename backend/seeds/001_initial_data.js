/**
 * @param { import("knex").Knex } knex
 */
export async function seed(knex) {
  // Clear tables respecting foreign key order
  await knex('report_status_history').del()
  await knex('notifications').del()
  await knex('reports').del()
  await knex('departments').del()
  await knex('users').del()

  // -------------------------------
  // 1️⃣ Insert Departments
  // -------------------------------
  const deptRows = await knex('departments')
    .insert([
      { name: 'Roads & Infrastructure', description: 'Handles potholes, road repairs, traffic signals', contact_phone: '+911234567890', contact_email: 'roads@civic.gov' },
      { name: 'Sanitation', description: 'Garbage collection, street cleaning, waste management', contact_phone: '+911234567891', contact_email: 'sanitation@civic.gov' },
      { name: 'Electrical', description: 'Street lights, power issues, electrical maintenance', contact_phone: '+911234567892', contact_email: 'electrical@civic.gov' },
      { name: 'Water Supply', description: 'Water leaks, supply issues, drainage problems', contact_phone: '+911234567893', contact_email: 'water@civic.gov' },
      { name: 'Parks & Environment', description: 'Tree maintenance, park facilities, environmental issues', contact_phone: '+911234567894', contact_email: 'parks@civic.gov' }
    ])
    .returning('id')

  const deptIds = deptRows.map(d => d.id)

  // -------------------------------
  // 2️⃣ Insert Users
  // -------------------------------
  const userRows = await knex('users')
    .insert([
      { phone: '+919876543210', name: 'Admin User', role: 'admin', is_verified: true, reputation_score: 100 },
      { phone: '+919876543211', name: 'Ward Officer - Zone 1', role: 'ward_officer', is_verified: true, reputation_score: 90 },
      { phone: '+919876543212', name: 'Ward Officer - Zone 2', role: 'ward_officer', is_verified: true, reputation_score: 85 },
      { phone: '+919876543213', name: 'John Citizen', role: 'citizen', is_verified: true, reputation_score: 75 },
      { phone: '+919876543214', name: 'Jane Reporter', role: 'citizen', is_verified: true, reputation_score: 80 }
    ])
    .returning('id')

  const userIds = userRows.map(u => u.id)

  // -------------------------------
  // 3️⃣ Insert Reports
  // -------------------------------
  await knex('reports').insert([
    {
      user_id: userIds[3],
      department_id: deptIds[0],
      title: 'Large pothole on Main Street',
      description: 'Deep pothole causing vehicle damage near the traffic signal',
      category: 'pothole',
      status: 'new',
      priority: 'high',
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'Main Street, near City Center',
      image_urls: JSON.stringify(['https://example.com/pothole1.jpg']),
      user_name: 'John Citizen',
      urgency_score: 8
    },
    {
      user_id: userIds[4],
      department_id: deptIds[1],
      title: 'Overflowing garbage bin',
      description: 'Garbage bin overflowing for 3 days, causing smell',
      category: 'garbage',
      status: 'acknowledged',
      priority: 'medium',
      latitude: 12.9616,
      longitude: 77.5845,
      address: 'Park Road, Sector 12',
      image_urls: JSON.stringify(['https://example.com/garbage1.jpg']),
      assigned_to: userIds[1],
      user_name: 'Jane Reporter',
      urgency_score: 7
    },
    {
      user_id: userIds[3],
      department_id: deptIds[2],
      title: 'Street light not working',
      description: 'Street light has been off for a week, area is dark at night',
      category: 'streetlight',
      status: 'in_progress',
      priority: 'medium',
      latitude: 12.9816,
      longitude: 77.6045,
      address: 'Oak Avenue, Block C',
      assigned_to: userIds[2],
      estimated_resolution_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      user_name: 'John Citizen',
      urgency_score: 5
    }
  ])

  // -------------------------------
  // 4️⃣ Insert Notifications
  // -------------------------------
  await knex('notifications').insert([
    {
      user_id: userIds[3],
      title: 'Report Submitted',
      message: 'Your report has been submitted successfully',
      is_read: false
    },
    {
      user_id: userIds[4],
      title: 'New Assignment',
      message: 'You have a new assignment for report #2',
      is_read: false
    }
  ])

  console.log('✅ Seed data inserted successfully')
}