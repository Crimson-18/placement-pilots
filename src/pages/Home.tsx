import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Star, MessageSquare, ArrowBigUp, ArrowBigDown, Clock, TrendingUp, Flame, Filter } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type SortType = "hot" | "new" | "top";

const mockPosts = [
  {
    id: 1,
    user: "Aarav Sharma",
    branch: "CSE",
    year: 2026,
    avatar: "AS",
    company: "Google",
    role: "SDE Intern",
    difficulty: "Hard",
    rating: 4.5,
    date: "2 hours ago",
    rounds: ["Online Assessment", "Technical Round 1 (DSA)", "Technical Round 2 (System Design)", "HR Round"],
    tips: "Focus on graph problems and dynamic programming. Practice system design basics even for intern roles. The interviewers were friendly but expected optimal solutions.",
    upvotes: 142,
    comments: 23,
    tags: ["DSA", "System Design", "Graphs"],
  },
  {
    id: 2,
    user: "Priya Verma",
    branch: "ECE",
    year: 2026,
    avatar: "PV",
    company: "Microsoft",
    role: "SDE 1",
    difficulty: "Medium",
    rating: 4.2,
    date: "5 hours ago",
    rounds: ["Online Assessment", "Technical Round 1", "Technical Round 2", "Technical Round 3", "HR"],
    tips: "They focus a lot on OOP concepts and real-world scenarios. Be ready for behavioral questions. Practice medium-level LeetCode problems consistently.",
    upvotes: 98,
    comments: 15,
    tags: ["OOP", "Behavioral", "LeetCode"],
  },
  {
    id: 3,
    user: "Rahul Kumar",
    branch: "CSE",
    year: 2025,
    avatar: "RK",
    company: "Amazon",
    role: "SDE Intern",
    difficulty: "Medium",
    rating: 3.8,
    date: "1 day ago",
    rounds: ["Online Assessment", "Technical Round 1", "Bar Raiser Round"],
    tips: "Amazon LP questions are very important. Prepare STAR format answers. The bar raiser round was the toughest — they really dig deep into your projects.",
    upvotes: 76,
    comments: 31,
    tags: ["Leadership Principles", "STAR", "Projects"],
  },
  {
    id: 4,
    user: "Sneha Patel",
    branch: "IT",
    year: 2026,
    avatar: "SP",
    company: "Flipkart",
    role: "SDE Intern",
    difficulty: "Medium",
    rating: 4.0,
    date: "1 day ago",
    rounds: ["Online Assessment", "Machine Coding Round", "Technical Interview", "HR"],
    tips: "Machine coding round is unique to Flipkart. Practice building small apps in 90 minutes. They value clean code and good abstractions over just working code.",
    upvotes: 63,
    comments: 12,
    tags: ["Machine Coding", "Clean Code", "React"],
  },
  {
    id: 5,
    user: "Vikram Singh",
    branch: "CSE",
    year: 2025,
    avatar: "VS",
    company: "Goldman Sachs",
    role: "Analyst",
    difficulty: "Hard",
    rating: 3.5,
    date: "2 days ago",
    rounds: ["Aptitude Test", "Technical Round 1", "Technical Round 2", "HR"],
    tips: "Strong focus on core CS fundamentals — OS, DBMS, and Networking. The aptitude section is tricky, practice quantitative reasoning. Don't skip puzzles prep.",
    upvotes: 55,
    comments: 18,
    tags: ["Core CS", "Aptitude", "DBMS"],
  },
  {
    id: 6,
    user: "Ananya Reddy",
    branch: "CSE",
    year: 2026,
    avatar: "AR",
    company: "Adobe",
    role: "Member of Technical Staff",
    difficulty: "Hard",
    rating: 4.7,
    date: "3 days ago",
    rounds: ["Online Test", "Technical Round 1", "Technical Round 2", "Hiring Manager Round"],
    tips: "Adobe loves candidates who can think out loud. Explain your thought process clearly. They asked me to design a mini LRU cache and then extend it. Very design-heavy.",
    upvotes: 121,
    comments: 27,
    tags: ["System Design", "LRU Cache", "Think Aloud"],
  },
  {
    id: 7,
    user: "Kunal Mehta",
    branch: "EE",
    year: 2025,
    avatar: "KM",
    company: "Uber",
    role: "SDE Intern",
    difficulty: "Medium",
    rating: 4.1,
    date: "4 days ago",
    rounds: ["Online Assessment", "Phone Screen", "Onsite (2 rounds)"],
    tips: "Uber's OA was straightforward but the onsite rounds were intense. They focus heavily on problem-solving speed and communication. Mock interviews helped me a lot.",
    upvotes: 44,
    comments: 9,
    tags: ["Speed", "Communication", "Mock Interviews"],
  },
  {
    id: 8,
    user: "Diya Nair",
    branch: "CSE",
    year: 2026,
    avatar: "DN",
    company: "Intuit",
    role: "SDE Intern",
    difficulty: "Easy",
    rating: 4.3,
    date: "5 days ago",
    rounds: ["Online Assessment", "Technical Interview", "Cultural Fit Round"],
    tips: "Intuit is very culture-driven. They want to know how you collaborate and handle ambiguity. Technical questions were medium level — focus on arrays and strings.",
    upvotes: 37,
    comments: 6,
    tags: ["Culture Fit", "Arrays", "Collaboration"],
  },
];

