// ─── Personalization Directives ──────────────────────────────────────────────
// Concrete behavioral instructions for the AI based on family learning styles and philosophies.
// These tell the AI HOW to adapt lessons, not just what the family prefers.

export const LEARNING_STYLE_DIRECTIVES: Record<string, string> = {
  Visual:
    "Prioritize diagrams, charts, color-coded materials, infographics, and visual organizers. Recommend illustrated books and video resources. Use visual metaphors in explanations. Include drawing and labeling activities.",
  Auditory:
    "Include read-alouds, audiobooks, discussion-based activities, songs, rhymes, and podcasts. Use verbal repetition and storytelling. Suggest narration exercises where the child explains concepts back to the parent.",
  Kinesthetic:
    "Emphasize hands-on activities, manipulatives, experiments, movement-based learning, and physical exploration. Include building, crafting, and tactile projects. Suggest body-movement games to reinforce concepts.",
  "Reading/Writing":
    "Focus on reading passages, journaling, written responses, copywork, note-taking, and written reports. Include vocabulary-rich content. Suggest keeping a learning journal or lapbook.",
  "Visual & Hands-On":
    "Combine visual aids (charts, diagrams, color-coding) with tactile activities (building models, art projects, experiments). Use illustrated step-by-step instructions for hands-on work.",
  "Auditory & Kinesthetic":
    "Pair verbal instruction and discussion with movement and physical exploration. Include songs with actions, dramatic re-enactments, and talk-while-doing activities. Use rhythm and repetition.",
  Multimodal:
    "Blend visual, auditory, and kinesthetic approaches in every lesson. Offer multiple pathways to learn each concept — watch, listen, discuss, and do. Vary activity types across sections.",
}

export const PHILOSOPHY_DIRECTIVES: Record<string, string> = {
  "Charlotte Mason":
    "Use living books (real literature, not textbooks) as primary resources. Include nature study and outdoor observation. Use narration (child retells what they learned) instead of fill-in-the-blank. Keep lessons short and focused (15-20 min for young children, 30-45 min for older). Include copywork, picture study, and hymn/poetry memorization. Recommend specific living books by title.",
  Classical:
    "Structure around the trivium stages: Grammar (K-5: memorization, chanting, facts), Logic (6-8: analysis, reasoning, connections), Rhetoric (9-12: persuasion, synthesis, original thought). Include memory work, Latin roots, timeline activities, Socratic questioning, and classical literature. Recommend primary source texts.",
  Montessori:
    "Design self-directed activities with clear instructions the child can follow independently. Use manipulatives and hands-on sensorial materials. Organize by prepared environment zones. Allow the child to work at their own pace. Include practical life skills. Recommend Montessori-specific materials (golden beads, sandpaper letters, etc.).",
  Waldorf:
    "Integrate artistic expression into every lesson — drawing, painting, modeling, movement. Use storytelling as the primary teaching method. Follow seasonal and nature rhythms. Delay abstract academics for younger children, focusing on imaginative play and handwork. Include circle time, verse, and song.",
  Unschooling:
    "Follow the child's curiosity and natural interests as the guide. Suggest real-world applications and experiences. Frame learning as exploration, not instruction. Offer resources and provocations rather than assignments. Include field trips, apprenticeship-style activities, and open-ended projects.",
  Eclectic:
    "Blend the best approaches from multiple philosophies based on the subject and the child's needs. Mix structured curriculum with interest-led exploration. Be flexible — use textbooks where helpful, living books where engaging, and hands-on projects where memorable.",
  Traditional:
    "Follow a structured, sequential curriculum with clear learning objectives, textbook-based content, and regular assessments. Include worksheets, quizzes, and graded assignments. Organize by subject periods with defined schedules.",
  "Unit Study":
    "Integrate multiple subjects (math, science, language arts, history, art) around a single unifying theme or topic. Build a cohesive multi-day unit where each activity connects back to the central theme. Include a culminating project.",
  "Nature-Based":
    "Center lessons around outdoor exploration, nature observation, and environmental science. Include nature journals, field guides, specimen collection, weather tracking, and gardening. Connect academic subjects to natural phenomena.",
  "Hands-On Learning":
    "Lead with experiments, projects, building, crafting, and physical activities. Minimize passive reading — every concept should be experienced through doing. Include maker projects, STEM challenges, and interactive demonstrations.",
  "Project-Based":
    "Structure lessons around meaningful, multi-step projects with real-world applications. Include planning, research, creation, and presentation phases. Encourage the child to solve authentic problems and share their work.",
  "Literature-Based":
    "Use quality children's literature as the foundation for all subjects. Choose books that naturally teach concepts (historical fiction for history, nature stories for science). Include reading comprehension, vocabulary, and creative writing tied to the literature.",
  "STEM-Focused":
    "Emphasize science, technology, engineering, and math through experiments, coding activities, engineering challenges, and mathematical problem-solving. Include the scientific method, data collection, and logical reasoning. Recommend STEM kits and tools.",
  "Reggio Emilia":
    "Position the child as a capable, active learner. Use documentation (photos, journals, displays) to make learning visible. Provide open-ended materials and provocations. Encourage collaborative exploration and long-term projects driven by the child's questions.",
}

/**
 * Build compact personalization directives for AI prompts.
 * Kept short to avoid exceeding Groq/Llama context limits.
 */
export function buildPersonalizationDirectives(
  learningStyle?: string,
  philosophy?: string[],
  values?: string[],
  interests?: string[],
): string {
  const parts: string[] = []

  if (learningStyle && LEARNING_STYLE_DIRECTIVES[learningStyle]) {
    // Extract just the first sentence for brevity
    const brief = LEARNING_STYLE_DIRECTIVES[learningStyle].split(". ").slice(0, 2).join(". ") + "."
    parts.push(`Learning style (${learningStyle}): ${brief}`)
  }

  if (philosophy && philosophy.length > 0) {
    // Only include the first philosophy's directive (condensed) to save tokens
    const primary = philosophy[0]
    if (PHILOSOPHY_DIRECTIVES[primary]) {
      const brief = PHILOSOPHY_DIRECTIVES[primary].split(". ").slice(0, 2).join(". ") + "."
      parts.push(`Philosophy (${philosophy.join(", ")}): ${brief}`)
    }
  }

  if (values && values.length > 0) {
    parts.push(`Values: Weave ${values.join(", ")} into discussions and activities naturally.`)
  }

  if (interests && interests.length > 0) {
    parts.push(`Interests: Use ${interests.join(", ")} as engagement hooks in examples and activities.`)
  }

  if (parts.length === 0) return ""

  return `PERSONALIZATION:\n${parts.join("\n")}`
}
