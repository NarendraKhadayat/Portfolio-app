
// import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
// import * as THREE from "three";
// import { Canvas, useFrame, useThree } from "@react-three/fiber";
// import { Html, Environment } from "@react-three/drei";
// import { EffectComposer, Bloom } from '@react-three/postprocessing';
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { motion } from "framer-motion";

// // ========================================================================
// // === PORTFOLIO BLUEPRINT V2: "THE DIGITAL MIND" - SINGLE FILE EDITION ===
// // ========================================================================

// // ========== 1. SITE DATA & CONFIGURATION ==========
// // This is the "brain" of your portfolio. All text content lives here.
// // Update this section to change the content across the entire site.
// // =================================================================

// const siteData = {
//   personalInfo: {
//     name: "Narendra Khadayat",
//     logo: "NK",
//     headline: "AI Enthusiast & Full-Stack Explorer",
//     summary: "A final-year Computer Science Engineer passionate about building intelligent, human-centered digital solutions that feel alive.",
//     avatarUrl: "/avatar.jpg",
//     resumeUrl: "/resume.pdf",
//     email: "narendrakhadayat@example.com",
//     socialLinks: {
//       github: "https://github.com",
//       linkedin: "https://linkedin.com",
//       kaggle: "https://kaggle.com",
//     }
//   },
//   about: {
//     story: "From my first 'Hello World' to architecting complex AI models, my journey has been driven by a deep curiosity for how things work. I thrive on deconstructing complex problems and rebuilding them into elegant, efficient solutions. I believe the best technology is that which feels like magic, seamlessly integrating into our lives. My goal is to be one of the magicians creating that future.",
//     timeline: [
//       { year: "2021", title: "Started B.Tech in CSE", description: "Began my journey into computer science, building a strong foundation in algorithms and data structures." },
//       { year: "2022", title: "Discovered AI/ML", description: "Dived deep into Python and its powerful libraries, finding a passion for creating intelligent systems." },
//       { year: "2023", title: "Built First Full-Stack App", description: "Developed the 'EduFlow ERP', connecting a React frontend with a Node.js backend and a PostgreSQL database." },
//       { year: "2024", title: "Professional Internship", description: "Applied my skills in a corporate environment, contributing to a real-world sarcasm detection model." },
//     ]
//   },
//   skills: [
//     { name: "Python", icon: "🐍" }, { name: "TensorFlow", icon: "🤖" }, { name: "PyTorch", icon: "🔥" },
//     { name: "React", icon: "⚛️" }, { name: "TypeScript", icon: "🔷" }, { name: "Next.js", icon: "🚀" },
//     { name: "Three.js (R3F)", icon: "🧊" }, { name: "GSAP", icon: "🟩" }, { name: "TailwindCSS", icon: "💨" },
//     { name: "Node.js", icon: "🟢" }, { name: "PostgreSQL", icon: "🐘" }, { name: "Docker", icon: "🐳" },
//     { name: "AWS", icon: "☁️" }, { name: "Git", icon: "🌿" }, { name: "Figma", icon: "🎨" },
//   ],
//   projects: [
//     { title: "Sarcasm Detection AI", tag: "AI / NLP", tech: ["PyTorch", "Flask", "React"], desc: "Built a deep learning model with 92% accuracy on YouTube comments, deployed as a live interactive demo.", links: [{ label: "Case Study", href: "#" }, { label: "Live Demo", href: "#" }] },
//     { title: "NeuroCanvas Engine", tag: "WebGL / R3F", tech: ["Three.js", "GLSL Shaders", "React"], desc: "A generative art engine creating dynamic visuals from procedural noise, powering the background of this site.", links: [{ label: "GitHub", href: "#" }] },
//     { title: "EduFlow College ERP", tag: "Full-Stack", tech: ["Next.js", "PostgreSQL", "Auth.js"], desc: "A modular, scalable ERP system designed for educational institutions, featuring role-based access and analytics.", links: [{ label: "GitHub", href: "#" }] },
//   ],
//   experience: [
//     { role: "Machine Learning Intern", company: "Tech Solutions Inc.", period: "Summer 2024", achievements: ["Improved model accuracy by 8% through feature engineering.", "Developed a Flask API to serve model predictions.", "Collaborated with the frontend team to integrate the AI model."] }
//   ],
//   certifications: [
//     { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", year: "2023" },
//     { name: "Deep Learning Specialization", issuer: "Coursera", year: "2023" },
//   ],
// };