const Home = () => {
  const [sort, setSort] = useState<SortType>("hot");
  const [votes, setVotes] = useState<Record<number, number>>(() =>
    Object.fromEntries(mockPosts.map((p) => [p.id, p.upvotes]))
  );
  const [voted, setVoted] = useState<Record<number, "up" | "down" | null>>({});

  const handleVote = (id: number, dir: "up" | "down") => {
    setVoted((prev) => {
      const current = prev[id];
      const newVoted = { ...prev };
      if (current === dir) {
        newVoted[id] = null;
        setVotes((v) => ({ ...v, [id]: v[id] + (dir === "up" ? -1 : 1) }));
      } else {
        newVoted[id] = dir;
        const delta = dir === "up" ? 1 : -1;
        const revert = current === "up" ? -1 : current === "down" ? 1 : 0;
        setVotes((v) => ({ ...v, [id]: v[id] + delta + revert }));
      }
      return newVoted;
    });
  };

  const sortedPosts = [...mockPosts].sort((a, b) => {
    if (sort === "new") return 0;
    if (sort === "top") return (votes[b.id] ?? 0) - (votes[a.id] ?? 0);
    return (votes[b.id] ?? 0) + b.comments * 2 - ((votes[a.id] ?? 0) + a.comments * 2);
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 max-w-5xl mx-auto">
          {/* Feed */}
          <div>
            {/* Sort Bar */}
            <div className="glass-card p-3 mb-4 flex items-center gap-2">
              <button
                onClick={() => setSort("hot")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  sort === "hot" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Flame className="h-4 w-4" /> Hot
              </button>
              <button
                onClick={() => setSort("new")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  sort === "new" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Clock className="h-4 w-4" /> New
              </button>
              <button
                onClick={() => setSort("top")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  sort === "top" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <TrendingUp className="h-4 w-4" /> Top
              </button>
              <div className="ml-auto">
                <Link
                  to="/post-experience"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  + Share Experience
                </Link>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-3">
              {sortedPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-card flex"
                >
                  {/* Vote Column */}
                  <div className="flex flex-col items-center gap-0.5 px-3 py-4 border-r border-border/50">
                    <button
                      onClick={() => handleVote(post.id, "up")}
                      className={`p-0.5 rounded transition-colors ${
                        voted[post.id] === "up" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <ArrowBigUp className="h-5 w-5" />
                    </button>
                    <span className={`text-xs font-bold ${
                      voted[post.id] === "up" ? "text-primary" : voted[post.id] === "down" ? "text-destructive" : "text-foreground"
                    }`}>
                      {votes[post.id]}
                    </span>
                    <button
                      onClick={() => handleVote(post.id, "down")}
                      className={`p-0.5 rounded transition-colors ${
                        voted[post.id] === "down" ? "text-destructive" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <ArrowBigDown className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                          {post.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{post.user}</span>
                        {" · "}{post.branch} '{post.year.toString().slice(-2)}
                        {" · "}{post.date}
                      </span>
                      <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        post.difficulty === "Hard"
                          ? "bg-destructive/10 text-destructive"
                          : post.difficulty === "Easy"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {post.difficulty}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-base font-semibold text-foreground mb-1">
                      {post.company} — {post.role}
                    </h3>

                    {/* Rounds */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {post.rounds.map((r, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                          {r}
                        </span>
                      ))}
                    </div>

                    {/* Tips */}
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                      {post.tips}
                    </p>

                    {/* Tags & Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        {post.tags.map((tag) => (
                          <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-medium text-foreground">{post.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span className="text-xs">{post.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block space-y-4">
            {/* About */}
            <div className="glass-card p-5">
              <h3 className="font-display text-sm font-bold text-foreground mb-2">About Placement Pilot</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                A verified college placement intelligence platform. Read real interview experiences, check your eligibility, and prepare smarter.
              </p>
              <Link
                to="/post-experience"
                className="block w-full text-center rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Share Your Experience
              </Link>
            </div>

            {/* Top Companies */}
            <div className="glass-card p-5">
              <h3 className="font-display text-sm font-bold text-foreground mb-3">Trending Companies</h3>
              <div className="space-y-2.5">
                {["Google", "Microsoft", "Amazon", "Adobe", "Goldman Sachs"].map((c, i) => (
                  <div key={c} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                    <span className="text-sm text-foreground font-medium">{c}</span>
                    <TrendingUp className="h-3 w-3 text-primary ml-auto" />
                  </div>
                ))}
              </div>
              <Link to="/companies" className="block text-xs text-primary font-medium mt-3 hover:underline">
                View all companies →
              </Link>
            </div>

            {/* Quick Links */}
            <div className="glass-card p-5">
              <h3 className="font-display text-sm font-bold text-foreground mb-3">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/eligibility" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  🎯 Eligibility Checker
                </Link>
                <Link to="/companies" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  🏢 Companies
                </Link>
                <Link to="/experiences" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  📖 All Experiences
                </Link>
                <Link to="/register" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  🚀 Join Now
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Home;
