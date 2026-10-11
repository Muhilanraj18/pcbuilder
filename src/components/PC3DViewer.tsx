import React, { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Box, Cylinder, Environment, Html } from '@react-three/drei';
import { PCPart } from '@/types';

interface PC3DViewerProps {
  parts: PCPart[];
  showLabels?: boolean;
}

// --------------------------------------------------------
// PROCEDURAL 3D MODELS (NO IMAGES)
// --------------------------------------------------------

const MotherboardModel = ({ hovered }: { hovered: boolean }) => (
  <group>
    {/* Main PCB */}
    <Box args={[0.1, 3.0, 2.4]}>
      <meshStandardMaterial color={hovered ? '#4ade80' : '#1e293b'} metalness={0.2} roughness={0.8} />
    </Box>
    {/* VRM Heatsinks */}
    <Box args={[0.2, 0.8, 0.2]} position={[-0.15, 0.8, -0.6]}>
      <meshStandardMaterial color="#334155" metalness={0.8} />
    </Box>
    <Box args={[0.2, 0.2, 0.8]} position={[-0.15, 1.3, 0]}>
      <meshStandardMaterial color="#334155" metalness={0.8} />
    </Box>
    {/* Chipset Heatsink */}
    <Box args={[0.15, 0.6, 0.6]} position={[-0.1, -0.8, 0.6]}>
      <meshStandardMaterial color="#475569" metalness={0.8} />
    </Box>
    {/* PCIe Slots */}
    <Box args={[0.1, 0.2, 2.0]} position={[-0.1, -0.2, 0]}>
      <meshStandardMaterial color="#0f172a" />
    </Box>
    <Box args={[0.1, 0.2, 2.0]} position={[-0.1, -0.8, 0]}>
      <meshStandardMaterial color="#0f172a" />
    </Box>
  </group>
);

const CPUModel = ({ hovered }: { hovered: boolean }) => (
  <group>
    {/* PCB Base */}
    <Box args={[0.05, 0.5, 0.5]}>
      <meshStandardMaterial color="#16a34a" />
    </Box>
    {/* IHS (Integrated Heat Spreader) */}
    <Box args={[0.05, 0.4, 0.4]} position={[-0.05, 0, 0]}>
      <meshStandardMaterial color={hovered ? '#ffffff' : '#cbd5e1'} metalness={0.9} roughness={0.2} />
    </Box>
  </group>
);

