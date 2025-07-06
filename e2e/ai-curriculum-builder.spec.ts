import { test, expect } from "@playwright/test"

test.describe("AI Curriculum Builder E2E Flow", () => {
  test("should allow a user to complete the research and generation phases", async ({ page }) => {
    // Step 1: Navigate to the planner page
    await page.goto("/planner")

    // Step 2: Click on the "AI Curriculum Builder" tab
    await page.getByRole("tab", { name: "AI Curriculum Builder" }).click()

    // --- Research Phase ---
    await expect(page.getByRole("heading", { name: /Step 1: Research/i })).toBeVisible()

    // Step 3: Fill out the research form
    await page.getByLabel("Subject").click()
    await page.getByRole("option", { name: "History" }).click()

    await page.getByLabel("Grade Level").click()
    await page.getByRole("option", { name: "Grade 8" }).click()

    await page.getByLabel("Key Topics or Interests").fill("The American Civil War")

    // Step 4: Start the research
    // Mock the API response to avoid actual AI calls in tests
    await page.route("**/api/ai/research", async (route) => {
      const json = [
        {
          title: "Civil War Overview - History.com",
          url: "https://history.com/civil-war",
          snippet: "An overview of the American Civil War.",
        },
        {
          title: "Khan Academy - The Civil War",
          url: "https://khanacademy.org/humanities/us-history/civil-war-era",
          snippet: "Lessons and articles about the Civil War.",
        },
      ]
      await route.fulfill({ json })
    })

    await page.getByRole("button", { name: "Start Research" }).click()

    // --- Generation Phase ---
    // Step 5: Verify transition to the generation phase
    await expect(page.getByRole("heading", { name: /Step 2: Generate/i })).toBeVisible()

    // Check if research summary is displayed correctly
    await expect(page.getByText(/Based on your query for/)).toContainText("History")
    await expect(page.getByText(/Based on your query for/)).toContainText("Grade 8")
    await expect(page.getByText(/we found 2 relevant resources/)).toBeVisible()
    await expect(page.getByRole("link", { name: /Civil War Overview/i })).toBeVisible()

    // Step 6: Fill out the generation form
    await page.getByLabel("Child's Name").fill("Alex")

    await page.getByLabel("Curriculum Duration").click()
    await page.getByRole("option", { name: "Semester (18 weeks)" }).click()

    // Step 7: Generate the curriculum
    // Mock the generation API response
    await page.route("**/api/ai/generate-curriculum", async (route) => {
      const json = {
        title: "A Semester on the American Civil War for Alex",
        description:
          "A detailed 18-week curriculum exploring the causes, events, and consequences of the American Civil War.",
        objectives: [
          "Understand the main causes of the war.",
          "Identify key figures and battles.",
          "Analyze the impact of the Emancipation Proclamation.",
        ],
        lessons: [
          {
            title: "Week 1: A Nation Divided",
            description: "Introduction to the pre-war tensions, states' rights, and slavery.",
          },
          {
            title: "Week 2: The First Shots",
            description: "The election of Lincoln and the secession of Southern states.",
          },
        ],
      }
      await route.fulfill({ json })
    })

    await page.getByRole("button", { name: "Generate Curriculum" }).click()

    // --- Final Result ---
    // Step 8: Verify the generated curriculum is displayed
    await expect(page.getByRole("heading", { name: /A Semester on the American Civil War for Alex/i })).toBeVisible()
    await expect(page.getByText("Understand the main causes of the war.")).toBeVisible()
    await expect(page.getByText("Week 1: A Nation Divided")).toBeVisible()
    await expect(page.getByRole("button", { name: "Save to Planner" })).toBeVisible()
  })
})