// // ========== 2. UTILITY & HOOKS ==========

// const navTo = (id: string) => {
//   document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
// };

// function useMousePosition() {
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
//   useEffect(() => {
//     const handleMouseMove = (event: MouseEvent) => setMousePosition({ x: event.clientX, y: event.clientY });
//     window.addEventListener('mousemove', handleMouseMove);
//     return () => window.removeEventListener('mousemove', handleMouseMove);
//   }, []);
//   return mousePosition;
// }

// // ========== 3. 3D SCENE COMPONENTS ==========

// function NeuralNetwork() {
//   const nodesRef = useRef<THREE.Points>(null!);
//   const linesRef = useRef<THREE.LineSegments>(null!);
//   const { nodes, lines } = useMemo(() => {
//     const n = []; const l = []; const lc = 4; const npl = 16; const ld = 2; const ns = 0.4;
//     for(let i=0;i<lc;i++){const z=i*ld-((lc-1)*ld)/2;for(let j=0;j<npl;j++){const row=Math.floor(j/4)-1.5;const col=(j%4)-1.5;n.push(col*ns,row*ns,z)}}
//     for(let i=0;i<lc-1;i++){for(let j=0;j<npl;j++){for(let k=0;k<npl;k++){if(Math.random()>0.95){const s=i*npl+j;const e=(i+1)*npl+k;l.push(n[s*3],n[s*3+1],n[s*3+2],n[e*3],n[e*3+1],n[e*3+2])}}}}
//     return {nodes:new Float32Array(n),lines:new Float32Array(l)};
//   }, []);

//   useFrame((state) => {
//     const time = state.clock.getElapsedTime();
//     if (nodesRef.current && linesRef.current) {
//       (linesRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
//       nodesRef.current.rotation.y = time * 0.05;
//       linesRef.current.rotation.y = time * 0.05;
//     }
//   });

//   return (
//     <group position={[0, 0.5, 0]}>
//       <points ref={nodesRef}>
//         <bufferGeometry><bufferAttribute attach="attributes-position" count={nodes.length / 3} array={nodes} itemSize={3} /></bufferGeometry>
//         <pointsMaterial size={0.03} color="#00BFFF" />
//       </points>
//       <lineSegments ref={linesRef}>
//         <bufferGeometry><bufferAttribute attach="attributes-position" count={lines.length / 3} array={lines} itemSize={3} /></bufferGeometry>
//         <shaderMaterial uniforms={{ uTime: { value: 0 } }} vertexShader={`uniform float uTime;varying float vOpacity;void main(){vec3 pos=position;float pulse=sin(pos.z*2.-uTime*2.)*.5+.5;vOpacity=pow(pulse,3.)*.6;gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.);}`} fragmentShader={`varying float vOpacity;void main(){gl_FragColor=vec4(.0,.75,1.,vOpacity);}`} transparent={true} blending={THREE.AdditiveBlending} />
//       </lineSegments>
//     </group>
//   );
// }

// function CameraAnimator() {
//   const { camera } = useThree();
//   useEffect(() => {
//     const ctx = gsap.context(() => {
//       gsap.to(camera.position, { z: 5, scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: 1 } });
//     });
//     return () => ctx.revert();
//   }, [camera]);
//   return null;
// }

// function Scene() {
//   return (
//     <>
//       <EffectComposer><Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.5} /></EffectComposer>
//       <ambientLight intensity={0.2} />
//       <directionalLight position={[0, 0, 5]} intensity={0.5} />
//       <NeuralNetwork />
//       <Environment preset="night" />
//     </>
//   );
// }

// // ========== 4. REUSABLE UI COMPONENTS ==========

// function Section({ id, children, className = "" }: { id: string, children: React.ReactNode, className?: string }) {
//   return <section id={id} className={`max-w-5xl mx-auto py-20 md:py-28 px-6 ${className}`}>{children}</section>;
// }

