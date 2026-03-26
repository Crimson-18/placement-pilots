import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Search, Building2, ArrowRight, Loader } from "lucide-react";
import { fetchAllCompanies } from "@/lib/companyService";
import type { Company } from "@/lib/companyService";

const Companies = () => {
  const [search, setSearch] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAllCompanies();
        setCompanies(data);
      } catch (err) {
        console.error("Error loading companies:", err);
        setError("Failed to load companies. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  const filtered = companies.filter((c) =>
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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="h-8 w-8 text-primary animate-spin mb-3" />
            <p className="text-muted-foreground">Loading companies...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-destructive">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground">No companies found</p>
          </div>
        ) : (
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
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  {company.selection_rounds.join(" → ")}
                </p>
                <div className="flex items-center gap-3 text-xs mb-3">
                  <span className="text-muted-foreground">Min CGPA: <span className="text-foreground font-medium">{company.min_cgpa}</span></span>
                </div>
                
                {/* Branches */}
                <div className="mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Branches:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {company.eligible_branches.map((branch) => (
                      <span key={branch} className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{branch}</span>
                    ))}
                  </div>
                </div>

                {/* Required Skills */}
                {company.required_skills && company.required_skills.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Skills Required:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {company.required_skills.map((skill) => (
                        <span key={skill} className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary font-medium">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Companies;
