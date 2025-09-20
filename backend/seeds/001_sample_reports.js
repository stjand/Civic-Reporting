export const seed = async function(knex) {
  // Delete existing entries
  await knex('reports').del();
  
  // Insert sample data
  await knex('reports').insert([
    {
      report_id: 'RPT001',
      title: 'Large pothole on Main Street',
      description: 'Deep pothole causing vehicle damage near traffic light',
      category: 'pothole',
      status: 'new',
      location: JSON.stringify({ lat: 12.9716, lng: 77.5946 }),
      address: 'Main Street, near City Center',
      user_name: 'John Citizen',
      photos: JSON.stringify([]),
      priority: 'high',
      urgency_score: 8
    },
    {
      report_id: 'RPT002', 
      title: 'Garbage pile on Park Road',
      description: 'Large garbage accumulation blocking pedestrian path',
      category: 'garbage',
      status: 'in_progress',
      location: JSON.stringify({ lat: 12.9726, lng: 77.5956 }),
      address: 'Park Road, Block A',
      user_name: 'Jane Smith',
      photos: JSON.stringify([]),
      priority: 'medium',
      urgency_score: 6
    },
    {
      report_id: 'RPT003',
      title: 'Broken streetlight on Park Avenue',
      description: 'Streetlight not working, making area unsafe at night',
      category: 'lighting',
      status: 'new',
      location: JSON.stringify({ lat: 12.9736, lng: 77.5966 }),
      address: 'Park Avenue, Block C',
      user_name: 'Mike Johnson',
      photos: JSON.stringify([]),
      priority: 'medium',
      urgency_score: 7
    }
  ]);
};
