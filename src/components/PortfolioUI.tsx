"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Code,
  Layers,
  Sparkles,
  Smartphone,
  Cpu,
  Mail,
  Send,
  ArrowUpRight,
  Download,
  CheckCircle,
  Briefcase,
  Compass
} from "lucide-react";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function PortfolioUI() {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) return;
    
    // Construct prefilled mailto link details
    const subject = `Message from ${formState.name} (Portfolio Inquiry)`;
    const body = `Hi Sudip,

${formState.message}

Best regards,
${formState.name}
(${formState.email})`;
    
    const mailtoUrl = `mailto:sudipmanna6506@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open in current window to trigger system email client
    window.location.href = mailtoUrl;

    // Transition React state to show local success feedback
    setIsSubmitted(true);
    setFormState({ name: "", email: "", message: "" });
  };

  // Framer Motion reveal preset
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const skills = [
    { 
      name: "Python", 
      icon: <Code className="w-5 h-5" />, 
      bgClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10",
      glowClass: "group-hover:border-blue-500/30 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] dark:group-hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]",
      desc: "Building automation scripts, AI workflows, backend logic, and problem-solving solutions." 
    },
    { 
      name: "C", 
      icon: <Code className="w-5 h-5" />, 
      bgClass: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border border-zinc-500/10",
      glowClass: "group-hover:border-zinc-500/30 group-hover:shadow-[0_0_20px_rgba(156,163,175,0.15)] dark:group-hover:shadow-[0_0_25px_rgba(156,163,175,0.25)]",
      desc: "Strong foundation in programming fundamentals, memory management, and efficient logic building." 
    },
    { 
      name: "Java", 
      icon: <Code className="w-5 h-5" />, 
      bgClass: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/10",
      glowClass: "group-hover:border-red-500/30 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] dark:group-hover:shadow-[0_0_25px_rgba(239,68,68,0.25)]",
      desc: "Object-oriented application development with scalable and structured programming practices." 
    },
    { 
      name: "HTML • CSS • JavaScript • TypeScript", 
      icon: <Layers className="w-5 h-5" />, 
      bgClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10",
      glowClass: "group-hover:border-amber-500/30 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] dark:group-hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]",
      desc: "Creating responsive, interactive, and modern web experiences with clean frontend architecture." 
    },
    { 
      name: "React Native", 
      icon: <Smartphone className="w-5 h-5" />, 
      bgClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/10",
      glowClass: "group-hover:border-sky-500/30 group-hover:shadow-[0_0_20px_rgba(14,165,233,0.15)] dark:group-hover:shadow-[0_0_25px_rgba(14,165,233,0.25)]",
      desc: "Developing cross-platform mobile applications with native-like performance and flexibility." 
    },
    { 
      name: "React Expo", 
      icon: <Smartphone className="w-5 h-5" />, 
      bgClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/10",
      glowClass: "group-hover:border-violet-500/30 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] dark:group-hover:shadow-[0_0_25px_rgba(139,92,246,0.25)]",
      desc: "Rapid mobile app development with streamlined workflows and modern React Native tooling." 
    },
    { 
      name: "Flutter", 
      icon: <Smartphone className="w-5 h-5" />, 
      bgClass: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/10",
      glowClass: "group-hover:border-cyan-500/30 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] dark:group-hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]",
      desc: "Building smooth and visually engaging cross-platform mobile applications." 
    },
    { 
      name: "AI Tools", 
      icon: <Cpu className="w-5 h-5" />, 
      bgClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10",
      glowClass: "group-hover:border-emerald-500/30 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] dark:group-hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]",
      desc: "Exploring AI-powered workflows, intelligent systems, automation, and creative development tools." 
    },
    { 
      name: "MCP Servers", 
      icon: <Cpu className="w-5 h-5" />, 
      bgClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10",
      glowClass: "group-hover:border-indigo-500/30 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] dark:group-hover:shadow-[0_0_25px_rgba(99,102,241,0.25)]",
      desc: "Exploring Model Context Protocol (MCP) servers to connect AI models with tools, workflows, and real-time development environments." 
    },
    { 
      name: "Blockchain", 
      icon: <Layers className="w-5 h-5" />, 
      bgClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/10",
      glowClass: "group-hover:border-teal-500/30 group-hover:shadow-[0_0_20px_rgba(20,184,166,0.15)] dark:group-hover:shadow-[0_0_25px_rgba(20,184,166,0.25)]",
      desc: "Exploring decentralized technologies, smart contracts, and modern blockchain-based application development." 
    },
    { 
      name: "LLM / RAG", 
      icon: <Cpu className="w-5 h-5" />, 
      bgClass: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/10",
      glowClass: "group-hover:border-pink-500/30 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] dark:group-hover:shadow-[0_0_25px_rgba(236,72,153,0.25)]",
      desc: "Building AI-powered experiences using Large Language Models, retrieval-augmented generation, and intelligent data workflows." 
    },
    { 
      name: "Firebase", 
      icon: <Layers className="w-5 h-5" />, 
      bgClass: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/10",
      glowClass: "group-hover:border-yellow-500/30 group-hover:shadow-[0_0_20px_rgba(234,179,8,0.15)] dark:group-hover:shadow-[0_0_25px_rgba(234,179,8,0.25)]",
      desc: "Building scalable applications with authentication, cloud databases, hosting, and real-time backend services." 
    },
    { 
      name: "Stitch", 
      icon: <Sparkles className="w-5 h-5" />, 
      bgClass: "bg-lime-500/10 text-lime-600 dark:text-lime-400 border border-lime-500/10",
      glowClass: "group-hover:border-lime-500/30 group-hover:shadow-[0_0_20px_rgba(132,204,22,0.15)] dark:group-hover:shadow-[0_0_25px_rgba(132,204,22,0.25)]",
      desc: "Experimenting with AI-assisted UI generation and rapid interface prototyping using modern creative development tools." 
    },
    { 
      name: "Vibe Coding", 
      icon: <Compass className="w-5 h-5" />, 
      bgClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/10",
      glowClass: "group-hover:border-orange-500/30 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] dark:group-hover:shadow-[0_0_25px_rgba(249,115,22,0.25)]",
      desc: "Fast prototyping, creative experimentation, and modern AI-assisted development workflows." 
    },
    { 
      name: "Three.js", 
      icon: <Sparkles className="w-5 h-5" />, 
      bgClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/10",
      glowClass: "group-hover:border-purple-500/30 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] dark:group-hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]",
      desc: "Basic experience creating interactive 3D visuals and immersive web experiences using WebGL." 
    }
  ];

  const projects = [
    {
      title: "Swastha AI",
      category: "AI Healthcare Platform",
      description: "An AI-powered healthcare platform that combines intelligent symptom analysis, nearby healthcare discovery, medicine search, smart comparison systems, and real-time appointment booking into one seamless healthcare ecosystem.",
      tags: ["React", "TypeScript", "Firebase", "Gemini API", "Google Maps API"],
      link: "#"
    },
    {
      title: "E-Sehat",
      category: "Telemedicine Platform",
      description: "A modern telemedicine ecosystem connecting patients, doctors, and pharmacies through AI-assisted healthcare services, online consultations, digital prescriptions, and streamlined healthcare workflows.",
      tags: ["React Native", "Node.js", "PostgreSQL", "Express", "OpenAI API"],
      link: "#"
    },
    {
      title: "Plant Disease Detection",
      category: "AI • Computer Vision",
      description: "An AI-powered computer vision system that detects and classifies plant leaf diseases using YOLO object detection and CNN-based deep learning models for smart agriculture and crop monitoring.",
      tags: ["Python", "YOLO", "CNN", "OpenCV", "TensorFlow"],
      link: "#"
    },
    {
      title: "3D Developer Portfolio",
      category: "Interactive 3D Experience",
      description: "A modern interactive 3D portfolio showcasing projects, AI experiments, and creative development workflows through immersive visuals, smooth animations, and dynamic user interactions.",
      tags: ["Three.js", "React Three Fiber", "GSAP", "GLSL", "Tailwind CSS"],
      link: "#"
    }
  ];

  const journeyItems = [
    {
      date: "2024 — Present",
      title: "B.Tech in Artificial Intelligence & Machine Learning",
      institution: "Institute of Engineering & Management, Kolkata",
      grade: "CGPA: 9.05",
      description: "Pursuing a Bachelor of Technology degree focused on Artificial Intelligence, Machine Learning, software engineering, and modern computing technologies while actively building real-world AI and full-stack development projects.",
      highlights: ["AI & ML", "Full Stack Development", "Python", "C", "Web Technologies"]
    },
    {
      date: "2022 — 2024",
      title: "Higher Secondary Education (Science)",
      institution: "Govt. Sponsored Multipurpose School (Boy’s) – Taki House",
      grade: "Class 12: 80%",
      description: "Completed higher secondary education with a focus on Physics, Chemistry, and Mathematics, building a strong analytical and problem-solving foundation.",
      highlights: ["Physics", "Chemistry", "Mathematics", "Analytical Thinking"]
    },
    {
      date: "2020 — 2022",
      title: "Secondary Education",
      institution: "Sarat Chandra Sur Institution",
      grade: "Class 10: 78.8%",
      description: "Developed strong academic fundamentals in mathematics, science, logical reasoning, and core computer fundamentals during secondary education.",
      highlights: ["Mathematics", "Science", "Logical Reasoning"]
    }
  ];

  return (
    <div className="relative w-full max-w-[1440px] mx-auto px-6 md:px-12 pointer-events-auto">
      
      {/* 1. HERO SECTION */}
      <section id="hero" className="min-h-screen flex flex-col justify-center pt-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="max-w-lg text-left glass-panel rounded-3xl p-8 md:p-10 border border-emerald-500/10 dark:border-white/10 shadow-xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-950 dark:text-emerald-300 text-xs font-medium tracking-wide mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Coexisting Tech & Nature
          </div>
          
          <h1 className="text-5xl md:text-6xl font-serif font-normal leading-tight tracking-tight text-emerald-950 dark:text-[#f3f4f6]">
            Crafting AI-Powered <br />
            <span className="italic text-emerald-800 dark:text-emerald-400 font-normal neon-glow-emerald">Digital Experiences</span>
          </h1>
          
          <p className="mt-6 text-base md:text-lg text-[#2d3a31] dark:text-[#a0a5b5] font-sans font-normal leading-relaxed">
            Hi, I&apos;m <span className="font-semibold text-emerald-950 dark:text-white">Sudip Manna</span> &mdash; a software engineering student passionate about building high-performance AI tools, modern web apps, websites, and mobile applications. I love exploring various AI tools, experimenting with vibe coding, and creating immersive digital experiences that blend creativity with technology.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 items-center">
            <a
              href="/Sudip_Manna_CV-1.pdf"
              download="Sudip-Manna-CV.pdf"
              className="px-6 py-3 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white font-medium shadow-md transition-all hover:shadow-[0_0_20px_rgba(6,95,70,0.2)] duration-300 flex items-center gap-2 group cursor-pointer text-sm"
            >
              Download CV
              <Download className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
            </a>
            <a
              href="#contact"
              className="px-6 py-3 rounded-full border border-emerald-900/15 dark:border-white/10 bg-emerald-500/10 dark:bg-white/5 hover:bg-emerald-800 dark:hover:bg-emerald-600 text-emerald-950 dark:text-white hover:text-white dark:hover:text-white font-medium transition-all duration-300 shadow-sm text-sm"
            >
              Get in Touch
            </a>
          </div>
        </motion.div>


      </section>

      {/* 2. ABOUT SECTION */}
      <section id="about" className="min-h-screen flex flex-col justify-center py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="glass-panel rounded-3xl p-8 md:p-12 hover:shadow-[0_20px_50px_rgba(16,185,129,0.05)] transition-all duration-700"
        >
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs uppercase tracking-widest text-emerald-850 dark:text-emerald-400 font-semibold mb-2 block">
                What I&apos;m Building
              </span>
              <h2 className="text-3xl md:text-4xl font-serif text-emerald-950 dark:text-white leading-snug">
                AI-powered products, immersive web experiences, and modern applications.
              </h2>
              <p className="mt-6 text-sm md:text-base text-[#2d3a31] dark:text-[#a0a5b5] font-sans font-normal leading-relaxed">
                Currently exploring AI integrations, full-stack development, interactive UI systems, and creative development workflows. I enjoy building projects that combine performance, usability, and innovative user experiences across web and mobile platforms.
              </p>
            </div>
            
            <div className="relative flex justify-center">
              <div className="glass-card rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl hover:shadow-[0_15px_30px_rgba(16,185,129,0.1)] transition-all duration-500 border border-emerald-500/10">
                <h4 className="font-serif text-sm font-semibold text-emerald-950 dark:text-white">Mini Points</h4>
                <div className="space-y-3">
                  {[
                    "AI Tools & Automation",
                    "Modern Web Apps",
                    "Interactive UI/UX",
                    "Mobile Applications",
                    "Creative Development"
                  ].map((point) => (
                    <div key={point} className="flex items-center gap-3 text-sm text-[#2d3a31] dark:text-[#a0a5b5]">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-855 dark:text-emerald-450" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. SKILLS SECTION */}
      <section id="skills" className="min-h-screen flex flex-col justify-center py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="text-center mb-12"
        >
          <span className="text-xs uppercase tracking-widest text-emerald-850 dark:text-emerald-400 font-semibold mb-2 block">
            Development Stack
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-emerald-950 dark:text-white">
            Technologies Powering <br className="hidden md:block" />
            <span className="italic">My Creative Workflow</span>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          {skills.map((skill, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className={`glass-card rounded-2xl p-6 hover:-translate-y-1.5 transition-all duration-500 ${skill.glowClass} group flex flex-col justify-between`}
            >
              <div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${skill.bgClass}`}>
                  {skill.icon}
                </div>
                <h3 className="font-serif text-base font-medium text-emerald-950 dark:text-white mb-2 leading-snug">
                  {skill.name}
                </h3>
                <p className="text-xs text-[#2d3a31] dark:text-[#a0a5b5] font-sans font-normal leading-relaxed">
                  {skill.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 4. PROJECTS SECTION */}
      <section id="projects" className="min-h-screen flex flex-col justify-center py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12"
        >
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-850 dark:text-emerald-400 font-semibold mb-2 block">
              Featured Work
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-emerald-950 dark:text-white">
              AI, Healthcare & <span className="italic">Interactive Development</span>
            </h2>
          </div>
          <p className="mt-4 md:mt-0 text-sm text-[#2d3a31] dark:text-[#a0a5b5] font-sans font-normal max-w-sm">
            A collection of projects combining AI systems, healthcare technology, modern web applications, mobile development, and immersive interactive experiences.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="glass-panel rounded-3xl p-6 md:p-8 hover:shadow-[0_20px_40px_-5px_rgba(16,185,129,0.12)] dark:hover:shadow-[0_20px_40px_-5px_rgba(52,211,153,0.22)] hover:border-emerald-500/20 dark:hover:border-emerald-400/35 transition-all duration-700 group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs text-emerald-800 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                    {project.category}
                  </span>
                  <a
                    href={project.link}
                    className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-800 hover:text-white dark:hover:bg-emerald-600 transition-colors duration-300 flex items-center justify-center"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
                
                <h3 className="text-2xl font-serif text-emerald-950 dark:text-white mb-4 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors duration-300">
                  {project.title}
                </h3>
                
                <p className="text-sm text-[#2d3a31] dark:text-[#a0a5b5] font-sans font-normal leading-relaxed mb-6">
                  {project.description}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap gap-2 pt-4 border-t border-emerald-900/10 dark:border-white/5">
                  <span className="w-full text-[10px] uppercase tracking-widest font-semibold text-emerald-800 dark:text-emerald-400 mb-1">
                    Tech
                  </span>
                  {project.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-[10px] uppercase font-semibold bg-emerald-500/5 dark:bg-emerald-400/5 text-[#2d3a31] dark:text-emerald-300 border border-emerald-500/10 dark:border-emerald-400/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. EXPERIENCE / TIMELINE */}
      <section id="experience" className="min-h-screen flex flex-col justify-center py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-widest text-emerald-800 dark:text-emerald-400 font-semibold mb-2 block">
            Education & Journey
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-emerald-950 dark:text-white">
            Academic Journey & <span className="italic">Growth Timeline</span>
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-sm text-[#2d3a31] dark:text-[#a0a5b5] font-sans font-normal leading-relaxed">
            A timeline highlighting my academic background, technical growth, and continuous exploration in AI, software development, and creative technology.
          </p>
        </motion.div>

        {/* Timeline Path */}
        <div className="relative max-w-3xl mx-auto pl-6 md:pl-0">
          
          {/* Vertical Winding Center Line */}
          <div className="absolute left-[25px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-800/10 via-emerald-800/30 to-transparent" />

          {/* Timeline Nodes */}
          <div className="space-y-12">
            {journeyItems.map((item, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                className="relative flex flex-col md:flex-row md:justify-between items-start md:items-center"
              >
                {/* Dot */}
                <div className="absolute left-[19px] md:left-1/2 -translate-x-[6px] md:-translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-emerald-800 bg-[#f5f2eb] dark:bg-[#0c0d12] z-10" />

                {/* Left/Right Card layout on desktop */}
                <div className={`w-full md:w-[45%] glass-card rounded-2xl p-5 hover:shadow-[0_10px_25px_rgba(16,185,129,0.08)] dark:hover:shadow-[0_10px_25px_rgba(52,211,153,0.18)] hover:border-emerald-500/20 transition-all duration-500 border border-transparent ${index % 2 === 0 ? "md:text-right" : "md:order-last"}`}>
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 font-mono">
                    {item.date}
                  </span>
                  <h3 className="font-serif text-lg font-medium text-emerald-950 dark:text-white mt-1">
                    {item.title}
                  </h3>
                  <h4 className="text-xs text-[#405446] dark:text-[#6a6d7a] font-sans mt-0.5">
                    {item.institution}
                  </h4>
                  <p className="mt-2 text-xs font-semibold text-emerald-850 dark:text-emerald-400 font-sans">
                    {item.grade}
                  </p>
                  <p className="mt-4 text-xs text-[#2d3a31] dark:text-[#a0a5b5] font-sans font-normal leading-relaxed">
                    {item.description}
                  </p>
                  <div className={`mt-4 flex flex-wrap gap-2 ${index % 2 === 0 ? "md:justify-end" : ""}`}>
                    <span className="w-full text-[10px] uppercase tracking-widest font-semibold text-emerald-800 dark:text-emerald-400">
                      Highlights
                    </span>
                    {item.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="px-2.5 py-1 rounded-md text-[10px] uppercase font-semibold bg-emerald-500/5 dark:bg-emerald-400/5 text-[#2d3a31] dark:text-emerald-300 border border-emerald-500/10 dark:border-emerald-400/10"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="w-full md:w-[45%] mt-2 md:mt-0 md:block hidden" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CONTACT SECTION */}
      <section id="contact" className="min-h-screen flex flex-col justify-center py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="max-w-xl mx-auto w-full glass-panel rounded-3xl p-8 md:p-12 shadow-2xl hover:shadow-[0_20px_50px_rgba(16,185,129,0.08)] transition-all duration-700"
        >
          <div className="text-center mb-8">
            <span className="text-xs uppercase tracking-widest text-emerald-805 dark:text-emerald-400 font-semibold mb-2 block">
              Inquire
            </span>
            <h2 className="text-3xl font-serif text-emerald-950 dark:text-white">
              Initiate a <span className="italic">Conversation</span>
            </h2>
            <p className="mt-3 text-xs text-[#2d3a31] dark:text-[#a0a5b5] font-sans font-normal leading-relaxed">
              Have an app design, a frontend contract, or simply want to speak about code vibes? Send me a line.
            </p>
          </div>

          {isSubmitted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4 py-8 text-center"
            >
              <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="font-serif text-lg font-semibold text-emerald-950 dark:text-white">Transmission Successful</h3>
                <p className="text-xs text-[#2d3a31] dark:text-[#a0a5b5] font-sans font-normal mt-1">
                  Thank you. Your message has drifted through the stream. I will reply soon.
                </p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-emerald-950 dark:text-[#a0a5b5] uppercase tracking-wider mb-2">
                  Identity / Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formState.name}
                  onChange={handleInputChange}
                  required
                  placeholder="E.g., Ada Lovelace"
                  className="w-full px-4 py-3 rounded-xl border border-emerald-900/15 dark:border-white/10 bg-white/20 dark:bg-black/20 focus:bg-white/40 dark:focus:bg-black/40 text-sm text-emerald-950 dark:text-white placeholder:text-[#2d3a31]/50 dark:placeholder:text-[#a0a5b5]/70 outline-none focus:border-emerald-800 dark:focus:border-emerald-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-950 dark:text-[#a0a5b5] uppercase tracking-wider mb-2">
                  Mail / Coordinates
                </label>
                <input
                  type="email"
                  name="email"
                  value={formState.email}
                  onChange={handleInputChange}
                  required
                  placeholder="E.g., ada@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-emerald-900/15 dark:border-white/10 bg-white/20 dark:bg-black/20 focus:bg-white/40 dark:focus:bg-black/40 text-sm text-emerald-950 dark:text-white placeholder:text-[#2d3a31]/50 dark:placeholder:text-[#a0a5b5]/70 outline-none focus:border-emerald-800 dark:focus:border-emerald-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-950 dark:text-[#a0a5b5] uppercase tracking-wider mb-2">
                  Message / Thought
                </label>
                <textarea
                  name="message"
                  value={formState.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Let's build a digital sanctuary..."
                  className="w-full px-4 py-3 rounded-xl border border-emerald-900/15 dark:border-white/10 bg-white/20 dark:bg-black/20 focus:bg-white/40 dark:focus:bg-black/40 text-sm text-emerald-950 dark:text-white placeholder:text-[#2d3a31]/50 dark:placeholder:text-[#a0a5b5]/70 outline-none focus:border-emerald-800 dark:focus:border-emerald-400 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 group shadow-md hover:shadow-[0_0_20px_rgba(6,95,70,0.3)] cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    Transmit Signal
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Socials */}
          <div className="flex justify-center gap-7 mt-8 pt-6 border-t border-emerald-900/10 dark:border-white/10 text-[#405446] dark:text-[#6a6d7a]">
            <a 
              href="https://github.com/sudip-005" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="neon-hover-github transition-all duration-300"
              aria-label="GitHub Profile"
            >
              <GithubIcon className="w-5 h-5" />
            </a>
            <a 
              href="https://www.linkedin.com/in/sudip-manna-84599a274/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="neon-hover-linkedin transition-all duration-300"
              aria-label="LinkedIn Profile"
            >
              <LinkedinIcon className="w-5 h-5" />
            </a>
            <a 
              href="mailto:sudipmanna6506@gmail.com" 
              className="neon-hover-mail transition-all duration-300"
              aria-label="Send Email"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </motion.div>
      </section>

      {/* Subtle bottom space footer */}
      <footer className="py-12 text-center text-xs text-[#405446] dark:text-[#525560] font-sans font-normal">
        © {new Date().getFullYear()} Sudip Manna. Crafted with Next.js, WebGL & Nature vibes.
      </footer>
    </div>
  );
}
