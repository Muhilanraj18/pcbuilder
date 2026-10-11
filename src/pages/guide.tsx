import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Cpu, Zap, MemoryStick, HardDrive, Box, MonitorCheck, Fan, Keyboard, Mouse, IndianRupee } from 'lucide-react';

interface ComponentSection {
  icon: any;
  name: string;
  emoji: string;
  tagline: string;
  what: string;
  matters: {
    budget: string;
    gaming: string;
    coding: string;
  };
  tips: string[];
  budgetRange: string;
}

const components: ComponentSection[] = [
  {
    icon: Cpu,
    name: 'CPU (Processor)',
    emoji: '🧠',
    tagline: 'The brain of your PC',
    what: 'The Central Processing Unit runs every instruction your computer executes — from opening a browser tab to rendering a video. Every task you do involves the CPU.',
    matters: {
      budget: 'A mid-range CPU (Ryzen 5 / Core i5) is the sweet spot for ₹30k–₹80k builds. You don\'t need the most cores — clock speed matters more for everyday tasks.',
      gaming: 'Gaming is mostly GPU-limited, so a mid-range CPU paired with a good GPU is the smart move. Don\'t overspend on a flagship CPU for gaming only.',
      coding: 'More cores = faster compile times. If you compile large codebases or run VMs, invest more here. AMD Ryzen 7/9 or Intel Core i7/i9 are excellent for dev work.',
    },
    tips: [
      'Intel and AMD are both great — choose based on price-to-performance at the time you buy.',
      'The letter "K" in Intel CPUs means it can be overclocked. Only useful if you have a Z-series motherboard.',
      'AMD Ryzen CPUs with a "G" suffix have built-in graphics — useful if you skip a GPU for now.',
    ],
    budgetRange: '₹7,000 – ₹55,000',
  },
  {
    icon: Zap,
    name: 'GPU (Graphics Card)',
    emoji: '🎮',
    tagline: 'Makes games and visuals beautiful',
    what: 'The Graphics Processing Unit renders every frame you see on screen. For gaming, video editing, 3D work, and AI tasks it\'s the most important component. For office/coding work, you can skip it if your CPU has integrated graphics.',
    matters: {
      budget: 'For ₹30k–₹50k gaming builds, an RTX 3050 or RX 6600 gives solid 1080p gaming. Don\'t expect 4K at these prices.',
      gaming: 'This is where to spend the most in a gaming build — 35–40% of budget. An RTX 4060 handles 1080p/1440p beautifully. RTX 4070+ for 1440p/4K.',
      coding: 'Most coding work doesn\'t need a GPU. Skip it unless you\'re doing ML/AI work, in which case NVIDIA GPUs with CUDA support are essential.',
    },
    tips: [
      'NVIDIA RTX cards have ray tracing and DLSS — useful for modern games.',
      'AMD Radeon RX cards often offer better value per rupee at mid-range.',
      'VRAM (video memory) matters: 8GB is minimum for modern 1080p gaming, 12GB+ for 1440p.',
    ],
    budgetRange: '₹6,000 – ₹1,80,000',
  },
  {
    icon: Cpu,
    name: 'Motherboard',
    emoji: '🔌',
    tagline: 'Connects everything together',
    what: 'The motherboard is the spine of your PC — every component plugs into it. It must be compatible with your CPU (matching socket) and support the RAM type you choose.',
    matters: {
      budget: 'Don\'t overspend on a motherboard for a budget build. An H610 (Intel) or A520 (AMD) board does the job well under ₹7,000.',
      gaming: 'A B660 or B550 board offers good value with USB 3.0, M.2 slots, and decent VRM for overclocking headroom.',
      coding: 'Multiple M.2 slots (for fast NVMe SSDs) and plenty of USB ports matter more than RGB or overclocking features.',
    },
    tips: [
      'Socket must match your CPU — Intel and AMD use different sockets that are not interchangeable.',
      'ATX = full size, Micro-ATX = smaller, Mini-ITX = very compact. All work with standard parts.',
      'Check how many M.2 slots it has if you want multiple fast SSDs.',
    ],
    budgetRange: '₹5,000 – ₹73,000',
  },
  {
    icon: MemoryStick,
    name: 'RAM (Memory)',
    emoji: '💾',
    tagline: 'Short-term memory for multitasking',
    what: 'RAM holds data that the CPU is actively using. More RAM means you can have more programs and browser tabs open at once without slowing down. It does not store data permanently.',
    matters: {
      budget: '16GB DDR4 is the minimum sweet spot for any build in 2024. 8GB will feel limiting quickly.',
      gaming: '16GB is enough for gaming. 32GB gives headroom if you stream or have many background apps.',
      coding: '32GB is recommended for running VMs, Docker containers, or large IDEs. 64GB if you do heavy data work.',
    },
    tips: [
      'DDR4 vs DDR5 depends on your motherboard — they\'re not interchangeable.',
      'Dual-channel (2 sticks instead of 1) gives a noticeable performance boost in most systems.',
      'RAM speed (MHz) matters less than capacity — get more GB over faster MHz.',
    ],
    budgetRange: '₹1,900 – ₹22,000',
  },
  {
    icon: HardDrive,
    name: 'Storage (SSD/HDD)',
    emoji: '💿',
    tagline: 'Stores everything permanently',
    what: 'Unlike RAM, storage keeps your data even when the PC is off. NVMe SSDs are the fastest (used for Windows and games), SATA SSDs are decent and cheaper, and HDDs are slow but cheapest per GB for large files.',
    matters: {
      budget: 'A 500GB NVMe SSD for Windows + apps, and a 1TB HDD for files is a great combo under ₹5,000.',
      gaming: '1TB NVMe SSD minimum — modern games are 50–100GB each. A 2TB is even better.',
      coding: '1TB NVMe SSD is plenty for code. Add a large HDD if you work with big datasets or VMs.',
    },
    tips: [
      'NVMe M.2 SSDs are 5–7× faster than SATA SSDs for large file transfers.',
      'HDDs are still worth it for mass storage of movies, backups, and large files — not for your OS.',
      'Always install Windows on an SSD — boot time difference is dramatic.',
    ],
    budgetRange: '₹1,600 – ₹17,000',
  },
  {
    icon: Zap,
    name: 'PSU (Power Supply)',
    emoji: '⚡',
    tagline: 'Electricity for your entire system',
    what: 'The Power Supply Unit converts wall power into the voltages your components need. A poor quality or underpowered PSU can damage your entire build. Don\'t cheap out here.',
    matters: {
      budget: '450W–550W 80+ Bronze is enough for a CPU+integrated graphics or entry GPU build.',
      gaming: 'A gaming rig with an RTX 4070 needs at least a 650W Gold-rated PSU. Higher wattage gives headroom for upgrades.',
      coding: '550W–650W 80+ Bronze or Gold is sufficient for most coding builds without a dedicated GPU.',
    },
    tips: [
      '80+ Bronze/Silver/Gold/Platinum ratings indicate efficiency — Gold is the sweet spot for value.',
      'Always buy at least 20% more wattage than your components need, for safety headroom.',
      'Modular PSUs (detachable cables) make cable management much cleaner.',
    ],
    budgetRange: '₹2,000 – ₹20,000',
  },
  {
    icon: Box,
    name: 'Cabinet (PC Case)',
    emoji: '🖥️',
    tagline: 'Houses and protects your components',
    what: 'The case holds every component securely and determines airflow, which affects temperatures and therefore performance and longevity. It also affects how the PC looks on your desk.',
    matters: {
      budget: 'Any Mid Tower case from Ant Esports or Deepcool does the job. Don\'t spend more than ₹3,000 on a budget build.',
      gaming: 'Good airflow matters more for gaming — look for mesh front panels. Corsair 4000D Airflow or NZXT H510 are excellent picks.',
      coding: 'Any mid tower with decent airflow. Prioritize cable management space if you care about a clean interior.',
    },
    tips: [
      'Check form factor compatibility — most cases support ATX and Micro-ATX motherboards.',
      'Mesh front panels allow better airflow than solid panels.',
      'Tempered glass side panels let you see your components but add cost.',
    ],
    budgetRange: '₹2,000 – ₹19,000',
  },
  {
    icon: MonitorCheck,
    name: 'Monitor',
    emoji: '🖥️',
    tagline: 'Your window to everything',
    what: 'The monitor determines what resolution and refresh rate you can see. Key specs: panel size, resolution (1080p/1440p/4K), and refresh rate (60Hz/144Hz/165Hz/240Hz).',
    matters: {
      budget: 'A 22"–24" FHD (1080p) 75Hz IPS monitor is perfectly good for everyday use under ₹8,000.',
      gaming: '24" FHD 144Hz+ is the sweet spot for competitive gaming. 27" QHD 165Hz is ideal for immersive gaming with a good GPU.',
      coding: '27"+ IPS panel at 1440p gives you more screen real estate for code — worth the investment for productivity.',
    },
    tips: [
      'IPS panels have better colour and viewing angles than VA or TN.',
      'For competitive gaming (shooters), prioritize refresh rate (144Hz+) over resolution.',
      'For content creation and productivity, prioritize colour accuracy and resolution (1440p+).',
    ],
    budgetRange: '₹5,500 – ₹60,000',
  },
  {
    icon: Fan,
    name: 'CPU Cooler',
    emoji: '❄️',
    tagline: 'Keeps your processor from overheating',
    what: 'CPUs generate heat when running. A cooler dissipates that heat. Many CPUs include a stock cooler in the box, which works fine at stock speeds. Aftermarket coolers run quieter and allow overclocking.',
    matters: {
      budget: 'The included stock cooler is fine for budget and mid-range builds. Save money here.',
      gaming: 'An aftermarket air cooler (Hyper 212, DeepCool AK400) keeps temps lower under sustained gaming loads.',
      coding: 'For heavy compile workloads, a 240mm AIO liquid cooler keeps the CPU happy during extended sessions.',
    },
    tips: [
      'AIO liquid coolers look impressive and work great but cost more and have more parts that can fail.',
      'Air coolers like the Noctua NH-D15 rival expensive AIOs at lower cost.',
      'Check cooler height compatibility with your case before buying a tall tower cooler.',
    ],
    budgetRange: '₹0 (stock) – ₹25,000',
  },
  {
    icon: Keyboard,
    name: 'Keyboard & Mouse',
    emoji: '⌨️',
    tagline: 'Your primary input devices',
    what: 'Your hands spend all their time here, so comfort matters. Mechanical keyboards have physical switches that feel and sound distinct. Gaming mice have higher DPI sensors and extra buttons.',
    matters: {
      budget: 'A basic membrane keyboard (Logitech K120) and wired mouse (Logitech G102) work perfectly under ₹1,000 combined.',
      gaming: 'A mechanical keyboard with tactile switches and a gaming mouse with 400–3200 DPI range improve precision. Budget ₹4,000–₹10,000 for decent gaming peripherals.',
      coding: 'Mechanical keyboards with tactile (not clicky) switches like Cherry MX Brown are popular for long typing sessions.',
    },
    tips: [
      'Membrane keyboards are quiet and cheap. Mechanical keyboards have better tactile feel and last longer.',
      'For gaming mice, 12,000 DPI sensors are fine — you don\'t need 25,000 DPI.',
      'Wireless peripherals have improved dramatically — modern wireless gaming mice have zero perceptible lag.',
    ],
    budgetRange: '₹200 – ₹35,000',
  },
];

const GuidePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>PC Component Guide | PC Builder India</title>
        <meta
          name="description"
          content="Learn what each PC component does, why it matters for your use case, and how to choose the right one for your budget. Beginner-friendly guide for Indian PC builders."
        />
      </Head>

      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="max-w-4xl mx-auto">

          {/* Back */}
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to PC Builder
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-3">PC Component Guide</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Everything you need to know about each part — what it does, why it matters for your use case,
              and how to pick the right one. No jargon.
            </p>
          </motion.div>

          {/* Table of contents */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-10"
          >
            <h2 className="font-bold text-gray-900 mb-4">Jump to</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {components.map((c) => (
                <a
                  key={c.name}
                  href={`#${c.name.replace(/[^a-z]/gi, '-').toLowerCase()}`}
                  className="text-sm text-primary-600 hover:text-primary-700 hover:underline font-medium"
                >
                  {c.emoji} {c.name}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Component sections */}
          <div className="space-y-10">
            {components.map((comp, index) => {
              const IconComponent = comp.icon;
              return (
                <motion.section
                  key={comp.name}
                  id={comp.name.replace(/[^a-z]/gi, '-').toLowerCase()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden scroll-mt-8"
                >
                  {/* Section header */}
                  <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-primary-200 text-sm font-medium">{comp.emoji}</div>
                      <h2 className="text-white font-bold text-xl">{comp.name}</h2>
                      <p className="text-primary-100 text-sm">{comp.tagline}</p>
                    </div>
                    <div className="ml-auto text-right hidden sm:block">
                      <div className="text-primary-200 text-xs">Price range</div>
                      <div className="text-white font-bold text-sm">{comp.budgetRange}</div>
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* What is it */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">What is it?</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">{comp.what}</p>
                    </div>

                    {/* Matters by use case */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Why it matters for your use case</h3>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <IndianRupee className="w-3.5 h-3.5 text-gray-500" />
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Budget</span>
                          </div>
                          <p className="text-gray-700 text-xs leading-relaxed">{comp.matters.budget}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1.5">🎮 Gaming</div>
                          <p className="text-blue-800 text-xs leading-relaxed">{comp.matters.gaming}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                          <div className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1.5">💻 Coding</div>
                          <p className="text-green-800 text-xs leading-relaxed">{comp.matters.coding}</p>
                        </div>
                      </div>
                    </div>

                    {/* Tips */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Tips before you buy</h3>
                      <ul className="space-y-1.5">
                        {comp.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-primary-500 font-bold mt-0.5 flex-shrink-0">→</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.section>
              );
            })}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center bg-primary-600 rounded-2xl p-8 text-white"
          >
            <h2 className="text-2xl font-bold mb-3">Ready to build?</h2>
            <p className="text-primary-100 mb-6">Now that you know what each part does, let our recommendation engine pick the perfect set for your budget.</p>
            <Link
              href="/budget"
              className="inline-block px-8 py-3 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
            >
              Start Building →
            </Link>
          </motion.div>

        </div>
      </div>
    </>
  );
};

export default GuidePage;
