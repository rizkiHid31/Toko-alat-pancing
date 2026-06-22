import "./App.css";

const projects = [
  {
    id: 1,
    title: "Master Even",
    description:
      "Full-stack event management app with Customer and Organizer roles. Features a complete payment flow, vouchers, wallet/points system, and post-event reviews.",
    tech: ["React 19", "TypeScript", "Node.js", "PostgreSQL", "Prisma", "Redis"],
    github: "https://github.com/rizkiHid31/Event-Management-mini-project",
    demo: "",
    image: "/Master-Even.png",
  },
  {
    id: 2,
    title: "Toko Alat Pancing",
    description:
      "Indonesian fishing gear e-commerce with a customer storefront, admin dashboard, and REST API backend. Includes cart, checkout, Midtrans payment, and order tracking.",
    tech: ["React", "TypeScript", "Express", "PostgreSQL", "Midtrans", "Cloudinary"],
    github: "https://github.com/rizkiHid31/Toko-alat-pancing",
    demo: "",
    image: "/toko-alat-pancing.png",
  },
  {
    id: 3,
    title: "GYM Management",
    description:
      "Web-based gym operations system covering member registration, QR check-in, POS, promo management, and a finance dashboard with export support.",
    tech: ["Next.js", "TypeScript", "SQLite", "Tailwind CSS", "shadcn/ui"],
    github: "https://github.com/rizkiHid31/GYM-Management",
    demo: "",
    image: "/gym-management.png",
  },
];

