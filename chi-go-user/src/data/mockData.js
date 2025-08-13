export const mockAttractions = [
  {
    _id: '1',
    name: 'Millennium Park',
    description: 'Home of "The Bean" (Cloud Gate), this park is a hub of art, music, and architecture.',
    image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=300',
    location: { lat: 41.8826, lng: -87.6226, address: '201 E Randolph St, Chicago, IL' },
    category: 'Park',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    _id: '2',
    name: 'Navy Pier',
    description: 'A bustling pier on Lake Michigan with rides, restaurants, and stunning city views.',
    image: 'https://images.unsplash.com/photo-1563623818-dc040cacd0e6?w=300',
    location: { lat: 41.8917, lng: -87.6086, address: '600 E Grand Ave, Chicago, IL' },
    category: 'Entertainment',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const mockRestaurants = [
  {
    _id: '1',
    name: 'Giordanos',
    description: 'A Chicago institution famous for its incredibly cheesy stuffed deep-dish pizza.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300',
    cuisine: 'Italian',
    location: { lat: 41.8789, lng: -87.6359, address: '730 N Rush St, Chicago, IL' },
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const mockCommunityPosts = [
  {
    _id: '1',
    userId: '1',
    username: 'ChicagoExplorer',
    title: 'Perfect Weekend in Chicago',
    description: 'Had an amazing weekend exploring Chicago!',
    checklist: [],
    likes: [],
    likeCount: 24,
    isPublic: true,
    createdAt: new Date('2024-08-10'),
    updatedAt: new Date('2024-08-10')
  }
];