// function SectionHeader({ title, subtitle }: { title: string, subtitle?: string }) {
//     const ref = useRef<HTMLDivElement>(null);
//     useEffect(() => {
//         if (!ref.current) return;
//         const ctx = gsap.context(() => {
//             const el = ref.current!;
//             gsap.fromTo(el.children, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", stagger: 0.2, scrollTrigger: { trigger: el, start: "top 85%" } });
//         });
//         return () => ctx.revert();
//     }, []);
//     return (
//         <div ref={ref} className="mb-12 text-center">
//             <h2 className="text-4xl md:text-5xl font-black font-heading text-slate-800 dark:text-white">{title}</h2>
//             {subtitle && <p className="mt-3 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">{subtitle}</p>}
//         </div>
//     );
// }

// // ========== 5. PAGE SECTIONS ==========

// function Header({ theme, setTheme }: { theme: string, setTheme: (theme: string) => void }) {
//   const { logo } = siteData.personalInfo;
//   return (
//     <header className="fixed top-0 left-0 right-0 z-50">
//       <nav className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
//         <a href="#hero" className="font-black text-lg font-heading text-slate-800 dark:text-white">{logo}</a>
//         <div className="flex items-center gap-4">
//           <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="px-3 py-2 rounded-lg text-sm bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
//             {theme === 'dark' ? '☀️' : '🌙'}
//           </button>
//           <button onClick={() => navTo('contact')} className="px-4 py-2 rounded-lg text-sm font-semibold bg-cyan-500 text-white hover:bg-cyan-600 transition-colors">Contact</button>
//         </div>
//       </nav>
//     </header>
//   );
// }

// function Hero() {
//   const { name, headline, summary, avatarUrl, resumeUrl } = siteData.personalInfo;
//   return (
//     <section id="hero" className="relative h-[100svh] w-full overflow-hidden">
//       <Canvas className="absolute inset-0 z-0" camera={{ position: [0, 0, 3.5], fov: 55 }} dpr={[1, 2]}>
//         <Suspense fallback={null}><Scene /><CameraAnimator /></Suspense>
//       </Canvas>
//       <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
//         <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}><img src={avatarUrl} alt={name} className="w-24 h-24 rounded-full mb-4 border-2 border-slate-500/50" /></motion.div>
//         <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }} className="text-5xl md:text-7xl font-black font-heading leading-tight text-slate-800 dark:text-white">{headline}</motion.h1>
//         <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 1 }} className="mt-4 max-w-2xl text-base md:text-lg text-slate-600 dark:text-slate-400">{summary}</motion.p>
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 1 }} className="mt-8 flex gap-4">
//           <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-lg font-semibold bg-slate-100 dark:bg-white text-slate-900 hover:bg-slate-200 dark:hover:bg-slate-200 transition-colors">View Resume</a>
//           <button onClick={() => navTo('projects')} className="px-6 py-3 rounded-lg font-semibold border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors">View Projects</button>
//         </motion.div>
//       </div>
//     </section>
//   );
// }

// function About() {
//   const { story, timeline } = siteData.about;
//   const ref = useRef<HTMLDivElement>(null);
//   useEffect(() => {
//     gsap.registerPlugin(ScrollTrigger);
//     const ctx = gsap.context(() => {
//       gsap.from('.timeline-event', { opacity: 0, y: 50, stagger: 0.2, ease: 'power2.out', scrollTrigger: { trigger: ref.current, start: 'top 70%' } });
//     }, ref);
//     return () => ctx.revert();
//   }, []);
//   return (
//     <Section id="about">
//       <SectionHeader title="About Me" subtitle="My Story & Motivation" />
//       <p className="max-w-3xl mx-auto text-center text-lg leading-relaxed text-slate-600 dark:text-slate-300">{story}</p>
//       <div ref={ref} className="relative mt-20 max-w-2xl mx-auto">
//         <div className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-0.5 bg-slate-200 dark:bg-slate-700" />
//         {timeline.map((event, index) => (
//           <div key={index} className="timeline-event relative pl-12 md:pl-0">
//             <div className={`flex items-center md:justify-center`}>
//               <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8 md:order-2'}`}>
//                 <div className="p-6 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
//                   <p className="text-cyan-600 dark:text-cyan-400 font-semibold mb-1 text-sm">{event.year}</p>
//                   <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">{event.title}</h3>
//                   <p className="text-slate-600 dark:text-slate-400 text-sm">{event.description}</p>
//                 </div>
//               </div>
//               <div className={`absolute left-0 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-cyan-500 border-4 border-slate-50 dark:border-slate-900 z-10`}/>
//             </div>
//           </div>
//         ))}
//       </div>
//     </Section>
//   );
// }

