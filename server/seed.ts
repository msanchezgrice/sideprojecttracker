import { db } from "./db";
import { projects } from "@shared/schema";

async function seedDatabase() {
  console.log("Seeding database with sample projects...");
  
  const sampleProjects = [
    {
      name: "VibeCRM Dashboard",
      description: "Customer relationship management system with real-time analytics",
      status: "active" as const,
      progress: 87,
      monthlyCost: 24700, // $247.00 in cents
      aiUpdates: 3,
      githubUrl: "https://github.com/vibecodehq/vibecrm",
      liveUrl: "https://vibecrm.doodad.ai",
      docsUrl: "https://docs.vibecrm.com",
    },
    {
      name: "AI Content Generator",
      description: "Automated blog post and social media content creation tool",
      status: "paused" as const,
      progress: 65,
      monthlyCost: 8900, // $89.00 in cents
      aiUpdates: 0,
      githubUrl: "https://github.com/vibecodehq/ai-content",
      liveUrl: null,
      docsUrl: null,
    },
    {
      name: "Expense Tracker Mobile",
      description: "React Native app for personal finance management",
      status: "active" as const,
      progress: 42,
      monthlyCost: 12700, // $127.00 in cents
      aiUpdates: 0,
      githubUrl: "https://github.com/vibecodehq/expense-tracker",
      liveUrl: "https://expense-tracker-demo.netlify.app",
      docsUrl: null,
    },
    {
      name: "E-commerce Analytics",
      description: "Real-time sales dashboard with predictive insights",
      status: "blocked" as const,
      progress: 28,
      monthlyCost: 15600, // $156.00 in cents
      aiUpdates: 0,
      githubUrl: "https://github.com/vibecodehq/ecommerce-analytics",
      liveUrl: null,
      docsUrl: null,
    },
    {
      name: "Portfolio Website v3",
      description: "Personal portfolio with interactive animations and modern design",
      status: "planning" as const,
      progress: 15,
      monthlyCost: 1200, // $12.00 in cents
      aiUpdates: 0,
      githubUrl: null,
      liveUrl: null,
      docsUrl: null,
    },
  ];

  try {
    // Clear existing data
    await db.delete(projects);
    
    // Insert sample projects
    await db.insert(projects).values(sampleProjects);
    
    console.log("✅ Database seeded successfully with sample projects!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0));
}

export { seedDatabase };