import Navbar from "@/components/Navbar";
import { Star, MessageSquare } from "lucide-react";

const mockExperiences = [
  {
    id: 1, user: "Aarav Sharma", company: "Google", role: "SDE Intern", difficulty: "Hard",
    rounds: ["Online Assessment", "Technical Round 1 (DSA)", "Technical Round 2 (System Design)", "HR Round"],
    tips: "Focus on graph problems and dynamic programming. Practice system design basics even for intern roles.",
    strengths: "Strong DSA fundamentals, clear communication",
    mistakes: "Took too long on the second question in OA",
    preparationStrategy: "3 months of LeetCode daily + mock interviews",
    rating: 4.5, date: "Feb 2026",
  },
  {
    id: 2, user: "Priya Verma", company: "Microsoft", role: "SDE 1", difficulty: "Medium",
    rounds: ["Online Assessment", "Technical Round 1", "Technical Round 2", "Technical Round 3", "HR"],
    tips: "They focus a lot on OOP concepts and real-world scenarios. Be ready for behavioral questions.",
    strengths: "Good problem-solving approach, asked clarifying questions",
    mistakes: "Could have optimized the solution in round 2",
    preparationStrategy: "Striver's SDE sheet + CS fundamentals revision",
    rating: 4.2, date: "Jan 2026",
  },
  {
    id: 3, user: "Rahul Kumar", company: "Amazon", role: "SDE Intern", difficulty: "Medium",
    rounds: ["Online Assessment", "Technical Round 1", "Bar Raiser Round"],
    tips: "Amazon LP questions are very important. Prepare STAR format answers.",
    strengths: "LP answers were strong, coded efficiently",
    mistakes: "Didn't think about edge cases initially",
    preparationStrategy: "LeetCode + Amazon tagged questions + LP prep",
    rating: 3.8, date: "Dec 2025",
  },
];

const Experiences = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-3xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Interview Experiences</h1>
          <p className="text-muted-foreground text-sm mt-1">Learn from real placement interviews</p>
        </div>

        <div className="space-y-4">
          {mockExperiences.map((exp) => (
            <div key={exp.id} className="glass-card p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{exp.company} — {exp.role}</h3>
                  <p className="text-xs text-muted-foreground">by {exp.user} · {exp.date}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    exp.difficulty === "Hard" ? "bg-destructive/10 text-destructive" :
                    exp.difficulty === "Medium" ? "bg-warning/10 text-warning" :
                    "bg-success/10 text-success"
                  }`}>
                    {exp.difficulty}
                  </span>
                  <div className="flex items-center gap-0.5 ml-2">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    <span className="text-xs font-medium text-foreground">{exp.rating}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Rounds</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {exp.rounds.map((r, i) => (
                      <span key={i} className="rounded bg-secondary px-2.5 py-1 text-xs text-foreground">{r}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Tips</h4>
                  <p className="text-sm text-foreground/80">{exp.tips}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h4 className="text-xs font-medium text-success/80 uppercase tracking-wider mb-1">Strengths</h4>
                    <p className="text-xs text-muted-foreground">{exp.strengths}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-destructive/80 uppercase tracking-wider mb-1">Mistakes</h4>
                    <p className="text-xs text-muted-foreground">{exp.mistakes}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Preparation</h4>
                  <p className="text-xs text-muted-foreground">{exp.preparationStrategy}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Experiences;
