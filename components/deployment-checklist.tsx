export function DeploymentChecklist() {
  const items = [
    {
      id: "env",
      name: "Environment Variables",
      description: "All required environment variables are set",
      status: "pending",
    },
    {
      id: "auth",
      name: "Authentication",
      description: "Sign in, sign up, and protected routes work correctly",
      status: "pending",
    },
    { id: "api", name: "API Routes", description: "All API routes return expected responses", status: "pending" },
    { id: "db", name: "Database", description: "Database connections and queries work correctly", status: "pending" },
    { id: "storage", name: "Storage", description: "File uploads and downloads work correctly", status: "pending" },
    { id: "ui", name: "UI Components", description: "All UI components render correctly", status: "pending" },
    {
      id: "responsive",
      name: "Responsive Design",
      description: "Application works on all device sizes",
      status: "pending",
    },
    { id: "perf", name: "Performance", description: "Application loads and responds quickly", status: "pending" },
    { id: "a11y", name: "Accessibility", description: "Application is accessible to all users", status: "pending" },
    { id: "seo", name: "SEO", description: "All pages have appropriate meta tags", status: "pending" },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Deployment Checklist</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">{item.name}</span>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  item.status === "complete"
                    ? "bg-green-100 text-green-800"
                    : item.status === "in-progress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {item.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
