import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { User, FileText, Target, Settings, ArrowRight } from "lucide-react";

const mockUser = {
  name: "Aarav Sharma",
  email: "aarav@nitkkr.ac.in",
  branch: "CSE",
  graduationYear: 2026,
  cgpa: 8.7,
  interviewCount: 3,
  skills: ["React", "Node.js", "Python", "SQL", "Machine Learning"],
};

const recentExperiences = [
  { company: "Google", role: "SDE Intern", difficulty: "Hard", date: "Feb 2026" },
  { company: "Microsoft", role: "SDE 1", difficulty: "Medium", date: "Jan 2026" },
  { company: "Flipkart", role: "SDE Intern", difficulty: "Medium", date: "Dec 2025" },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back, {mockUser.name}</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "CGPA", value: mockUser.cgpa.toString(), icon: Target },
            { label: "Branch", value: mockUser.branch, icon: User },
            { label: "Experiences", value: mockUser.interviewCount.toString(), icon: FileText },
            { label: "Grad Year", value: mockUser.graduationYear.toString(), icon: Settings },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                <div className="font-display text-lg font-semibold text-foreground">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Skills */}
          <div className="glass-card p-6">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {mockUser.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Recent Experiences */}
          <div className="glass-card p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-foreground">My Experiences</h2>
              <Link to="/post-experience" className="text-xs text-primary hover:underline flex items-center gap-1">
                Post New <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentExperiences.map((exp, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                  <div>
                    <div className="text-sm font-medium text-foreground">{exp.company}</div>
                    <div className="text-xs text-muted-foreground">{exp.role}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      exp.difficulty === "Hard" ? "bg-destructive/10 text-destructive" :
                      exp.difficulty === "Medium" ? "bg-warning/10 text-warning" :
                      "bg-success/10 text-success"
                    }`}>
                      {exp.difficulty}
                    </span>
                    <span className="text-xs text-muted-foreground">{exp.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <Link to="/eligibility" className="glass-card p-5 hover:border-primary/30 transition-colors group">
            <Target className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-display font-semibold text-foreground text-sm">Check Eligibility</h3>
            <p className="text-xs text-muted-foreground mt-1">Find companies matching your profile</p>
          </Link>
          <Link to="/companies" className="glass-card p-5 hover:border-primary/30 transition-colors group">
            <FileText className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-display font-semibold text-foreground text-sm">Browse Companies</h3>
            <p className="text-xs text-muted-foreground mt-1">Explore interview patterns</p>
          </Link>
          <Link to="/post-experience" className="glass-card p-5 hover:border-primary/30 transition-colors group">
            <User className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-display font-semibold text-foreground text-sm">Share Experience</h3>
            <p className="text-xs text-muted-foreground mt-1">Help others prepare better</p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
