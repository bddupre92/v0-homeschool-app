import { doc, writeBatch } from "firebase/firestore"
import { db } from "./firebase"

// Sample users data
const sampleUsers = [
  {
    id: "sample-user-1",
    displayName: "Sarah Johnson",
    email: "sarah@example.com",
    photoURL: "/images/avatars/avatar-1.jpg",
    bio: "Homeschooling mom of 3 with a passion for nature-based learning and STEM education.",
    location: "Portland, OR",
    interests: ["Science", "Nature Study", "Math", "Reading"],
    createdAt: new Date(),
    preferences: {
      grades: ["Elementary", "Middle School"],
      subjects: ["Math", "Science", "Language Arts", "Art"],
      approaches: ["Charlotte Mason", "Eclectic"],
      resourceTypes: ["Printable", "Activity", "Project", "Book List"],
      interests: ["Nature Study", "Coding", "Arts & Crafts", "Reading"],
    },
    role: "user",
  },
  {
    id: "sample-user-2",
    displayName: "Michael Chen",
    email: "michael@example.com",
    photoURL: "/images/avatars/avatar-2.jpg",
    bio: "Dad and educator focusing on classical education with my two children.",
    location: "Austin, TX",
    interests: ["History", "Classical Literature", "Philosophy", "Music"],
    createdAt: new Date(),
    preferences: {
      grades: ["Elementary", "Middle School"],
      subjects: ["History", "Language Arts", "Music", "Social Studies"],
      approaches: ["Classical", "Traditional"],
      resourceTypes: ["Curriculum", "Book List", "Lesson Plan"],
      interests: ["Reading", "Music", "Writing"],
    },
    role: "user",
  },
  {
    id: "admin-user",
    displayName: "Admin User",
    email: "admin@homescholar.app",
    photoURL: "/images/avatars/admin-avatar.jpg",
    bio: "HomeScholar administrator and content curator.",
    location: "Remote",
    interests: ["Education", "Curriculum Development", "EdTech"],
    createdAt: new Date(),
    preferences: {
      grades: ["Preschool", "Elementary", "Middle School", "High School"],
      subjects: ["Math", "Science", "Language Arts", "History", "Art"],
      approaches: ["Charlotte Mason", "Classical", "Montessori", "Traditional"],
      resourceTypes: ["Printable", "Video", "Interactive", "Curriculum"],
      interests: ["Education Technology", "Curriculum Development"],
    },
    role: "admin",
  },
]

// Sample resources data
const sampleResources = [
  {
    id: "resource-1",
    title: "Water Cycle Interactive Notebook",
    description:
      "A comprehensive interactive notebook for learning about the water cycle. Includes printable diagrams, activities, and experiments.",
    imageUrl: "/images/resources/water-cycle.jpg",
    type: "Printable",
    subjects: ["Science"],
    grades: ["Elementary", "Middle School"],
    approaches: ["Traditional", "Charlotte Mason"],
    tags: ["Water Cycle", "Earth Science", "Interactive", "Printable"],
    url: "https://example.com/water-cycle",
    createdBy: "sample-user-1",
    createdAt: new Date(),
    isPublic: true,
    saveCount: 42,
    viewCount: 156,
  },
  {
    id: "resource-2",
    title: "Ancient Egypt Unit Study",
    description:
      "Complete unit study on Ancient Egypt including history, art, literature, and STEM connections. Perfect for a 4-6 week deep dive.",
    imageUrl: "/images/resources/ancient-egypt.jpg",
    type: "Curriculum",
    subjects: ["History", "Art", "Social Studies"],
    grades: ["Elementary", "Middle School"],
    approaches: ["Unit Studies", "Classical"],
    tags: ["Ancient Egypt", "History", "Unit Study", "Interdisciplinary"],
    url: "https://example.com/ancient-egypt",
    createdBy: "sample-user-2",
    createdAt: new Date(),
    isPublic: true,
    saveCount: 78,
    viewCount: 243,
  },
  {
    id: "resource-3",
    title: "Fraction Pizza Project",
    description:
      "Hands-on math project using pizza to teach fractions. Includes printable templates, lesson plan, and extension activities.",
    imageUrl: "/images/resources/fraction-pizza.jpg",
    type: "Activity",
    subjects: ["Math"],
    grades: ["Elementary"],
    approaches: ["Montessori", "Hands-on Learning"],
    tags: ["Fractions", "Math", "Hands-on", "Food"],
    url: "https://example.com/fraction-pizza",
    createdBy: "sample-user-1",
    createdAt: new Date(),
    isPublic: true,
    saveCount: 103,
    viewCount: 389,
  },
  // Add more resources as needed
]

