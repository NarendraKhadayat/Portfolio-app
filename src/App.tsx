// React & Core Libraries
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useForm, ValidationError } from '@formspree/react';

// 3D Helpers & Effects
import { shaderMaterial, Html, Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from '@react-three/postprocessing';

// Animation Libraries
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";

//TYPE DEFINITIONS
type MagneticButtonProps = { children: React.ReactNode; onClick: () => void; };
type SectionProps = { id: string; title: string; subtitle?: string; children?: React.ReactNode; };
type ProjectLink = { label: string; href: string; };
type Project = { title:string; tag: string; desc: string; links: ProjectLink[]; imageUrl?: string; };
type ProjectCardProps = { p: Project; };

// UTILITY 
const navTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

// 3D SHADERS & MATERIALS
const AuroraMaterial = shaderMaterial(
  { uTime: 0, uMouse: new THREE.Vector2(0.5, 0.5), uRes: new THREE.Vector2(1, 1) },
  `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  ` precision highp float; varying vec2 vUv; uniform float uTime; uniform vec2 uMouse; uniform vec2 uRes;
    vec3 hash3(vec2 p){ vec3 q = vec3(dot(p, vec2(127.1,311.7)), dot(p, vec2(269.5,183.3)), dot(p, vec2(419.2,371.9))); return fract(sin(q)*43758.5453); }
    float noise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); vec3 a = hash3(i); vec3 b = hash3(i + vec2(1.,0.)); vec3 c = hash3(i + vec2(0.,1.)); vec3 d = hash3(i + vec2(1.,1.)); vec2 u = f*f*(3.0-2.0*f); return mix(mix(a.x, b.x, u.x), mix(c.x, d.x, u.x), u.y); }
    void main() { vec2 uv = vUv * 2.0 - 1.0; uv.x *= uRes.x / uRes.y; vec2 m = (uMouse*2.0-1.0); m.x *= uRes.x / uRes.y; float t = uTime*0.07; float n = 0.0; vec2 p = uv*0.8; for(int i=0;i<5;i++){ float z = float(i); vec2 pp = p + vec2(sin(t+z*1.7), cos(t*1.3+z))*0.4 + m*0.2; n += noise(pp*2.0 + z*3.0); p *= 1.7; } n /= 5.0; vec3 c1 = vec3(0.05, 0.02, 0.09); vec3 c2 = vec3(0.16, 0.56, 0.99); vec3 c3 = vec3(0.67, 0.08, 0.98); vec3 c4 = vec3(0.04, 0.98, 0.73); float glow = smoothstep(0.4, 1.0, n); vec3 col = mix(c1, c2, n); col = mix(col, c3, smoothstep(0.2, 0.9, n + 0.2*sin(t*0.7))); col = mix(col, c4, glow*0.6); float vign = smoothstep(1.2, 0.1, length(uv)); col *= vign; col = col/(col+vec3(1.0)); gl_FragColor = vec4(col, 1.0); }`
);

function makeShader(mode: string) {
  const shaderBodies: { [key: string]: string } = { /* Shade bodies remain the same */ };
  shaderBodies.Aurora = `float fbm(vec2 p){ float a = 0.0; float w=0.5; mat2 r = mat2(0.8, -0.6, 0.6, 0.8); for(int i=0;i<5;i++){ a+=w*fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); p=r*p*1.9; w*=0.5; } return a; } void main(){ vec2 uv = vUv*2.0-1.0; uv.x*=uRes.x/uRes.y; float t = uTime*0.2 + float(uSeed); float n = fbm(uv*1.2 + vec2(sin(t), cos(t*1.2))*0.3); vec3 a = vec3(0.04,0.98,0.73); vec3 b = vec3(0.67,0.08,0.98); vec3 c = vec3(0.16,0.56,0.99); vec3 col = mix(mix(c,b,n), a, smoothstep(0.3,0.9,n)); col *= 0.8+0.2*sin(t+length(uv)*3.0); col = col/(col+1.0); gl_FragColor = vec4(col,1.0); }`;
  shaderBodies.Plasma = `float sdCircle(vec2 p, float r){ return length(p)-r; } void main(){ vec2 uv = vUv*2.0-1.0; uv.x*=uRes.x/uRes.y; float t = uTime*0.8 + float(uSeed)*0.3; float v = 0.0; for(int i=0;i<6;i++){ vec2 c = vec2(sin(t*0.7+float(i)*1.3), cos(t*0.5+float(i)*1.7))*0.5; float d = sdCircle(uv-c, 0.35+0.12*sin(t+float(i))); v += 0.6/abs(d*6.0+0.2); } vec3 col = vec3(0.05,0.02,0.09) + vec3(v*0.15, v*0.35, v*0.6); gl_FragColor = vec4(col,1.0); }`;
  shaderBodies.Quantum = `float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); } float voronoi(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); float res=1.0; for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++){ vec2 g = vec2(x,y); vec2 o = vec2(hash(i+g), hash(i+g+23.1)); vec2 r = g + o - f; res = min(res, dot(r,r)); } return sqrt(res); } void main(){ vec2 uv = vUv*2.0-1.0; uv.x*=uRes.x/uRes.y; float t = uTime*0.6 + float(uSeed); float v = voronoi(uv*3.0 + vec2(sin(t), cos(t))); vec3 a = vec3(0.04,0.98,0.73); vec3 b = vec3(0.67,0.08,0.98); vec3 c = vec3(0.16,0.56,0.99); vec3 col = mix(a,b,smoothstep(0.1,0.8,v)); col = mix(col,c,0.5+0.5*sin(v*12.0 - t*2.0)); gl_FragColor = vec4(col,1.0); }`;
  const vertexShader = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  const fragmentShader = `precision highp float; varying vec2 vUv; uniform float uTime; uniform float uSeed; uniform vec2 uMouse; uniform vec2 uRes; ${shaderBodies[mode]}`;
  return shaderMaterial({ uTime: 0, uSeed: 0, uMouse: new THREE.Vector2(0.5, 0.5), uRes: new THREE.Vector2(1, 1) }, vertexShader, fragmentShader);
}

// 3D COMPONENTS

function NeuralNetwork() {
  const nodesRef = useRef<THREE.Points>(null!);
  const linesRef = useRef<THREE.LineSegments>(null!);

  const { nodes, lines } = useMemo(() => {
    const nodes = [];
    const lines = [];
    const layerCount = 4; const nodesPerLayer = 16; const layerDepth = 2; const nodeSpacing = 0.4;
    for (let i = 0; i < layerCount; i++) {
      const z = i * layerDepth - ((layerCount - 1) * layerDepth) / 2;
      for (let j = 0; j < nodesPerLayer; j++) {
        const row = Math.floor(j / 4) - 1.5;
        const col = (j % 4) - 1.5;
        nodes.push(col * nodeSpacing, row * nodeSpacing, z);
      }
    }
    for (let i = 0; i < layerCount - 1; i++) {
      for (let j = 0; j < nodesPerLayer; j++) {
        for (let k = 0; k < nodesPerLayer; k++) {
          if (Math.random() > 0.95) {
            const startNodeIndex = i * nodesPerLayer + j;
            const endNodeIndex = (i + 1) * nodesPerLayer + k;
            lines.push(nodes[startNodeIndex * 3], nodes[startNodeIndex * 3 + 1], nodes[startNodeIndex * 3 + 2], nodes[endNodeIndex * 3], nodes[endNodeIndex * 3 + 1], nodes[endNodeIndex * 3 + 2]);
          }
        }
      }
    }
    return { nodes: new Float32Array(nodes), lines: new Float32Array(lines) };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (nodesRef.current && linesRef.current) {
      (linesRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
      nodesRef.current.rotation.y = time * 0.05;
      linesRef.current.rotation.y = time * 0.05;
    }
  });

  return (
    <group position={[0, 0.5, 0]}>
      {/* Neurons in array */}
      <points ref={nodesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nodes, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.03} color="#00BFFF" />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lines, 3]} />
        </bufferGeometry>
        <shaderMaterial uniforms={{ uTime: { value: 0 } }} vertexShader={`uniform float uTime;varying float vOpacity;void main(){vec3 pos=position;float pulse=sin(pos.z*2.-uTime*2.)*.5+.5;vOpacity=pow(pulse,3.)*.6;gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.);}`} fragmentShader={`varying float vOpacity;void main(){gl_FragColor=vec4(.0,.75,1.,vOpacity);}`} transparent={true} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </group>
  );
}

function GalaxyDust() {
  const ref = useRef<THREE.Points>(null!);

  const particles = useMemo(() => {
    const count = 5000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      const r = 4 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta); // x
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta); // y
      positions[i * 3 + 2] = r * Math.cos(phi); // z
    }
    return positions;
  }, []);

  useFrame(() => { if(ref.current) { ref.current.rotation.y += 0.0002; } });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.015} color="#5B86E5" />
    </points>
  );
}

function AuroraPlane({ mouseRef }: { mouseRef: React.MutableRefObject<THREE.Vector2> }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const material = useMemo(() => new AuroraMaterial(), []);
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.getElapsedTime();
    material.uniforms.uMouse.value = mouseRef.current;
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.05) * 0.02;
    }
  });
  return (<mesh ref={meshRef} position={[0, 0, -2]} scale={[8, 4.5, 1]} material={material}><planeGeometry args={[2, 1, 64, 64]} /></mesh>);
}

function Scene({ mouseRef }: { mouseRef: React.MutableRefObject<THREE.Vector2> }) {
  return (
    <>
      <EffectComposer><Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.5} /></EffectComposer>
      <ambientLight intensity={0.2} />
      <directionalLight position={[0, 0, 5]} intensity={0.5} />
      <NeuralNetwork />
      <AuroraPlane mouseRef={mouseRef} />
      <GalaxyDust />
      <Environment files="/potsdamer_platz_1k.hdr" />
    </>
  );
}

function CameraAnimator() {
  const { camera } = useThree();
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(camera.position, { z: 5, scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: 1 } });
    });
    return () => ctx.revert(); 
  }, [camera]);
  return null;
}

// UI COMPONENTS 
function MagneticButton({ children, onClick }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      setPos({ x: relX * 0.25, y: relY * 0.25 });
    };
    const handleLeave = () => setPos({ x: 0, y: 0 });
    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <button ref={ref} onClick={onClick} className="relative group px-6 py-3 rounded-2xl bg-white/10 backdrop-blur border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all overflow-hidden" style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}>
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-teal-300/30 via-fuchsia-400/30 to-blue-500/30" />
      <span className="relative font-semibold tracking-wide">{children}</span>
    </button>
  );
}


function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const show = gsap.to("#nav", { backgroundColor: "rgba(5,8,13,0.6)", backdropFilter: "blur(8px)", duration: 0.3, paused: true });
    ScrollTrigger.create({ start: 10, onUpdate: (self) => { if (self.scroll() > 10) show.play(); else show.reverse(); } });
  }, []);

  const links = [{ id: "hero", label: "Home" }, { id: "about", label: "About" }, { id: "skills", label: "Skills" }, { id: "projects", label: "Projects" }, { id: "lab", label: "PlayGround" }, { id: "contact", label: "Contact" }];

  const MobileMenu = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-lg flex flex-col items-center justify-center"
    >
      <div className="flex flex-col items-center gap-6">
        {links.map((link, index) => (
          <motion.button
            key={link.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, ease: "easeOut" }}
            onClick={() => {
              navTo(link.id);
              setIsMenuOpen(false);
            }}
            className="text-2xl font-semibold text-white/80 hover:text-white transition-colors"
          >
            {link.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  return (
    <>
      <nav id="nav" className="fixed z-50 top-4 left-1/2 -translate-x-1/2 w-[92%] md:w-[80%] rounded-2xl px-4 py-3 border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="font-black tracking-widest text-sm md:text-base select-none">
            <span className="text-fuchsia-300">N</span><span className="text-cyan-300">A</span><span className="text-emerald-300">R</span><span className="text-fuchsia-300">E</span><span className="text-cyan-300">N</span><span className="text-emerald-300">द्र</span><span className="text-blue-300">-</span><span className="text-violet-300">PORT</span>
          </div>
          <div className="hidden md:flex gap-4">
            {links.map((l) => (<button key={l.id} onClick={() => navTo(l.id)} className="px-3 py-1 rounded-xl hover:bg-white/10 transition text-sm">{l.label}</button>))}
          </div>
          <div className="md:hidden flex gap-2">
            <MagneticButton onClick={() => setIsMenuOpen(!isMenuOpen)}>Menu</MagneticButton>
            <MagneticButton onClick={() => navTo("contact")}>Collab</MagneticButton>
          </div>
        </div>
      </nav>
      
      <AnimatePresence>
        {isMenuOpen && <MobileMenu />}
      </AnimatePresence>
    </>
  );
}

function Hero() {
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  useEffect(() => {
    const onMove = (e: MouseEvent) => { mouse.current.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight); };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return (
    <section id="hero" className="relative h-[100svh] w-full overflow-hidden">
      <Canvas className="absolute inset-0 z-0" camera={{ position: [0, 0, 3], fov: 55 }} dpr={[1, 2]}>
        <Suspense fallback={<Html><div className="text-white">Loading…</div></Html>}>
          <Scene mouseRef={mouse} />
          <CameraAnimator />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(60%_40%_at_50%_10%,rgba(255,255,255,0.12),rgba(0,0,0,0))]" />
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: "easeOut" }} className="text-5xl md:text-7xl font-black leading-tight bg-gradient-to-r from-cyan-200 via-fuchsia-200 to-emerald-200 bg-clip-text text-transparent drop-shadow">Narendra Khadayat</motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1 }} className="mt-4 max-w-3xl text-base md:text-lg text-white/80"><b>AI/ML Engineer • Web Developer</b><br/>
        I bring together AI, machine learning and web engineering to craft intelligent digital experiences - systems that are fast, scalable, and designed to feel seamless and alive.</motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1 }} className="mt-8 flex gap-4"><MagneticButton onClick={() => navTo("projects")}>The Build Zone</MagneticButton><MagneticButton onClick={() => navTo("contact")}>Let's Talk</MagneticButton></motion.div>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce text-white/70 text-xs tracking-widest flex items-center gap-2">
        <span>SCROLL</span>
        <div className="h-6 w-4 rounded-full border border-white/40 relative overflow-hidden"><span className="absolute left-1/2 -translate-x-1/2 top-1 w-1 h-1 rounded-full bg-white/80 animate-scrollDot" /></div>
      </div>
    </section>
  );
}

function Section({ id, title, subtitle, children }: SectionProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      const el = ref.current!;
      gsap.fromTo(el, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" } });
      const heading = el.querySelector("h2");
      const p = el.querySelector("p");
      if (heading) { gsap.fromTo(heading, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.2, scrollTrigger: { trigger: el, start: "top 85%" } }); }
      if (p) { gsap.fromTo(p, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.4, scrollTrigger: { trigger: el, start: "top 85%" } }); }
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section id={id} ref={ref} className="relative py-24 md:py-36 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10"><h2 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-200 via-cyan-200 to-fuchsia-200 bg-clip-text text-transparent">{title}</h2>{subtitle && <p className="mt-3 text-white/70 max-w-3xl">{subtitle}</p>}</div>
        {children}
      </div>
    </section>
  );
}

function About() {
  return (
    <Section id="about" title="ABOUT ME" subtitle="I'm an undergraduate in B-Tech Computer Science and Engineering from RGPV, Bhopal. Currently, I'm working with various LLM models, as well as Machine Learning and Artificial Intelligence technologies, and I also aim to explore my potential in web and software development. I build intelligent, user-centered products that make life easier and more engaging. I am also a sports enthusiast and love exploring different places around the world.">
      <div className="grid md:grid-cols-3 gap-6">
  <motion.div 
    whileHover={{ y: -6 }} 
    className="p-6 rounded-2xl bg-white/5 border border-cyan-400/50 backdrop-blur 
               transition-all duration-300 
               shadow-[0_0_20px_rgba(0,191,255,0.5)]"
  >
    <h3 className="font-semibold mb-2">Vision</h3>
    <p className="text-white/70">Creating digital experiences that are smart, seamless, and human-centered tools and apps that help users and make a real impact.<br/><br/>
    - Crafting technology with a human touch so let's build something extraordinary together.</p>
  </motion.div>
  
  <motion.div 
    whileHover={{ y: -6 }} 
    className="p-6 rounded-2xl bg-white/5 border border-cyan-400/50 backdrop-blur 
               transition-all duration-300 
               shadow-[0_0_20px_rgba(0,191,255,0.5)]"
  >
    <h3 className="font-semibold mb-2">Stack</h3>
    <p className="text-white/70">Familiar & Working at the intersection of Modern Gen. AI, Different AI/ML Models, Cloud & Web Designs experiences. Focused on products that are engaging, efficient, and built to scale.</p>
  </motion.div>
  
  <motion.div 
    whileHover={{ y: -6 }} 
    className="p-6 rounded-2xl bg-white/5 border border-cyan-400/50 backdrop-blur 
               transition-all duration-300 
               shadow-[0_0_20px_rgba(0,191,255,0.5)]"
  >
    <h3 className="font-semibold mb-2">Impact</h3>
    <p className="text-white/70">Delivering solutions that are creative, efficient, user-friendly, and adaptable, helping users toward their goals faster and smarter while creating measurable outcomes for projects.</p>
  </motion.div>
</div>
    </Section>
  );
}

const skillGroups = [
  { title: "Programming Languages", items: ["Python", "C", "C++", "R", "HTML", "JavaScript", "CSS", "SQL"] },
  { title: "AI/ML", items: ["TensorFlow", "PyTorch", "Keras", "Scikit-learn", "OpenCV", "Pandas", "NumPy", "Matplotlib", "Seaborn", "LSTM", "CNN", "NLP", "Hugging Face"] },
  { title: "Databases & Cloud", items: ["MySQL", "MongoDB", "Firebase", "AWS", "Kebernetes"] },
  { title: "Tools & Platforms", items: ["Git", "Docker", "Kaggle", "Jupyter Notebook", "Google Colab", "VS Code", "Pycharm", "CodeBlocks"] },
];

function Skills() {
  return (
    <Section id="skills" title="SKILLS" subtitle="Turning curiosity into capability with:">
      <div className="grid md:grid-cols-2 gap-6">
        {skillGroups.map((g) => (<motion.div key={g.title} whileHover={{ y: -6 }} className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10"><div className="flex items-center justify-between mb-3"><h3 className="font-semibold">{g.title}</h3><div className="text-xs text-white/60">{g.items.length} tools</div></div><div className="flex flex-wrap gap-2">{g.items.map((s) => (<span key={s} className="px-3 py-1 rounded-xl bg-white/10 border border-white/10 text-sm hover:scale-105 transition-transform">{s}</span>))}</div></motion.div>))}
      </div>
    </Section>
  );
}

const projects: Project[] = [
  { title: "Portfolio | Narendra Khadayat", tag: "Web/App", desc: "Personal portfolio built with React, Three.js, and GSAP. Dynamic 3D BG, custom shaders, & smooth animations.", links: [{ label: "Visit Site", href: "https://narendra-khadayat.vercel.app" }], imageUrl: "/portfolio.png", },
  { title: "Baril", tag: "Webpage", desc: "Web-page for Baril village, To showcase their overall comunity. Javascript, HTML, CSS", links: [{ label: "Visit Page", href: "https://baril-village.vercel.app" }], imageUrl: "/baril.png", },
  { title: "EduFlow ERP", tag: "Full‑Stack", desc: "Under Development.", links: [{ label: "Overview", href: "#" }], imageUrl: "/ComingSoon.jpg", },
  { title: "RT Student	Attendance	System", tag: "Computer Vision", desc: "Automated student attendance using facial recognition, with Python, OpenCV, CV2, Pickel, Numpy & seamless Firebase DB.", links: [{ label: "Case Study", href: "https://github.com/NarendraKhadayat/Face-Attendance-with-real-time-database" }], imageUrl: "/attendance.png", },
  { title: "Image Classifier", tag: "AI/ML", desc: "An image classifier built with PyTorch, then convert it into a command line application.", links: [{ label: "View Model", href: "https://github.com/NarendraKhadayat/Image_Classifier" }], imageUrl: "/imageclassifier.png", },
  { title: "DE-System", tag: "Application", desc: "Under Development.", links: [{ label: "Overview", href: "#" }], imageUrl: "/ComingSoon.jpg", },
  { title: "Sarcasm Detection on YouTube Comments", tag: "ML / NLP", desc: "End to End DL/ML Model design, train & test. Pandas, NumPy, ScikitLearn, Seaborn, Keras, NLTK.", links: [{ label: "Case Study", href: "https://github.com/spring-board-b2-sarcasm-detection/Group-4/tree/Narendra-Khadayat" }], imageUrl: "/sarcasmmodel.png", },
  { title: "Handwritten Digits Classifier", tag: "ML/DL", desc: "Developed a neural network to recognize handwritten digits (classifier) with high accuracy, trained on the MNIST dataset.", links: [{ label: "View Model", href: "https://github.com/NarendraKhadayat/Handwritten-Digits-Classifier" }], imageUrl: "/handdigit.png", },
  { title: "N-GPT", tag: "LLM Model", desc: "Under Development.", links: [{ label: "Overview", href: "#" }], imageUrl: "/ComingSoon.jpg", },
];

function ProjectCard({ p }: ProjectCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      const el = ref.current!;
      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) / r.width;
        const y = (e.clientY - (r.top + r.height / 2)) / r.height;
        gsap.to(el, { rotateY: x * 8, rotateX: -y * 8, transformPerspective: 800, duration: 0.4, ease: "power3.out" });
      };
      const onLeave = () => gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "expo.out" });
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
    }, ref);
    return () => ctx.revert();
  }, []);

  const mainLink = p.links.find(l => l.label.includes("Visit") || l.label.includes("Live Demo"))?.href || 
                   p.links.find(l => l.label.includes("Overview"))?.href ||
                   p.links.find(l => l.label.includes("Case Study"))?.href ||
                   '#';

  return (
    <div ref={ref} className="group p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-cyan-400/10 blur-3xl pointer-events-none" />
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs px-2 py-1 rounded-lg bg-white/10 border border-white/10">{p.tag}</span>
        <div className="flex gap-2">
          {p.links.map((l) => (
            <a 
              key={l.label} 
              href={l.href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm underline underline-offset-4 decoration-dotted hover:opacity-80"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
      <h3 className="text-xl font-semibold">{p.title}</h3>
      <p className="mt-2 text-white/70">{p.desc}</p>
      
      <div className="mt-6 h-40 rounded-xl overflow-hidden bg-white/5 border border-white/10">
        {p.imageUrl ? (
          <a href={mainLink} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative group">
            <img 
              src={p.imageUrl} 
              alt={`${p.title} preview`} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
          </a>
        ) : (
          <div className="h-full w-full [background:repeating-linear-gradient(60deg,rgba(255,255,255,0.05)_0_10px,transparent_10px_20px)] flex items-center justify-center text-white/40 text-sm">
            No Image
          </div>
        )}
      </div>
      
    </div>
  );
}

function Projects() {
  return (
    <Section id="projects" title="PROJECTS" subtitle="The Build Zone - Explore my works.">
      <div className="grid md:grid-cols-3 gap-6">{projects.map((p) => <ProjectCard key={p.title} p={p} />)}</div>
    </Section>
  );
}

function ShaderPreview({ mode, seed }: { mode: string, seed: number }) {
  function ShaderPlane() {
    const meshRef = useRef<THREE.Mesh>(null!);
    const Material = useMemo(() => makeShader(mode), [mode]);
    const material = useMemo(() => new Material(), [Material]);
    useFrame((state) => {
      if (meshRef.current) {
        const mat = meshRef.current.material as THREE.ShaderMaterial;
        if(mat.uniforms.uTime) mat.uniforms.uTime.value = state.clock.getElapsedTime();
        if(mat.uniforms.uSeed) mat.uniforms.uSeed.value = seed;
      }
    });
    return (<mesh ref={meshRef} material={material}><planeGeometry args={[2, 1, 64, 64]} /></mesh>);
  }
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 h-[320px]">
      <Canvas camera={{ position: [0, 0, 1.5], fov: 60 }} dpr={[1, 2]}>
        <Suspense fallback={null}><ShaderPlane /></Suspense>
      </Canvas>
    </div>
  );
}

function NeuralLab() {
  const [mode, setMode] = useState("Aurora");
  const [seed, setSeed] = useState(1);
  const modes = ["Aurora", "Plasma", "Quantum"];

  return (
    <Section id="lab" title="PLAY-GROUND" subtitle="Interact with the live engine that paints this portfolio. Procedural, responsive, and infinitely variable.">
      
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {modes.map((m) => (
          <button 
            key={m} 
            onClick={() => setMode(m)} 
            className={`px-3 py-1 rounded-xl border transition-colors text-white/80 ${mode === m ? "bg-white/20 border-white/40" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
          >
            {m}
          </button>
        ))}
        <button 
          onClick={() => setSeed((s) => s + 1)} 
          className="px-3 py-1 rounded-xl bg-white/10 border border-white/10 text-white/80 hover:bg-white/20 transition-colors"
        >
          Randomize
        </button>
      </div>

      <div className="relative">
        <ShaderPreview mode={mode} seed={seed} />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="absolute bottom-0 left-0 right-0 p-6 bg-black/20 backdrop-blur-md border-t border-white/10 rounded-b-2xl"
        >
          <h3 className="font-semibold text-white mb-2">What you’re seeing</h3>
          <p className="text-sm text-white/70">
            A real‑time GPU shader creating generative art. It uses mathematical noise to generate infinite, unique patterns based on the "mode" you select. This entire visual is 100% code.
          </p>
        </motion.div>
      </div>
    </Section>
  );
}


