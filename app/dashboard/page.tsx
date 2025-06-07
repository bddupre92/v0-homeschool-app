import AICurriculumBuilder from "@/components/ai-curriculum-builder"

export default function Dashboard() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* existing cards - placeholder for now */}
        <div>Card 1</div>
        <div>Card 2</div>
        <div>Card 3</div>
        <AICurriculumBuilder />
      </div>
    </main>
  )
}
