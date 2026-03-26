import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Star, MessageSquare, Clock, TrendingUp, Flame, Filter, Heart, Repeat, Share2, MoreHorizontal, Loader, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAllExperiences, deleteExperiencePost, toggleLike, checkIfUserLiked } from "@/lib/experienceService";
import { useAuth } from "@/context/AuthContext";

type SortType = "hot" | "new" | "top";

interface Experience {
  id: string;
  user_id: string;
  company: string;
  role: string;
  difficulty: string;
  rounds: string[];
  tips: string;
  preparation_strategy: string;
  confidence_level: number | null;
  likes?: number;
  created_at: string;
  verified: boolean;
}

const Home = () => {
  const { user } = useAuth();
  const [sort, setSort] = useState<SortType>("hot");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [likingId, setLikingId] = useState<string | null>(null);

  useEffect(() => {
    const loadExperiences = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllExperiences();
        setExperiences(data);
        // Initialize likes from database
        const initialLikes: Record<string, number> = {};
        data.forEach((exp) => {
          initialLikes[exp.id] = exp.likes || 0;
        });
        setLikes(initialLikes);

        // Check which posts current user has liked
        if (user?.id) {
          const initialLiked: Record<string, boolean> = {};
          for (const exp of data) {
            const hasLiked = await checkIfUserLiked(exp.id, user.id);
            initialLiked[exp.id] = hasLiked;
          }
          setLiked(initialLiked);
        }
      } catch (err) {
        console.error("Error loading experiences:", err);
        setError("Failed to load experiences. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadExperiences();
  }, [user?.id]);

  const handleLike = async (id: string) => {
    if (!user?.id) {
      alert("Please log in to like posts");
      return;
    }

    try {
      setLikingId(id);
      const isCurrentlyLiked = !!liked[id];
      
      // Update UI optimistically
      setLiked((prev) => ({
        ...prev,
        [id]: !isCurrentlyLiked,
      }));
      setLikes((l) => ({
        ...l,
        [id]: l[id] + (isCurrentlyLiked ? -1 : 1),
      }));

      // Toggle like in database
      await toggleLike(id, user.id);
    } catch (err) {
      // Revert the UI change if database update fails
      console.error("Error toggling like:", err);
      setLiked((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      alert("Failed to update like. Please try again.");
    } finally {
      setLikingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this post? It will be archived but cannot be recovered.")) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteExperiencePost(id);
      // Remove from local state
      setExperiences((prev) => prev.filter((exp) => exp.id !== id));
      // Show success message
      alert("Post deleted successfully!");
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const sortedExperiences = [...experiences].sort((a, b) => {
    if (sort === "new") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sort === "top") {
      return (likes[b.id] ?? 0) - (likes[a.id] ?? 0);
    }
    // Hot: combination of recent and likes
    return (likes[b.id] ?? 0) - (likes[a.id] ?? 0);
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
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader className="h-8 w-8 text-primary animate-spin mb-3" />
                  <p className="text-muted-foreground">Loading experiences...</p>
                </div>
              ) : error ? (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <p className="text-destructive">{error}</p>
                </div>
              ) : sortedExperiences.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                  <p className="text-muted-foreground">No experiences yet. Be the first to share!</p>
                </div>
              ) : (
                sortedExperiences.map((exp, i) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="glass-card flex"
                  >
                    {/* Left: avatar + votes (compact, Twitter-like) */}
                    <div className="flex items-start px-3 py-3 min-w-[64px]">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                          {exp.company.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-foreground">{exp.company}</span>
                            {exp.verified && <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-medium">✓ Verified</span>}
                            <span className={`ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              exp.difficulty === "Hard"
                                ? "bg-destructive/10 text-destructive"
                                : exp.difficulty === "Easy"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-amber-500/10 text-amber-400"
                            }`}>{exp.difficulty}</span>
                          </div>

                          <div className="mt-2">
                            <div className="font-display text-base font-semibold text-foreground">{exp.company} — {exp.role}</div>
                            <p className="text-sm text-muted-foreground mt-2 mb-2 leading-relaxed">{exp.tips}</p>

                            <div className="flex flex-wrap gap-2 mb-2">
                              {exp.rounds.map((r, idx) => (
                                <span key={idx} className="text-[11px] px-2 py-1 rounded-full bg-secondary text-muted-foreground">{r}</span>
                              ))}
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1 hover:text-foreground transition-colors">
                                  <MessageSquare className="h-4 w-4" />
                                  <span className="text-xs">0</span>
                                </div>
                                <div className="flex items-center gap-1 hover:text-foreground transition-colors">
                                  <Repeat className="h-4 w-4" />
                                  <span className="text-xs">0</span>
                                </div>
                                <button
                                  onClick={() => handleLike(exp.id)}
                                  disabled={likingId === exp.id}
                                  className="flex items-center gap-1 hover:text-foreground transition-colors disabled:opacity-50"
                                >
                                  {likingId === exp.id ? (
                                    <Loader className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Heart className={`h-4 w-4 ${liked[exp.id] ? "text-primary fill-current" : ""}`} />
                                  )}
                                  <span className="text-xs">{likes[exp.id]}</span>
                                </button>
                                <div className="flex items-center gap-1 hover:text-foreground transition-colors">
                                  <Share2 className="h-4 w-4" />
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                  <span className="text-xs font-medium text-foreground">{exp.confidence_level || 0}/5</span>
                                </div>
                                {user && user.id === exp.user_id ? (
                                  <button
                                    onClick={() => handleDelete(exp.id)}
                                    disabled={deletingId === exp.id}
                                    className="flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                                    title="Delete this post"
                                  >
                                    {deletingId === exp.id ? (
                                      <Loader className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </button>
                                ) : (
                                  <MoreHorizontal className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
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
