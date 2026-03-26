import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { saveEligibilityCheck, logUserActivity } from "@/lib/historyService";
import { fetchAllCompanies } from "@/lib/companyService";
import { Target, CheckCircle, XCircle, AlertTriangle, Loader } from "lucide-react";

const allBranches = ["CSE", "ECE", "ME", "CE", "EE", "IT", "PIE", "CHE"];
const allSkills = ["DSA", "System Design", "React", "Node.js", "Python", "Java", "SQL", "OOP", "ML", "Puzzles", "C++", "Database Management", "Financial Markets Knowledge", "Analytics", "Business Acumen", "Communication", "Leadership", "Presentation"];

const EligibilityChecker = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cgpa, setCgpa] = useState("");
  const [branch, setBranch] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [results, setResults] = useState<any[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const checkEligibility = async (e: React.FormEvent) => {
    e.preventDefault();
    const cgpaVal = parseFloat(cgpa);

    try {
      setLoading(true);
      
      // Fetch companies from Supabase
      const companies = await fetchAllCompanies();

      const res = companies.map((company) => {
        const cgpaMatch = cgpaVal >= company.min_cgpa;
        const branchMatch = company.eligible_branches.includes(branch);
        
        // Calculate skill match percentage
        const matchedSkills = company.required_skills.filter((s: string) => skills.includes(s));
        const skillMatch = company.required_skills.length > 0 
          ? (matchedSkills.length / company.required_skills.length) * 100 
          : 0;
        
        const missingSkills = company.required_skills.filter((s: string) => !skills.includes(s));
        
        // Eligible only if CGPA and branch match
        const eligible = cgpaMatch && branchMatch;
        
        // Overall match score calculation
        const overallMatch = Math.round(
          (skillMatch + (cgpaMatch ? 50 : 0) + (branchMatch ? 50 : 0)) / 2
        );

        return {
          id: company.id,
          name: company.name,
          description: company.description,
          minCgpa: company.min_cgpa,
          minCGPA: company.min_cgpa, // Keep both for compatibility
          branches: company.eligible_branches,
          eligible_branches: company.eligible_branches,
          skills: company.required_skills,
          selection_rounds: company.selection_rounds,
          cgpaMatch,
          branchMatch,
          skillMatch: Math.round(skillMatch),
          missingSkills,
          eligible,
          overallMatch,
        };
      });

      // Sort by eligibility first, then by overall match
      res.sort((a, b) => {
        if (a.eligible !== b.eligible) {
          return a.eligible ? -1 : 1; // Eligible first
        }
        return b.overallMatch - a.overallMatch;
      });

      setResults(res);
      setLoading(false);

      // Save the check result to database if user is logged in
      if (user?.id) {
        setIsSaving(true);
        try {
          const savedCheck = await saveEligibilityCheck(
            user.id,
            cgpaVal,
            branch,
            skills,
            res
          );

          if (savedCheck) {
            // Log the activity
            await logUserActivity(
              user.id,
              "eligibility_check",
              `Checked eligibility for ${branch} branch with CGPA ${cgpaVal}`,
              savedCheck.id
            );
          }
        } catch (err) {
          console.error("Error saving eligibility check:", err);
        } finally {
          setIsSaving(false);
        }
      }
    } catch (err) {
      console.error("Error checking eligibility:", err);
      setLoading(false);
    }
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
            disabled={isSaving || loading}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" /> Loading companies...
              </>
            ) : (
              <>
                <Target className="h-4 w-4" /> {isSaving ? "Saving..." : "Check Eligibility"}
              </>
            )}
          </button>
        </form>

        {results && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Results</h2>
              <span className="text-xs text-muted-foreground">
                {results.filter(r => r.eligible).length} eligible • {results.length} total
              </span>
            </div>

            {results.map((r, i) => (
              <div
                key={i}
                className={`glass-card p-5 border-l-4 transition-all ${
                  r.eligible
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-destructive/50 bg-destructive/5"
                }`}
              >
                {/* Header with company name and match score */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {r.eligible ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <h3 className="font-display font-semibold text-foreground text-sm">{r.name}</h3>
                      {r.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-lg font-bold ${
                        r.overallMatch >= 70
                          ? "text-emerald-500"
                          : r.overallMatch >= 40
                          ? "text-amber-500"
                          : "text-destructive"
                      }`}
                    >
                      {r.overallMatch}%
                    </div>
                    <p className="text-xs text-muted-foreground">match</p>
                  </div>
                </div>

                {/* Criteria status */}
                <div className="grid grid-cols-3 gap-3 mb-3 p-3 bg-background/50 rounded-lg">
                  {/* CGPA Check */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Min CGPA</p>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-sm font-semibold ${
                          r.cgpaMatch ? "text-emerald-500" : "text-destructive"
                        }`}
                      >
                        {r.minCgpa}
                      </span>
                      {r.cgpaMatch ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </div>

                  {/* Branch Check */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Branch</p>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-sm font-semibold ${
                          r.branchMatch ? "text-emerald-500" : "text-destructive"
                        }`}
                      >
                        {r.branchMatch ? "✓" : "✗"}
                      </span>
                      {r.branchMatch ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </div>

                  {/* Skill Match Percentage */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Skills Match</p>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-sm font-semibold ${
                          r.skillMatch >= 70
                            ? "text-emerald-500"
                            : r.skillMatch >= 40
                            ? "text-amber-500"
                            : "text-destructive"
                        }`}
                      >
                        {r.skillMatch}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selection Rounds if available */}
                {r.selection_rounds && r.selection_rounds.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Selection Process:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {r.selection_rounds.map((round: string) => (
                        <span
                          key={round}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                        >
                          {round}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Eligibility Status and Missing Skills */}
                <div className="border-t border-border/30 pt-2">
                  {!r.eligible && (
                    <div className="flex items-start gap-2 mb-2 p-2 bg-destructive/10 rounded">
                      <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-destructive">
                        {!r.cgpaMatch && !r.branchMatch ? (
                          <span>
                            Not eligible: CGPA {cgpa} is below minimum ({r.minCgpa}) and branch {branch} is not
                            eligible
                          </span>
                        ) : !r.cgpaMatch ? (
                          <span>Not eligible: CGPA {cgpa} is below minimum ({r.minCgpa})</span>
                        ) : (
                          <span>Not eligible: Branch {branch} is not in eligible branches</span>
                        )}
                      </div>
                    </div>
                  )}

                  {r.missingSkills.length > 0 && (
                    <div className="flex items-start gap-2 p-2 bg-amber-500/10 rounded">
                      <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-600">
                        <span className="font-medium">Missing skills: </span>
                        {r.missingSkills.join(", ")}
                      </div>
                    </div>
                  )}

                  {r.eligible && r.missingSkills.length === 0 && (
                    <div className="text-xs text-emerald-600 p-2 bg-emerald-500/10 rounded font-medium">
                      ✓ You meet all criteria for this company!
                    </div>
                  )}

                  {r.eligible && r.missingSkills.length > 0 && (
                    <div className="text-xs text-emerald-600 p-2 bg-emerald-500/10 rounded font-medium">
                      ✓ Eligible! Consider learning: {r.missingSkills.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default EligibilityChecker;