// Sample boards data
const sampleBoards = [
  {
    id: "board-1",
    title: "Spring Science Activities",
    description: "Collection of science activities perfect for spring learning.",
    imageUrl: "/images/boards/spring-science.jpg",
    createdBy: "sample-user-1",
    createdAt: new Date(),
    isPublic: true,
    resources: ["resource-1", "resource-3"],
    tags: ["Science", "Spring", "Seasonal", "Nature Study"],
  },
  {
    id: "board-2",
    title: "Ancient Civilizations",
    description: "Resources for studying ancient civilizations around the world.",
    imageUrl: "/images/boards/ancient-civilizations.jpg",
    createdBy: "sample-user-2",
    createdAt: new Date(),
    isPublic: true,
    resources: ["resource-2"],
    tags: ["History", "Ancient History", "Social Studies", "Classical Education"],
  },
]

// Sample events data
const sampleEvents = [
  {
    id: "event-1",
    title: "Nature Journaling Workshop",
    description: "Join us for a hands-on workshop on nature journaling techniques for all ages.",
    location: {
      name: "Tryon Creek State Park",
      address: "11321 SW Terwilliger Blvd, Portland, OR 97219",
      coordinates: { lat: 45.4511, lng: -122.6882 },
    },
    date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    time: "10:00 AM - 12:00 PM",
    imageUrl: "/images/events/nature-journaling.jpg",
    organizer: "sample-user-1",
    attendees: ["sample-user-2"],
    maxAttendees: 20,
    isPublic: true,
    tags: ["Nature Study", "Art", "Workshop", "Outdoor"],
  },
  {
    id: "event-2",
    title: "Homeschool Co-op Science Fair",
    description: "Annual science fair for homeschoolers to showcase their projects and experiments.",
    location: {
      name: "Community Center",
      address: "123 Main St, Austin, TX 78701",
      coordinates: { lat: 30.2672, lng: -97.7431 },
    },
    date: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    time: "1:00 PM - 4:00 PM",
    imageUrl: "/images/events/science-fair.jpg",
    organizer: "sample-user-2",
    attendees: ["sample-user-1"],
    maxAttendees: 50,
    isPublic: true,
    tags: ["Science", "Co-op", "Fair", "STEM"],
  },
]

// Sample locations data
const sampleLocations = [
  {
    id: "location-1",
    name: "Natural History Museum",
    description:
      "Explore exhibits on dinosaurs, geology, and local wildlife. Offers homeschool programs every Tuesday.",
    address: "1234 Museum Way, Portland, OR 97205",
    coordinates: { lat: 45.5122, lng: -122.6587 },
    category: "Museum",
    imageUrl: "/images/locations/natural-history-museum.jpg",
    website: "https://example.com/museum",
    phone: "(503) 555-1234",
    hours: "Tuesday-Sunday: 10:00 AM - 5:00 PM, Closed Monday",
    admissionFee: "Adults: $12, Children: $8, Under 3: Free",
    homeschoolPrograms: true,
    homeschoolDiscount: true,
    tags: ["Science", "Natural History", "Field Trip", "Museum"],
    addedBy: "sample-user-1",
    createdAt: new Date(),
    rating: 4.7,
    reviewCount: 24,
  },
  {
    id: "location-2",
    name: "City Library - Main Branch",
    description: "Public library with extensive children's section and regular homeschool meetups.",
    address: "567 Library Lane, Austin, TX 78701",
    coordinates: { lat: 30.2742, lng: -97.7407 },
    category: "Library",
    imageUrl: "/images/locations/city-library.jpg",
    website: "https://example.com/library",
    phone: "(512) 555-6789",
    hours: "Monday-Saturday: 9:00 AM - 8:00 PM, Sunday: 1:00 PM - 5:00 PM",
    admissionFee: "Free",
    homeschoolPrograms: true,
    homeschoolDiscount: false,
    tags: ["Library", "Books", "Reading", "Free Resource"],
    addedBy: "sample-user-2",
    createdAt: new Date(),
    rating: 4.9,
    reviewCount: 36,
  },
]

