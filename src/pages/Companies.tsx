import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Search, Building2, ArrowRight } from "lucide-react";

const mockCompanies = [
  { id: "1", name: "Google", minCGPA: 8.0, branches: ["CSE", "IT", "ECE"], pattern: "OA → 2 Tech → HR", lastYear: 2025, experiences: 24 },
  { id: "2", name: "Microsoft", minCGPA: 7.5, branches: ["CSE", "IT", "ECE", "EE"], pattern: "OA → 3 Tech → HR", lastYear: 2025, experiences: 31 },
  { id: "3", name: "Amazon", minCGPA: 7.0, branches: ["CSE", "IT"], pattern: "OA → 2 Tech → Bar Raiser", lastYear: 2025, experiences: 18 },
  { id: "4", name: "Flipkart", minCGPA: 7.0, branches: ["CSE", "IT", "ECE"], pattern: "OA → 2 Tech → HR", lastYear: 2024, experiences: 12 },
  { id: "5", name: "Goldman Sachs", minCGPA: 8.5, branches: ["CSE", "IT", "ECE", "EE", "ME"], pattern: "OA → Tech → Fit", lastYear: 2025, experiences: 9 },
  { id: "6", name: "Uber", minCGPA: 7.5, branches: ["CSE", "IT"], pattern: "OA → 2 Tech → HM", lastYear: 2024, experiences: 7 },
];

const Companies = () => {
  const [search, setSearch] = useState("");

  const filtered = mockCompanies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Companies</h1>
            <p className="text-muted-foreground text-sm mt-1">Browse placement companies and their interview patterns</p>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies..."
            className="w-full rounded-lg border border-border bg-secondary pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((company) => (
            <Link
              key={company.id}
              to={`/companies/${company.id}`}
              className="glass-card p-5 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{company.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-3">{company.pattern}</p>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-muted-foreground">Min CGPA: <span className="text-foreground font-medium">{company.minCGPA}</span></span>
                <span className="text-muted-foreground">{company.experiences} experiences</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {company.branches.map((b) => (
                  <span key={b} className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{b}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Companies;
