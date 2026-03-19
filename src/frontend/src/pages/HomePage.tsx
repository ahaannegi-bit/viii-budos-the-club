import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  ChevronRight,
  Clock,
  Star,
  Trophy,
  Users,
  Vote,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

type Page = "home" | "news" | "leaderboard" | "election";

interface HomePageProps {
  onNavigate: (page: Page) => void;
  isAdmin: boolean;
}

const quickLinks = [
  {
    id: "news" as Page,
    title: "BUDOS Gazette",
    desc: "Group news, announcements & updates",
    icon: <BookOpen className="w-6 h-6" />,
    color: "bg-primary text-primary-foreground",
    emoji: "📰",
  },
  {
    id: "leaderboard" as Page,
    title: "Top Scorers",
    desc: "See who's leading the group",
    icon: <Trophy className="w-6 h-6" />,
    color: "bg-accent text-accent-foreground",
    emoji: "🏆",
  },
  {
    id: "election" as Page,
    title: "Group Election",
    desc: "Vote for your group representatives",
    icon: <Vote className="w-6 h-6" />,
    color: "bg-chart-3 text-white",
    emoji: "🗳️",
  },
];

const stats = [
  { label: "Group Members", value: "7", icon: <Users className="w-4 h-4" /> },
  { label: "Subjects", value: "8", icon: <Star className="w-4 h-4" /> },
  { label: "Events This Term", value: "12", icon: <Zap className="w-4 h-4" /> },
];

export default function HomePage({
  onNavigate,
  isAdmin: _isAdmin,
}: HomePageProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
  };

  return (
    <main>
      {/* Hero */}
      <section
        className="hero-gradient min-h-[520px] relative overflow-hidden flex items-center"
        data-ocid="home.section"
      >
        {/* Floating decorative shapes */}
        <div className="absolute top-12 right-16 w-20 h-20 rounded-2xl bg-primary/10 rotate-12 animate-float" />
        <div className="absolute top-32 right-48 w-12 h-12 rounded-full bg-accent/15 animate-float-slow" />
        <div
          className="absolute bottom-16 right-24 w-16 h-16 rounded-2xl bg-chart-3/10 -rotate-6 animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-24 left-1/3 w-8 h-8 rounded-full bg-primary/20 animate-float-slow"
          style={{ animationDelay: "1s" }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 w-full">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-2xl"
          >
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                <Zap className="w-3.5 h-3.5" /> Academic Year 2026–27
              </span>
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="font-display text-5xl sm:text-7xl font-bold text-foreground leading-none tracking-tight mb-4"
            >
              VIIIth A<span className="block text-primary">BUDOS</span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-xl sm:text-2xl text-muted-foreground font-medium mb-8"
            >
              Small Group, Big Dreams 🌟
            </motion.p>
            <motion.p
              variants={itemVariants}
              className="text-muted-foreground max-w-lg mb-6"
            >
              Welcome to the official hub for VIIIth A BUDOS — your one-stop for
              group news, standings, and democratic elections. Stay connected,
              stay competitive!
            </motion.p>
            {/* Device compatibility badge */}
            <motion.p
              variants={itemVariants}
              className="text-xs text-muted-foreground/70 mb-8 flex flex-wrap gap-x-2 gap-y-1 items-center"
            >
              <span className="font-semibold text-muted-foreground/90">
                Works on:
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/8 text-muted-foreground">
                📱 Mobile
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/8 text-muted-foreground">
                📟 Tablet
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/8 text-muted-foreground">
                💻 Laptop
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/8 text-muted-foreground">
                🖥️ Computer
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/8 text-muted-foreground">
                ⌚ Smartwatch
              </span>
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-3"
            >
              <Button
                size="lg"
                onClick={() => onNavigate("news")}
                className="font-display font-semibold gap-2"
                data-ocid="home.news.button"
              >
                Latest News <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate("election")}
                className="font-display font-semibold"
                data-ocid="home.election.button"
              >
                Vote Now 🗳️
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <div className="bg-foreground text-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-wrap justify-center sm:justify-start gap-8">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="text-primary">{s.icon}</span>
                <span className="font-display font-bold text-lg">
                  {s.value}
                </span>
                <span className="text-background/60 text-sm">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-3xl font-bold mb-8 text-foreground"
        >
          Explore the Hub
        </motion.h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {quickLinks.map((link, i) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className="card-hover cursor-pointer border-border shadow-card group"
                onClick={() => onNavigate(link.id)}
                data-ocid={`home.${link.id}.card`}
              >
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    {link.icon}
                  </div>
                  <h3 className="font-display font-bold text-lg mb-1">
                    {link.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {link.desc}
                  </p>
                  <span className="inline-flex items-center text-primary text-sm font-semibold gap-1 group-hover:gap-2 transition-all">
                    Open {link.emoji} <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Exam Status */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-foreground text-background p-8"
          data-ocid="home.countdown.card"
        >
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-background/60 text-sm font-medium uppercase tracking-wide">
                  Countdown
                </span>
              </div>
              <h3 className="font-display text-2xl font-bold mb-1">No Exam</h3>
              <p className="text-background/60 text-sm">
                No upcoming exams — enjoy the break! 🎉
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