const skillCategories = [
  { label: "Frontend", skills: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS"] },
  { label: "Backend", skills: ["Node.js", "Express", "PostgreSQL", "Prisma", "Redis", "BullMQ"] },
  { label: "Tools", skills: ["Git", "REST API", "Cloudinary", "Postman"] },
];

const navLinks = ["About", "Skills", "Projects", "Contact"];

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased">

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="font-bold text-lg tracking-tight text-white">RH.</span>
          <div className="flex gap-8 text-sm text-neutral-400">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="hover:text-white transition-colors duration-200"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">

        {/* Photo — full height */}
        <div className="absolute right-0 top-0 h-full w-[45%] hidden md:block">
          <div className="absolute inset-y-0 left-0 w-64 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black to-transparent z-10" />
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent z-10" />
          <img
            src="/image.png"
            alt="Rizki Hidayat"
            className="w-full h-full object-cover object-top grayscale scale-x-[-1]"
          />
        </div>

        {/* Content */}
        <div className="relative z-20 max-w-5xl mx-auto w-full px-6 pt-32 pb-24">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 mb-5">
            Junior Web Developer
          </p>
          <h1 className="text-7xl font-bold mb-7 leading-[1.0] tracking-tight">
            Rizki<br />Hidayat
          </h1>
          <p className="text-neutral-400 leading-relaxed max-w-md text-[15px]">
            Building real-world skills one project at a time. My workflow is
            powered by AI — tools like{" "}
            <span className="text-white">Claude</span> and{" "}
            <span className="text-white">GitHub Copilot</span> act as my pair
            programmers, helping me write cleaner code, debug faster, and grow
            beyond what traditional learning alone allows. I'm not just learning
            to code — I'm learning to build <em>with</em> AI.
          </p>
          <div className="flex flex-wrap gap-3 mt-10">
            <a
              href="#projects"
              className="bg-white text-black px-6 py-2.5 text-sm font-semibold hover:bg-neutral-200 transition-colors"
            >
              See My Work
            </a>
            <a
              href="#contact"
              className="border border-white/20 text-white px-6 py-2.5 text-sm font-medium hover:border-white/60 hover:bg-white/5 transition-all"
            >
              Contact Me
            </a>
            <a
              href="/cv.pdf"
              download
              className="border border-white/20 text-white px-6 py-2.5 text-sm font-medium hover:border-white/60 hover:bg-white/5 transition-all"
            >
              Download CV
            </a>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 mb-3">01</p>
          <h2 className="text-3xl font-bold mb-12">About</h2>
          <div className="grid md:grid-cols-2 gap-14">
            <div className="space-y-4 text-neutral-400 leading-relaxed text-[15px]">
              <p>
                I'm a graduate of{" "}
                <span className="text-white font-medium">
                  Purwadhika Digital Technology School
                </span>
                , where I completed an intensive full-stack web development
                program. My path into tech started with curiosity — and quickly
                became a genuine drive to build things.
              </p>
              <p>
                Before tech, I worked in sales — which gave me strong
                communication skills, a client-first mindset, and the habit of
                working toward results, not just completing tasks. I bring that
                same drive into every project I build.
              </p>
              <p>
                What sets me apart is how I integrate AI into my development
                process — not as a shortcut, but as a force multiplier. This
                approach has helped me tackle complex problems earlier in my
                career and ship faster without sacrificing quality.
              </p>
            </div>
            <div className="space-y-0 text-[14px]">
              {[
                { label: "Education", value: "Purwadhika Digital Technology School" },
                { label: "Focus", value: "Full-Stack Web Development" },
                { label: "Location", value: "Bekasi, Indonesia" },
                { label: "Status", value: "Open to opportunities" },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-8 py-4 border-b border-white/10">
                  <span className="text-neutral-500 w-24 shrink-0">{label}</span>
                  <span className="text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="py-24 px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 mb-3">02</p>
          <h2 className="text-3xl font-bold mb-12">Skills</h2>
          <div className="space-y-6">
            {skillCategories.map(({ label, skills }) => (
              <div key={label}>
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-600 mb-3">{label}</p>
                <div className="flex flex-wrap gap-3">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="border border-white/15 text-neutral-300 px-4 py-2 text-sm hover:border-white hover:text-white hover:bg-white/5 transition-all duration-200 cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-24 px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 mb-3">03</p>
          <h2 className="text-3xl font-bold mb-12">Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <div
                key={project.id}
                className="border border-white/10 bg-neutral-900/50 hover:border-white/30 hover:bg-neutral-900 transition-all duration-300 group flex flex-col"
              >
                <div className="h-44 bg-neutral-800 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-white text-[15px] mb-2">{project.title}</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed mb-4 flex-1">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {project.tech.map((t) => (
                      <span key={t} className="text-xs text-neutral-500 bg-white/5 px-2 py-1 border border-white/10">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-5 text-sm">
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-white transition-colors underline underline-offset-4 decoration-white/30 hover:decoration-white"
                    >
                      GitHub
                    </a>
                    {project.demo && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-400 hover:text-white transition-colors underline underline-offset-4 decoration-white/30 hover:decoration-white"
                      >
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 mb-3">04</p>
          <h2 className="text-3xl font-bold mb-4">Let's Connect</h2>
          <p className="text-neutral-500 mb-12 max-w-md text-[15px] leading-relaxed">
            Open to new opportunities — freelance, internship, or full-time.
            Have something in mind? My inbox is always open.
          </p>
          <div className="space-y-0">
            {[
              { label: "Email", value: "rizkitanjung63@gmail.com", href: "mailto:rizkitanjung63@gmail.com" },
              { label: "WhatsApp", value: "+62 819 9171 1188", href: "https://wa.me/6281991711188" },
              { label: "GitHub", value: "rizkiHid31", href: "https://github.com/rizkiHid31" },
              { label: "LinkedIn", value: "Rizki Hidayat", href: "#" },
            ].map(({ label, value, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex items-center gap-8 py-5 border-b border-white/10 group hover:border-white/30 transition-colors"
              >
                <span className="text-neutral-500 text-sm w-24 shrink-0">{label}</span>
                <span className="text-white text-[15px] group-hover:underline underline-offset-4">{value}</span>
                <span className="ml-auto text-neutral-700 group-hover:text-neutral-400 transition-colors text-lg">↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 px-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center text-sm text-neutral-600">
          <span>© 2026 Rizki Hidayat</span>
          <span>Built with React & Tailwind CSS</span>
        </div>
      </footer>

    </div>
  );
}