const CoolerModel = ({ hovered }: { hovered: boolean }) => {
  const fanRef = useRef<any>();
  useFrame(() => {
    if (fanRef.current) fanRef.current.rotation.x -= 0.15;
  });
  return (
    <group>
      {/* Contact Plate */}
      <Box args={[0.1, 0.4, 0.4]} position={[0.45, 0, 0]}>
        <meshStandardMaterial color="#94a3b8" metalness={0.8} />
      </Box>
      {/* Heatpipes */}
      <Cylinder args={[0.05, 0.05, 1.0]} position={[0.4, 0, -0.1]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#b45309" metalness={1} roughness={0.2} />
      </Cylinder>
      <Cylinder args={[0.05, 0.05, 1.0]} position={[0.4, 0, 0.1]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#b45309" metalness={1} roughness={0.2} />
      </Cylinder>
      {/* Aluminum Fins (Tower) */}
      <Box args={[0.6, 1.2, 1.0]} position={[0, 0, 0]}>
        <meshStandardMaterial color={hovered ? '#e2e8f0' : '#94a3b8'} metalness={0.6} roughness={0.4} />
      </Box>
      {/* Fan attached to front of fins */}
      <group position={[-0.35, 0, 0]}>
        {/* Fan Frame */}
        <Box args={[0.1, 1.0, 1.0]}>
          <meshStandardMaterial color="#0f172a" />
        </Box>
        {/* Spinning Fan Blades */}
        <group ref={fanRef}>
          <Box args={[0.08, 0.9, 0.1]}>
            <meshStandardMaterial color={hovered ? '#38bdf8' : '#334155'} />
          </Box>
          <Box args={[0.08, 0.1, 0.9]}>
            <meshStandardMaterial color={hovered ? '#38bdf8' : '#334155'} />
          </Box>
        </group>
      </group>
    </group>
  );
};

const RAMModel = ({ hovered }: { hovered: boolean }) => (
  <group>
    {/* Stick 1 */}
    <group position={[0, 0, -0.15]}>
      <Box args={[0.2, 1.0, 0.05]}>
        <meshStandardMaterial color="#1e293b" metalness={0.5} />
      </Box>
      {/* RGB Top */}
      <Box args={[0.2, 1.0, 0.02]} position={[-0.1, 0, 0]}>
        <meshStandardMaterial color={hovered ? '#a855f7' : '#ec4899'} emissive={hovered ? '#a855f7' : '#ec4899'} emissiveIntensity={2} />
      </Box>
    </group>
    {/* Stick 2 */}
    <group position={[0, 0, 0.15]}>
      <Box args={[0.2, 1.0, 0.05]}>
        <meshStandardMaterial color="#1e293b" metalness={0.5} />
      </Box>
      {/* RGB Top */}
      <Box args={[0.2, 1.0, 0.02]} position={[-0.1, 0, 0]}>
        <meshStandardMaterial color={hovered ? '#38bdf8' : '#8b5cf6'} emissive={hovered ? '#38bdf8' : '#8b5cf6'} emissiveIntensity={2} />
      </Box>
    </group>
  </group>
);

const GPUModel = ({ hovered }: { hovered: boolean }) => {
  const fan1Ref = useRef<any>();
  const fan2Ref = useRef<any>();
  
  useFrame(() => {
    if (fan1Ref.current) fan1Ref.current.rotation.y += 0.2;
    if (fan2Ref.current) fan2Ref.current.rotation.y += 0.2;
  });

  return (
    <group>
      {/* Main Body */}
      <Box args={[1.2, 0.4, 2.8]}>
        <meshStandardMaterial color={hovered ? '#3b82f6' : '#1e293b'} metalness={0.6} />
      </Box>
      {/* Backplate */}
      <Box args={[1.2, 0.05, 2.8]} position={[0, 0.225, 0]}>
        <meshStandardMaterial color="#0f172a" metalness={0.8} />
      </Box>
      {/* PCIe Connector */}
      <Box args={[0.1, 0.2, 1.5]} position={[0.6, 0, -0.4]}>
        <meshStandardMaterial color="#fbbf24" metalness={1} />
      </Box>
      {/* Fans */}
      <group position={[0, -0.2, 0.6]}>
        <Cylinder args={[0.4, 0.4, 0.05, 32]}>
          <meshStandardMaterial color="#020617" />
        </Cylinder>
        <group ref={fan1Ref}>
          <Box args={[0.7, 0.06, 0.1]}><meshStandardMaterial color="#334155" /></Box>
          <Box args={[0.1, 0.06, 0.7]}><meshStandardMaterial color="#334155" /></Box>
        </group>
      </group>
      <group position={[0, -0.2, -0.6]}>
        <Cylinder args={[0.4, 0.4, 0.05, 32]}>
          <meshStandardMaterial color="#020617" />
        </Cylinder>
        <group ref={fan2Ref}>
          <Box args={[0.7, 0.06, 0.1]}><meshStandardMaterial color="#334155" /></Box>
          <Box args={[0.1, 0.06, 0.7]}><meshStandardMaterial color="#334155" /></Box>
        </group>
      </group>
      {/* Geforce Logo Side */}
      <Box args={[1.21, 0.1, 0.8]} position={[0, 0, 0]}>
        <meshStandardMaterial color={hovered ? '#4ade80' : '#22c55e'} emissive="#22c55e" emissiveIntensity={0.5} />
      </Box>
    </group>
  );
};

const StorageModel = ({ hovered }: { hovered: boolean }) => (
  <group>
    {/* NVMe PCB */}
    <Box args={[0.05, 0.8, 0.2]}>
      <meshStandardMaterial color="#020617" />
    </Box>
    {/* NAND Chips */}
    <Box args={[0.06, 0.3, 0.15]} position={[-0.01, 0.2, 0]}>
      <meshStandardMaterial color={hovered ? '#38bdf8' : '#1e293b'} />
    </Box>
    <Box args={[0.06, 0.3, 0.15]} position={[-0.01, -0.2, 0]}>
      <meshStandardMaterial color={hovered ? '#38bdf8' : '#1e293b'} />
    </Box>
    {/* Controller */}
    <Box args={[0.06, 0.1, 0.1]} position={[-0.01, 0, 0]}>
      <meshStandardMaterial color="#cbd5e1" metalness={1} />
    </Box>
  </group>
);

const PSUModel = ({ hovered }: { hovered: boolean }) => (
  <group>
    {/* Main Block */}
    <Box args={[1.6, 0.8, 1.5]}>
      <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
    </Box>
    {/* Fan Grill */}
    <Cylinder args={[0.6, 0.6, 0.05, 32]} position={[0, 0.4, 0]}>
      <meshStandardMaterial color={hovered ? '#eab308' : '#1e293b'} metalness={0.8} />
    </Cylinder>
    {/* Modular Cables */}
    <Box args={[1.2, 0.4, 0.2]} position={[0, 0, -0.8]}>
      <meshStandardMaterial color="#020617" />
    </Box>
    {/* 24-pin cable bunch */}
    <Cylinder args={[0.1, 0.1, 0.5]} position={[-0.3, 0, -1.0]} rotation={[Math.PI / 2, 0, 0]}>
      <meshStandardMaterial color="#000000" />
    </Cylinder>
  </group>
);

// --------------------------------------------------------
// COMPONENT MESH WRAPPER
// --------------------------------------------------------

const ComponentMesh: React.FC<{ 
  part: PCPart; 
  position: [number, number, number];
  category: string;
}> = ({ part, position, category }) => {
  const [hovered, setHovered] = React.useState(false);

  const renderModel = () => {
    switch (category) {
      case 'Motherboard': return <MotherboardModel hovered={hovered} />;
      case 'Processor': return <CPUModel hovered={hovered} />;
      case 'Cooler': return <CoolerModel hovered={hovered} />;
      case 'Graphics Card': return <GPUModel hovered={hovered} />;
      case 'RAM': return <RAMModel hovered={hovered} />;
      case 'Storage': return <StorageModel hovered={hovered} />;
      case 'Power Supply': return <PSUModel hovered={hovered} />;
      default: return <Box args={[0.5, 0.5, 0.5]}><meshStandardMaterial color="white" /></Box>;
    }
  };

  return (
    <group 
      position={position} 
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      {renderModel()}
      {hovered && (
        <Html position={[0, 0, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-2 rounded border border-blue-500 shadow-2xl pointer-events-none whitespace-nowrap">
            <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-0.5">{part.category}</p>
            <p className="text-sm font-medium">{part.name}</p>
          </div>
        </Html>
      )}
    </group>
  );
};

// --------------------------------------------------------
// PC CASE ASSEMBLY
// --------------------------------------------------------

const PCCase: React.FC<{ parts: PCPart[] }> = ({ parts }) => {
  const partsByCategory = useMemo(() => {
    const grouped: Record<string, PCPart> = {};
    parts.forEach(part => { grouped[part.category] = part; });
    return grouped;
  }, [parts]);

  // Case dimensions: W=2.0 (X), H=5.0 (Y), D=5.0 (Z)
  // Origin [0,0,0] is exactly the center of the case.
  const config: Record<string, { pos: [number, number, number] }> = {
    'Motherboard':   { pos: [ 0.9,   0.5, -0.8] }, // Flat on right panel
    'Processor':     { pos: [ 0.8,   1.2, -1.0] }, // Top half of motherboard
    'Cooler':        { pos: [ 0.4,   1.2, -1.0] }, // Over CPU
    'RAM':           { pos: [ 0.7,   1.2, -0.4] }, // Next to CPU towards front
    'Graphics Card': { pos: [ 0.3,  -0.2, -0.2] }, // Below CPU, extending towards front
    'Storage':       { pos: [ 0.8,   0.3, -1.2] }, // Small M.2 slot below CPU
    'Power Supply':  { pos: [ 0.0,  -2.0, -1.6] }, // Bottom back corner
  };

  return (
    <group position={[0, 0, 0]}>
      {/* PC Case Enclosure */}
      <group>
        {/* Back panel (I/O) */}
        <Box args={[2.0, 5.0, 0.1]} position={[0, 0, -2.5]}>
          <meshStandardMaterial color="#020617" metalness={0.8} roughness={0.2} />
        </Box>
        {/* Top panel */}
        <Box args={[2.0, 0.1, 5.0]} position={[0, 2.5, 0]}>
          <meshStandardMaterial color="#0f172a" />
        </Box>
        {/* Bottom panel */}
        <Box args={[2.0, 0.1, 5.0]} position={[0, -2.5, 0]}>
          <meshStandardMaterial color="#0f172a" />
        </Box>
        {/* Right panel (Motherboard tray) */}
        <Box args={[0.1, 5.0, 5.0]} position={[1.0, 0, 0]}>
          <meshStandardMaterial color="#0f172a" metalness={0.5} />
        </Box>
        {/* Front panel (Tinted glass / mesh) */}
        <Box args={[2.0, 5.0, 0.1]} position={[0, 0, 2.5]}>
          <meshStandardMaterial color="#000000" transparent opacity={0.6} metalness={0.9} roughness={0.1} />
        </Box>
        {/* Left panel (Tinted glass side window) */}
        <Box args={[0.1, 5.0, 5.0]} position={[-1.0, 0, 0]}>
          <meshStandardMaterial color="#000000" transparent opacity={0.15} metalness={0.9} roughness={0.0} />
        </Box>
        {/* PSU Shroud (Bottom cover) */}
        <Box args={[2.0, 1.0, 5.0]} position={[0, -2.0, 0]}>
          <meshStandardMaterial color="#020617" metalness={0.7} roughness={0.3} />
        </Box>
      </group>

      {/* Components */}
      {Object.entries(partsByCategory).map(([category, part]) => {
        const c = config[category];
        if (!c) return null;

        return (
          <ComponentMesh
            key={category}
            part={part}
            category={category}
            position={c.pos}
          />
        );
      })}
    </group>
  );
};

// --------------------------------------------------------
// MAIN VIEWER COMPONENT
// --------------------------------------------------------

const PC3DViewer: React.FC<PC3DViewerProps> = ({ parts, showLabels = true }) => {
  return (
    <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-slate-800 to-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative border border-slate-700">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[-5, 2, 6]} fov={50} />
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={12}
          target={[0, 0, 0]}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.5}
        />
        
        {/* Lighting Setup - Perfectly adjusted for metallic realism */}
        <ambientLight intensity={1.5} color="#ffffff" />
        <Environment preset="city" />
        
        {/* Internal PC RGB Lighting */}
        <pointLight position={[0, 1.5, -0.5]} intensity={3} color="#a855f7" distance={4} />
        <pointLight position={[0, -0.5, 0.5]} intensity={2} color="#38bdf8" distance={4} />
        <pointLight position={[0, -2.0, 0]} intensity={1} color="#eab308" distance={3} />
        
        {/* Main Scene Lights */}
        <spotLight position={[-4, 4, 4]} angle={0.6} penumbra={0.5} intensity={4} color="#ffffff" castShadow />
        <spotLight position={[4, -4, -4]} angle={0.6} penumbra={0.5} intensity={2} color="#e0f2fe" />
        
        <Suspense fallback={
          <Html center>
            <div className="text-white font-medium animate-pulse px-4 py-2 bg-slate-800 rounded-lg">
              Loading High-Fidelity Models...
            </div>
          </Html>
        }>
          <PCCase parts={parts} />
        </Suspense>
      </Canvas>
      
      {/* Controls Hint */}
      <div className="absolute bottom-4 left-4 bg-black/60 text-slate-300 text-xs px-4 py-3 rounded-xl backdrop-blur-md border border-white/10 pointer-events-none shadow-xl">
        <div className="flex flex-col gap-2 opacity-90 font-medium tracking-wide">
          <span className="flex items-center gap-3">🖱️ <span>Drag to rotate case</span></span>
          <span className="flex items-center gap-3">🔍 <span>Scroll to zoom</span></span>
          <span className="flex items-center gap-3">👆 <span>Hover components for details</span></span>
        </div>
      </div>
    </div>
  );
};

export default PC3DViewer;
