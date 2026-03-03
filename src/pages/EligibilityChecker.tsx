import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Target, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const mockCompanies = [
  { name: "Google", minCGPA: 8.0, branches: ["CSE", "IT", "ECE"], skills: ["DSA", "System Design", "React"] },
  { name: "Microsoft", minCGPA: 7.5, branches: ["CSE", "IT", "ECE", "EE"], skills: ["DSA", "OOP", "SQL"] },
  { name: "Amazon", minCGPA: 7.0, branches: ["CSE", "IT"], skills: ["DSA", "System Design"] },
  { name: "Goldman Sachs", minCGPA: 8.5, branches: ["CSE", "IT", "ECE", "EE", "ME"], skills: ["DSA", "Puzzles", "Java"] },
  { name: "Flipkart", minCGPA: 7.0, branches: ["CSE", "IT", "ECE"], skills: ["DSA", "System Design", "React"] },
  { name: "Uber", minCGPA: 7.5, branches: ["CSE", "IT"], skills: ["DSA", "System Design", "Python"] },
];

const allBranches = ["CSE", "ECE", "ME", "CE", "EE", "IT", "PIE", "CHE"];
const allSkills = ["DSA", "System Design", "React", "Node.js", "Python", "Java", "SQL", "OOP", "ML", "Puzzles"];

const EligibilityChecker = () => {
  const [cgpa, setCgpa] = useState("");
  const [branch, setBranch] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [results, setResults] = useState<any[] | null>(null);

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const checkEligibility = (e: React.FormEvent) => {
    e.preventDefault();
    const cgpaVal = parseFloat(cgpa);

    const res = mockCompanies.map((company) => {
      const cgpaMatch = cgpaVal >= company.minCGPA;
      const branchMatch = company.branches.includes(branch);
      const matchedSkills = company.skills.filter((s) => skills.includes(s));
      const skillMatch = company.skills.length > 0 ? (matchedSkills.length / company.skills.length) * 100 : 0;
      const missingSkills = company.skills.filter((s) => !skills.includes(s));
      const eligible = cgpaMatch && branchMatch;
      const overallMatch = Math.round((skillMatch + (cgpaMatch ? 50 : 0) + (branchMatch ? 50 : 0)) / 2);

      return { ...company, cgpaMatch, branchMatch, skillMatch: Math.round(skillMatch), missingSkills, eligible, overallMatch };
    });

    res.sort((a, b) => b.overallMatch - a.overallMatch);
    setResults(res);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-3xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Eligibility Checker</h1>
          <p className="text-muted-foreground text-sm mt-1">Find companies that match your profile</p>
        </div>

        <form onSubmit={checkEligibility} className="glass-card p-6 space-y-5 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">CGPA</label>
              <input
                type="number"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                placeholder="8.5"
                step="0.01"
                min="0"
                max="10"
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select</option>
                {allBranches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Skills</label>
            <div className="flex flex-wrap gap-2">
              {allSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    skills.includes(skill)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Target className="h-4 w-4" /> Check Eligibility
          </button>
        </form>

        {results && (
          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">Results</h2>
            {results.map((r, i) => (
              <div key={i} className={`glass-card p-4 ${r.eligible ? "border-success/20" : "border-destructive/10"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {r.eligible ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    <h3 className="font-display font-semibold text-foreground">{r.name}</h3>
                  </div>
                  <span className={`text-sm font-semibold ${r.overallMatch >= 70 ? "text-success" : r.overallMatch >= 40 ? "text-warning" : "text-destructive"}`}>
                    {r.overallMatch}% match
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground mb-2">
                  <span className={r.cgpaMatch ? "text-success" : "text-destructive"}>
                    CGPA: {r.minCGPA} min {r.cgpaMatch ? "✓" : "✗"}
                  </span>
                  <span className={r.branchMatch ? "text-success" : "text-destructive"}>
                    Branch {r.branchMatch ? "✓" : "✗"}
                  </span>
                  <span>Skill match: {r.skillMatch}%</span>
                </div>
                {r.missingSkills.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="h-3 w-3 text-warning" />
                    <span className="text-muted-foreground">Missing: {r.missingSkills.join(", ")}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default EligibilityChecker;
