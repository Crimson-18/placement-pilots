import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { getAllExperiencesWithUsers, toggleLike, checkIfUserLiked } from "@/lib/experienceService";
import { sendChatRequest, checkChatRequestExists } from "@/lib/chatRequestService";
import { Star, Heart, MessageCircle, Loader } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Experiences = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [liking, setLiking] = useState<Set<string>>(new Set());
  const [connecting, setConnecting] = useState<Set<string>>(new Set());
  const [chatRequests, setChatRequests] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    const fetchExperiences = async () => {
      setLoading(true);
      const data = await getAllExperiencesWithUsers();
      setExperiences(data);
      
      // Check which posts user has liked
      if (user?.id) {
        const liked = new Set<string>();
        for (const exp of data) {
          const hasLiked = await checkIfUserLiked(exp.id, user.id);
          if (hasLiked) {
            liked.add(exp.id);
          }
        }
        setLikedPosts(liked);
      }
      
      setLoading(false);
    };

    fetchExperiences();
  }, [user?.id]);

  const handleToggleLike = async (experienceId: string) => {
    if (!user?.id) {
      alert("Please log in to like posts");
      return;
    }

    try {
      setLiking(prev => new Set([...prev, experienceId]));
      
      await toggleLike(experienceId, user.id);
      
      // Update local state
      setLikedPosts(prev => {
        const updated = new Set(prev);
        if (updated.has(experienceId)) {
          updated.delete(experienceId);
        } else {
          updated.add(experienceId);
        }
        return updated;
      });
      
      // Update like count in experiences
      setExperiences(prev => 
        prev.map(exp => 
          exp.id === experienceId 
            ? { 
                ...exp, 
                likes: likedPosts.has(experienceId) 
                  ? (exp.likes || 0) - 1 
                  : (exp.likes || 0) + 1 
              }
            : exp
        )
      );
    } catch (err) {
      console.error("Error toggling like:", err);
      alert("Failed to update like");
    } finally {
      setLiking(prev => {
        const updated = new Set(prev);
        updated.delete(experienceId);
        return updated;
      });
    }
  };

  const handleConnect = async (experienceId: string, receiverId: string, receiverName: string) => {
    if (!user?.id) {
      alert("Please log in to connect with users");
      return;
    }

    if (user.id === receiverId) {
      alert("You cannot connect with yourself");
      return;
    }

    try {
      setConnecting(prev => new Set([...prev, experienceId]));

      // Check if request already exists
      const existingRequest = await checkChatRequestExists(user.id, receiverId);
      if (existingRequest && existingRequest.status !== 'rejected') {
        alert("You have already sent a connect request to this user");
        return;
      }

      // Send chat request
      await sendChatRequest(user.id, receiverId, experienceId);
      alert(`Connect request sent to ${receiverName}! Go to PrepTalk to view your requests.`);
      
      // Redirect to PrepTalk
      navigate("/preptalk");
    } catch (err: any) {
      console.error("Error sending connect request:", err);
      alert(err?.message || "Failed to send connect request");
    } finally {
      setConnecting(prev => {
        const updated = new Set(prev);
        updated.delete(experienceId);
        return updated;
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-3 sm:px-4 pt-20 sm:pt-24 pb-12 max-w-3xl">
        {/* Header */}
        <div className="mb-8 sm:mb-10 animate-in fade-in slide-in-from-top duration-500">
          <h1 className="font-display text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            Interview Experiences
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-2">
            Learn from real placement interviews
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 animate-in fade-in duration-500">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-2 border-transparent border-t-blue-400 border-r-purple-400 rounded-full animate-spin" />
              <Loader className="absolute inset-0 m-auto h-8 w-8 text-blue-300 animate-spin" />
            </div>
          </div>
        ) : experiences.length === 0 ? (
          <div className="glass-card p-8 sm:p-12 text-center animate-in fade-in duration-500">
            <p className="text-muted-foreground">
              No interview experiences shared yet. Be the first to share!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {experiences.map((exp) => {
              const userInfo = exp.users || {};
              const displayName = exp.user_name || userInfo.name || "Anonymous";
              const displayBranch = userInfo.branch || "N/A";
              const isLiked = likedPosts.has(exp.id);
              const isLiking = liking.has(exp.id);
              
              return (
                <div key={exp.id} className="glass-card p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        {exp.company} — {exp.role}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        by {displayName} ({displayBranch}) ·{" "}
                        {new Date(exp.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {exp.verified && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-green-500/10 text-green-600 flex items-center gap-1">
                          ✓ Verified
                        </span>
                      )}
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                          exp.difficulty === "Hard"
                            ? "bg-destructive/10 text-destructive"
                            : exp.difficulty === "Medium"
                            ? "bg-warning/10 text-warning"
                            : "bg-success/10 text-success"
                        }`}
                      >
                        {exp.difficulty}
                      </span>
                      {exp.confidence_level && (
                        <div className="flex items-center gap-0.5 ml-2">
                          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                          <span className="text-xs font-medium text-foreground">
                            {exp.confidence_level}/5
                          </span>
                        </div>
                      )}
                      {!exp.verified && (
                        <span className="text-xs text-muted-foreground italic">
                          (pending verification)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        Rounds
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(exp.rounds || []).map((round: string, i: number) => (
                          <span
                            key={i}
                            className="rounded bg-secondary px-2.5 py-1 text-xs text-foreground"
                          >
                            {round}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        Tips
                      </h4>
                      <p className="text-sm text-foreground/80">{exp.tips}</p>
                    </div>

                    {(exp.strengths || exp.mistakes) && (
                      <div className="grid grid-cols-2 gap-3">
                        {exp.strengths && (
                          <div>
                            <h4 className="text-xs font-medium text-success/80 uppercase tracking-wider mb-1">
                              Strengths
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {exp.strengths}
                            </p>
                          </div>
                        )}
                        {exp.mistakes && (
                          <div>
                            <h4 className="text-xs font-medium text-destructive/80 uppercase tracking-wider mb-1">
                              Mistakes
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {exp.mistakes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        Preparation
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {exp.preparation_strategy}
                      </p>
                    </div>
                  </div>

                  {/* Like and Connect Buttons */}
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => handleToggleLike(exp.id)}
                      disabled={isLiking}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all duration-200 ${
                        isLiked
                          ? "bg-destructive/20 text-destructive hover:bg-destructive/30"
                          : "bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
                      } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
                      title={user ? (isLiked ? "Unlike" : "Like") : "Login to like"}
                    >
                      <Heart
                        className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                      />
                      <span className="text-xs font-medium">
                        {exp.likes || 0}
                      </span>
                    </button>

                    <button
                      onClick={() => handleConnect(exp.id, exp.user_id, exp.user_name || userInfo.name || "User")}
                      disabled={connecting.has(exp.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all duration-200 ${
                        connecting.has(exp.id)
                          ? "opacity-50 cursor-not-allowed bg-secondary text-muted-foreground"
                          : "bg-primary/20 text-primary hover:bg-primary/30"
                      }`}
                      title="Connect with this user for chat"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-xs font-medium">
                        {connecting.has(exp.id) ? "Connecting..." : "Connect"}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Experiences;
