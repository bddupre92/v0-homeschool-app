export function ResourceStructuredData({ resource }: { resource: any }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: resource.title,
    description: resource.description,
    learningResourceType: resource.type,
    educationalLevel: resource.gradeLevel,
    author: {
      "@type": "Person",
      name: resource.author || "Unknown",
    },
    dateCreated: resource.createdAt,
    url: `https://atozfamily.org/resources/${resource.id}`,
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
}

export function EventStructuredData({ event }: { event: any }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    location: {
      "@type": "Place",
      name: event.location.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: event.location.city,
        addressRegion: event.location.state,
        postalCode: event.location.zipCode,
        addressCountry: "US",
      },
    },
    organizer: {
      "@type": "Person",
      name: event.organizerName,
    },
    url: `https://atozfamily.org/community/events/${event.id}`,
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
}