// function Skills() {
//   return (
//     <Section id="skills">
//       <SectionHeader title="My Arsenal" subtitle="A Palette of Tools & Technologies" />
//       <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} viewport={{ once: true }} className="flex flex-wrap justify-center gap-4">
//         {siteData.skills.map(skill => (
//           <div key={skill.name} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
//             <span className="text-xl">{skill.icon}</span>
//             <span className="font-semibold text-slate-700 dark:text-slate-200">{skill.name}</span>
//           </div>
//         ))}
//       </motion.div>
//     </Section>
//   );
// }

// function Projects() {
//     return (
//         <Section id="projects">
//             <SectionHeader title="Signature Projects" subtitle="Where Ideas Meet Execution" />
//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//                 {siteData.projects.map(p => (
//                     <a key={p.title} href={p.links.find(l => l.label.includes("Demo") || l.label.includes("GitHub"))?.href || '#'} target="_blank" rel="noopener noreferrer" className="block p-6 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 group hover:border-cyan-500/50 dark:hover:border-cyan-400/50 transition-all hover:-translate-y-1">
//                         <h3 className="font-bold text-xl text-slate-800 dark:text-white mb-2 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">{p.title}</h3>
//                         <p className="text-slate-600 dark:text-slate-400 mb-4">{p.desc}</p>
//                         <div className="flex flex-wrap gap-2">
//                             {p.tech.map(t => <span key={t} className="text-xs px-2 py-1 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{t}</span>)}
//                         </div>
//                     </a>
//                 ))}
//             </div>
//         </Section>
//     );
// }

// function Contact() {
//   const { email, socialLinks } = siteData.personalInfo;
//   return (
//     <Section id="contact" className="text-center">
//       <SectionHeader title="Let's Connect" subtitle="Have a project in mind or just want to say hi? My inbox is always open." />
//       <a href={`mailto:${email}`} className="text-2xl md:text-4xl font-semibold font-heading text-slate-800 dark:text-slate-100 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors break-all">{email}</a>
//       <div className="flex justify-center gap-6 mt-8">
//         <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-cyan-400 transition-colors">GitHub</a>
//         <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-cyan-400 transition-colors">LinkedIn</a>
//         <a href={socialLinks.kaggle} target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-cyan-400 transition-colors">Kaggle</a>
//       </div>
//     </Section>
//   );
// }

// function Chatbot() {
//   const [isOpen, setIsOpen] = useState(false);
//   return (
//     <div className="fixed bottom-6 right-6 z-50">
//       <div className={`transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
//         <div className="w-80 h-96 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-2xl mb-4 flex flex-col">
//           <div className="p-4 border-b border-slate-200 dark:border-slate-700">
//             <h3 className="font-bold text-slate-800 dark:text-white">AI Assistant</h3>
//             <p className="text-xs text-slate-500 dark:text-slate-400">Ask me about Narendra's skills or projects.</p>
//           </div>
//           <div className="flex-grow p-4 text-sm text-slate-600 dark:text-slate-300">
//             <p>Hello! How can I help you?</p>
//           </div>
//           <div className="p-2 border-t border-slate-200 dark:border-slate-700">
//             <input type="text" placeholder="Type your question..." className="w-full bg-slate-200 dark:bg-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
//           </div>
//         </div>
//       </div>
//       <button onClick={() => setIsOpen(!isOpen)} className="w-16 h-16 bg-cyan-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-cyan-600 transition-colors text-3xl">
//         🤖
//       </button>
//     </div>
//   );
// }


// // ========== 6. ROOT COMPONENT ==========

// export default function UltraPortfolio() {
//   const [theme, setTheme] = useState('dark');
//   const mousePosition = useMousePosition();

//   useEffect(() => {
//     document.documentElement.className = theme;
//     gsap.registerPlugin(ScrollTrigger);
//   }, [theme]);

//   return (
//     <>
//       <div className="pointer-events-none fixed inset-0 z-40 transition duration-300" style={{ background: `radial-gradient(400px at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 78, 216, 0.15), transparent 80%)` }} />
//       <Header theme={theme} setTheme={setTheme} />
//       <main className="bg-slate-50 dark:bg-slate-900 font-sans text-slate-700 dark:text-slate-300">
//         <Hero />
//         <About />
//         <Skills />
//         <Projects />
//         <Contact />
//       </main>
//       <Chatbot />
//     </>
//   );
// }