// Sample posts data
const samplePosts = [
  {
    id: "post-1",
    title: "Our Nature Study Journey",
    content:
      "We've been incorporating nature study into our curriculum for the past year, and I wanted to share our experience and some resources that have worked well for us...",
    imageUrl: "/images/posts/nature-study.jpg",
    authorId: "sample-user-1",
    createdAt: new Date(),
    tags: ["Nature Study", "Charlotte Mason", "Science"],
    likes: 15,
    comments: [
      {
        id: "comment-1",
        authorId: "sample-user-2",
        content: "Thank you for sharing! We're just starting with nature study and these resources look perfect.",
        createdAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    ],
  },
  {
    id: "post-2",
    title: "Classical Education Resources for Elementary",
    content:
      "After trying several approaches, we've settled on a classical education model for our family. Here are the resources that have been most valuable for us...",
    imageUrl: "/images/posts/classical-education.jpg",
    authorId: "sample-user-2",
    createdAt: new Date(),
    tags: ["Classical Education", "Curriculum", "Elementary"],
    likes: 23,
    comments: [
      {
        id: "comment-2",
        authorId: "sample-user-1",
        content: "We use some of these resources too! Have you tried the history program from XYZ publisher?",
        createdAt: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    ],
  },
]

// Sample reviews data
const sampleReviews = [
  {
    id: "review-1",
    resourceId: "resource-1",
    userId: "sample-user-2",
    rating: 5,
    content:
      "This water cycle notebook was perfect for my 3rd grader! The activities were engaging and the printables were high quality.",
    createdAt: new Date(),
  },
  {
    id: "review-2",
    locationId: "location-1",
    userId: "sample-user-1",
    rating: 4,
    content: "Great museum with lots of hands-on exhibits. The homeschool day was well organized and educational.",
    createdAt: new Date(),
  },
]

// Function to seed all data
export async function seedDatabase() {
  try {
    const batch = writeBatch(db)

    // Seed users
    for (const user of sampleUsers) {
      const userRef = doc(db, "users", user.id)
      batch.set(userRef, user)
    }

    // Seed resources
    for (const resource of sampleResources) {
      const resourceRef = doc(db, "resources", resource.id)
      batch.set(resourceRef, resource)
    }

    // Seed boards
    for (const board of sampleBoards) {
      const boardRef = doc(db, "boards", board.id)
      batch.set(boardRef, board)
    }

    // Seed events
    for (const event of sampleEvents) {
      const eventRef = doc(db, "events", event.id)
      batch.set(eventRef, event)
    }

    // Seed locations
    for (const location of sampleLocations) {
      const locationRef = doc(db, "locations", location.id)
      batch.set(locationRef, location)
    }

    // Seed posts
    for (const post of samplePosts) {
      const postRef = doc(db, "posts", post.id)
      batch.set(postRef, post)
    }

    // Seed reviews
    for (const review of sampleReviews) {
      const reviewRef = doc(db, "reviews", review.id)
      batch.set(reviewRef, review)
    }

    // Commit the batch
    await batch.commit()

    console.log("Database seeded successfully!")
    return { success: true }
  } catch (error) {
    console.error("Error seeding database:", error)
    return { success: false, error }
  }
}

// Function to seed a specific collection
export async function seedCollection(collectionName: string, data: any[]) {
  try {
    const batch = writeBatch(db)

    for (const item of data) {
      const docRef = doc(db, collectionName, item.id)
      batch.set(docRef, item)
    }

    await batch.commit()
    console.log(`Collection ${collectionName} seeded successfully!`)
    return { success: true }
  } catch (error) {
    console.error(`Error seeding collection ${collectionName}:`, error)
    return { success: false, error }
  }
}

// Export sample data for use elsewhere
export { sampleUsers, sampleResources, sampleBoards, sampleEvents, sampleLocations, samplePosts, sampleReviews }
