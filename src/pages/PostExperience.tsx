import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Star } from "lucide-react";

const difficulties = ["Easy", "Medium", "Hard"];

const PostExperience = () => {
  const [form, setForm] = useState({
    company: "",
    role: "",
    difficulty: "Medium",
    rounds: "",
    tips: "",
    strengths: "",
    mistakes: "",
    preparationStrategy: "",
    confidenceLevel: 3,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Post experience:", form);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Post Experience</h1>
          <p className="text-muted-foreground text-sm mt-1">Share your interview experience to help others</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Company</label>
              <input name="company" value={form.company} onChange={handleChange} placeholder="Google" className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Role Offered</label>
              <input name="role" value={form.role} onChange={handleChange} placeholder="SDE Intern" className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Difficulty</label>
              <select name="difficulty" value={form.difficulty} onChange={handleChange} className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                {difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Confidence (1-5)</label>
              <div className="flex gap-1 pt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, confidenceLevel: n })}
                  >
                    <Star className={`h-6 w-6 ${n <= form.confidenceLevel ? "fill-warning text-warning" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Rounds (comma-separated)</label>
            <input name="rounds" value={form.rounds} onChange={handleChange} placeholder="OA, Tech 1, Tech 2, HR" className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tips & Advice</label>
            <textarea name="tips" value={form.tips} onChange={handleChange} rows={3} placeholder="What should others focus on?" className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Strengths</label>
              <textarea name="strengths" value={form.strengths} onChange={handleChange} rows={2} placeholder="What went well?" className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Mistakes</label>
              <textarea name="mistakes" value={form.mistakes} onChange={handleChange} rows={2} placeholder="What could be improved?" className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Preparation Strategy</label>
            <textarea name="preparationStrategy" value={form.preparationStrategy} onChange={handleChange} rows={2} placeholder="How did you prepare?" className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" required />
          </div>

          <button type="submit" className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            Submit Experience
          </button>
        </form>
      </main>
    </div>
  );
};

export default PostExperience;
