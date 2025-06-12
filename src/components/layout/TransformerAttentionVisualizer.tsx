import { useState, useEffect, useRef, useCallback } from 'react';

// --- TYPE DEFINITIONS ---
interface WordPosition {
  x: number;
  y: number;
}

interface Connection {
  id: string;
  from: number;
  to: number;
  startTime: number;
  lifetime: number;
}

const TransformerAttentionVisualizer = () => {
  // --- CONFIGURATION ---
  const brandColorRgb = "0, 153, 168"; // Main brand color
  const particleLifetime = 5000; // Lifetime for each particle
  const maxActiveConnections = 5; // Maximum number of particles alive at once
  const newParticlesPerInterval = 1; // How many to try to spawn each interval
  const updateInterval = 800; // How often to check for spawning new particles

  // --- STATE AND REFS ---
  const containerRef = useRef<HTMLDivElement>(null);
  const [wordPositions, setWordPositions] = useState<WordPosition[]>([]);
  const [activeConnections, setActiveConnections] = useState<Connection[]>([]);

  // --- STATIC CONTENT ---
  const text = "In specifieke gevallen waarin strategische afhankelijkheden spelen, kunnen ook gerelateerde risico's op andere dreigingen tegen de nationale veiligheid spelen. Door het bestaan van strategische afhankelijkheden, kunnen indirect ook mogelijkheden ontstaan voor economische dwang, ongewenste toegang tot kennis of informatie, spionage, of sabotage. De uitdaging is enerzijds de voordelen van een open economie en open samenleving te behouden en anderzijds aandacht te hebben voor voldoende strategische autonomie en zo risico's voor nationale veiligheid te beperken.";
  const highlightedSentence = "Door het bestaan van strategische afhankelijkheden, kunnen indirect ook mogelijkheden ontstaan voor economische dwang, ongewenste toegang tot kennis of informatie, spionage, of sabotage.";
  const words = text.split(' ');

  // --- HELPERS ---
  const getHighlightIndices = useCallback(() => {
    const highlightWords = highlightedSentence.split(' ');
    const startIndex = words.findIndex(w => w.startsWith(highlightWords[0]));
    if (startIndex === -1) return { start: -1, end: -1 };
    return { start: startIndex, end: startIndex + highlightWords.length -1 };
  }, [words, highlightedSentence]);

  const { start: highlightStart, end: highlightEnd } = getHighlightIndices();

  // --- EFFECTS ---

  // Effect to calculate and update word positions on mount and resize
  useEffect(() => {
    const updatePositions = () => {
      if (!containerRef.current) return;
      const wordElements = containerRef.current.querySelectorAll('.word');
      const containerRect = containerRef.current.getBoundingClientRect();
      const positions = Array.from(wordElements).map(el => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        return {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
        };
      });
      setWordPositions(positions);
    };

    const timeoutId = setTimeout(updatePositions, 50);
    window.addEventListener('resize', updatePositions);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updatePositions);
    };
  }, [text]);

  // Effect for managing the continuous flow of attention connections
  useEffect(() => {
    if (wordPositions.length === 0) return;

    const interval = setInterval(() => {
      setActiveConnections(currentConnections => {
        const now = Date.now();
        const remainingConnections = currentConnections.filter(
          conn => now < conn.startTime + conn.lifetime
        );
        
        const newConnections: Connection[] = [];
        if (remainingConnections.length < maxActiveConnections) {
          const particlesToSpawn = Math.min(
            newParticlesPerInterval, 
            maxActiveConnections - remainingConnections.length
          );
          
          for (let i = 0; i < particlesToSpawn; i++) {
            const from = Math.floor(Math.random() * wordPositions.length);
            let to = Math.floor(Math.random() * wordPositions.length);
            while (to === from) {
              to = Math.floor(Math.random() * wordPositions.length);
            }

            newConnections.push({
              id: `conn-${now}-${i}`,
              from,
              to,
              startTime: now,
              lifetime: particleLifetime * (0.9 + Math.random() * 0.2),
            });
          }
        }
        
        return [...remainingConnections, ...newConnections];
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [wordPositions.length, maxActiveConnections, newParticlesPerInterval, particleLifetime, updateInterval]);

  // --- RENDER LOGIC ---

  const createCurvedPath = useCallback((start: WordPosition, end: WordPosition) => {
    if (!start || !end) return "";
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const controlOffset = Math.min(distance * 0.5, 100); 
    const controlX = (start.x + end.x) / 2 + (dy / distance) * controlOffset;
    const controlY = (start.y + end.y) / 2 - (dx / distance) * controlOffset;

    return `M${start.x},${start.y} Q${controlX},${controlY} ${end.x},${end.y}`;
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto p-8">
      {/* ADDED: Keyframes for the fade-in and fade-out effect */}
      <style>{`
        @keyframes moveAlongPath {
          to {
            offset-distance: 100%;
          }
        }
        @keyframes fadeInOut {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
      
      <div ref={containerRef} className="relative">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <radialGradient id="pulseGradient">
              <stop offset="10%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>

            <filter id="glow">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {activeConnections.map(conn => {
              if (!wordPositions[conn.from] || !wordPositions[conn.to]) return null;
              const pathData = createCurvedPath(wordPositions[conn.from], wordPositions[conn.to]);
              if (!pathData) return null;
              
              return (
                 <mask id={`mask-${conn.id}`} key={`mask-${conn.id}`}>
                    <circle
                      cx="0" cy="0" r="35"
                      fill="url(#pulseGradient)"
                      style={{
                        offsetPath: `path("${pathData}")`,
                        animation: `moveAlongPath ${conn.lifetime / 1000}s ease-in-out forwards`,
                      }}
                    />
                 </mask>
              )
            })}
          </defs>

          {activeConnections.map(conn => {
              if (!wordPositions[conn.from] || !wordPositions[conn.to]) return null;
              const pathData = createCurvedPath(wordPositions[conn.from], wordPositions[conn.to]);
              if (!pathData) return null;

              return (
                <path
                  key={`path-${conn.id}`}
                  d={pathData}
                  // UPDATED: Stroke is now more transparent (0.8 -> 0.7)
                  stroke={`rgba(${brandColorRgb}, 0.7)`}
                  strokeWidth={2}
                  fill="none"
                  filter="url(#glow)"
                  mask={`url(#mask-${conn.id})`}
                  // ADDED: Apply the fadeInOut animation to the path
                  style={{
                    animation: `fadeInOut ${conn.lifetime / 1000}s ease-in-out forwards`,
                  }}
                />
              )
          })}
        </svg>

        <p className="text-lg leading-loose relative z-20 text-center">
          {words.map((word, index) => {
            const isHighlighted = index >= highlightStart && index <= highlightEnd;
            return (
              <span
                key={index}
                className={`word inline-block mx-0.5 px-1 py-0.5 transition-all duration-500 ${
                  isHighlighted ? 'text-slate-700' : 'text-slate-500'
                }`}
                style={{
                  filter: isHighlighted ? 'blur(0px)' : 'blur(0.5px)'
                }}
              >
                {word}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
};

export default TransformerAttentionVisualizer;