function Contact() {
  const [state, handleSubmit] = useForm("mqadazdv");

  return (
    <Section id="contact" title="CONTACT" subtitle="Let's make something out of the box.">
      <div className="grid md:grid-cols-2 gap-6">
        
        {state.succeeded ? (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-center items-center text-center h-full">
            <h3 className="font-semibold text-2xl text-white">Thank You!</h3>
            <p className="text-white/70 mt-2">Your message has been sent successfully. I'll get back to you soon.</p>
          </div>
        ) : (

          <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div>
              <label htmlFor="name" className="text-sm text-white/70">Name</label>
              <input id="name" type="text" name="name" required className="mt-1 w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40" placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="email" className="text-sm text-white/70">Email</label>
              <input id="email" type="email" name="email" required className="mt-1 w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/40" placeholder="Your Email" />
              <ValidationError prefix="Email" field="email" errors={state.errors} className="text-red-400 text-xs mt-1" />
            </div>
            <div>
              <label htmlFor="message" className="text-sm text-white/70">Message</label>
              <textarea id="message" name="message" rows={5} required className="mt-1 w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 focus:outline-none" placeholder="Tell me about your idea…"></textarea>
              <ValidationError prefix="Message" field="message" errors={state.errors} className="text-red-400 text-xs mt-1" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={state.submitting} className="px-6 py-3 rounded-2xl bg-white/10 border border-white/20 font-semibold tracking-wide disabled:opacity-50">
                {state.submitting ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        )}


        <div 
          className="p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden"
        >
          <img 
            src="/portrait2.png"
            alt="Glowing portrait background image"
            className="absolute inset-0 w-full h-full object-contain z-0"
            style={{ 
              opacity: 0.8,
              filter: "drop-shadow(0 0 15px rgba(0, 191, 255, 0.8))" }}
          />
          <div className="relative z-10">
            <h3 className="font-semibold text-2xl mb-4 text-white">Find me on</h3>
            <div className="space-y-3">
              <a href="https://github.com/NarendraKhadayat" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-black/30 hover:bg-black/50 border border-white/10 transition-all duration-300 hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                <span className="font-semibold">GitHub</span>
              </a>
              <a href="https://www.linkedin.com/in/narendra-khadayat-821aa81ba/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-black/30 hover:bg-black/50 border border-white/10 transition-all duration-300 hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                <span className="font-semibold">LinkedIn</span>
              </a>
              <a href="https://leetcode.com/u/Narendra_Khadayat/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-black/30 hover:bg-black/50 border border-white/10 transition-all duration-300 hover:scale-105">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white/70"><path d="M13.483 0a1.374 1.374 0 0 0-1.374 1.374v10.115h-5.996V1.374A1.374 1.374 0 0 0 4.739 0H1.374A1.374 1.374 0 0 0 0 1.374v18.252A1.374 1.374 0 0 0 1.374 21h3.365a1.374 1.374 0 0 0 1.374-1.374v-5.255h5.996v5.255a1.374 1.374 0 0 0 1.374 1.374h3.365a1.374 1.374 0 0 0 1.374-1.374V1.374A1.374 1.374 0 0 0 18.261 0h-4.778zM22.626 24h-3.365a1.374 1.374 0 0 1-1.374-1.374v-5.255H11.89V22.626A1.374 1.374 0 0 1 10.517 24H7.152a1.374 1.374 0 0 1-1.374-1.374V3.374A1.374 1.374 0 0 1 7.152 2h3.365a1.374 1.374 0 0 1 1.374 1.374v10.115h5.996V3.374A1.374 1.374 0 0 1 19.261 2h3.365a1.374 1.374 0 0 1 1.374 1.374v19.252A1.374 1.374 0 0 1 22.626 24z"></path></svg>
                <span className="font-semibold">LeetCode</span>
              </a>
              <a href="https://discord.com/users/1115298133124075530" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-black/30 hover:bg-black/50 border border-white/10 transition-all duration-300 hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white/70"><path d="M19.54 0c1.356 0 2.46 1.104 2.46 2.46v19.08c0 1.356-1.104 2.46-2.46 2.46H4.46C3.104 24 2 22.896 2 21.54V2.46C2 1.104 3.104 0 4.46 0h15.08zm-2.46 6.96h-1.44c-.432 0-.816.36-1.008.744-2.256-1.44-4.824-1.44-7.08 0-.192-.384-.576-.744-1.008-.744H4.5v10.08h1.44c.432 0 .816-.36.984-.72 1.44.72 2.88 1.224 4.584 1.224 1.704 0 3.144-.504 4.584-1.224.168.36.528.72.984.72h1.44V6.96zM8.76 13.8c-.84 0-1.536-.672-1.536-1.512s.696-1.512 1.536-1.512c.816 0 1.536.672 1.536 1.512s-.72 1.512-1.536 1.512zm6.48 0c-.84 0-1.536-.672-1.536-1.512s.696-1.512 1.536-1.512c.816 0 1.536.672 1.536 1.512s-.72 1.512-1.536 1.512z"></path></svg>
                <span className="font-semibold">Discord</span>
              </a>
              <a href="mailto:narendrakhadayat50@gmail.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-black/30 hover:bg-black/50 border border-white/10 transition-all duration-300 hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white/70"><path d="M24 4.5v15c0 .825-.675 1.5-1.5 1.5H1.5C.675 21 0 20.325 0 19.5v-15C0 3.675.675 3 1.5 3h21C23.325 3 24 3.675 24 4.5zm-1.5-1.5L12 11.25 1.5 3h21zm-21 15h21v-12.25L12 14.25 1.5 6.75V18z"></path></svg>
                <span className="font-semibold">Gmail</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="py-12 text-center text-white/60">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-center gap-2 text-sm">
          <span>© {new Date().getFullYear()} Narendra Khadayat</span>
          <span className="opacity-80">❤️</span>
        </div>
      </div>
    </footer>
  );
}

// ROOT COMPONENT 
export default function UltraPortfolio() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHoveringLink, setIsHoveringLink] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
      const target = event.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'a' || target.tagName.toLowerCase() === 'button') {
        setIsHoveringLink(true);
      } else {
        setIsHoveringLink(false);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => { window.removeEventListener('mousemove', handleMouseMove); };
  }, []);

  const cursorSize = isHoveringLink ? 40 : 20;

  return (
    <div className="min-h-screen w-full text-white bg-[#0a0d14] selection:bg-fuchsia-400/30 selection:text-white">
      <div className="pointer-events-none fixed inset-0 z-30 transition duration-300" style={{ background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 78, 216, 0.15), transparent 80%)` }}/>
      <div className="pointer-events-none fixed -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur-sm transition-all duration-300" style={{ left: mousePosition.x, top: mousePosition.y, width: cursorSize, height: cursorSize, }}/>
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <NeuralLab />
      <Contact />
      <Footer />
    </div>
  );
}
