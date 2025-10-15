import { useState, useEffect } from 'react';
import { Rocket, Zap, Target, Users } from 'lucide-react';

function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0);
  const [isLandscape, setIsLandscape] = useState(true);

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const sections = [
    {
      id: 0,
      title: "Transforma Tu Negocio",
      subtitle: "Soluciones innovadoras para el futuro",
      icon: Rocket,
      backgroundImage: "/1.png"
    },
    {
      id: 1,
      title: "Velocidad Extrema",
      subtitle: "Resultados en tiempo récord",
      icon: Zap,
      backgroundImage: "/2.png"
    },
    {
      id: 2,
      title: "Precisión Total",
      subtitle: "Alcanza tus objetivos con exactitud",
      icon: Target,
      backgroundImage: "/3.png"
    },
    {
      id: 3,
      title: "Únete a Nosotros",
      subtitle: "Miles de clientes satisfechos",
      icon: Users,
      backgroundImage: "/4.png"
    }
  ];

  const getPositionX = (event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    return 'touches' in event ? event.touches[0].clientX : event.clientX;
  };

  const handleStart = (event: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    setStartPos(getPositionX(event));
    setPrevTranslate(currentTranslate);
  };

  const handleMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (isDragging) {
      event.preventDefault();
      const currentPosition = getPositionX(event);
      const diff = currentPosition - startPos;
      const newTranslate = prevTranslate + diff;
      
      // Limitar el arrastre para no ir más allá de las secciones
      const maxTranslate = 0;
      const minTranslate = -(sections.length - 1) * window.innerWidth;
      
      if (newTranslate > maxTranslate) {
        setCurrentTranslate(maxTranslate + (newTranslate - maxTranslate) * 0.3);
      } else if (newTranslate < minTranslate) {
        setCurrentTranslate(minTranslate + (newTranslate - minTranslate) * 0.3);
      } else {
        setCurrentTranslate(newTranslate);
      }
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const movedBy = currentTranslate - prevTranslate;
    
    // Snap a la sección más cercana
    let targetSection = Math.round(-currentTranslate / window.innerWidth);
    
    // Si el movimiento fue significativo, ir a la siguiente/anterior
    if (movedBy < -50) {
      targetSection = Math.ceil(-currentTranslate / window.innerWidth);
    } else if (movedBy > 50) {
      targetSection = Math.floor(-currentTranslate / window.innerWidth);
    }
    
    targetSection = Math.max(0, Math.min(sections.length - 1, targetSection));
    
    const finalTranslate = -targetSection * window.innerWidth;
    setCurrentTranslate(finalTranslate);
    setPrevTranslate(finalTranslate);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e as unknown as React.MouseEvent);
      }
    };

    const handleMouseUp = () => {
      handleEnd();
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, currentTranslate, prevTranslate, startPos]);

  return (
    <>
      {/* Pantalla de rotación para móvil en vertical */}
      {!isLandscape && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" style={{ height: '100dvh' }}>
          <video
            src="/mueveelmovil.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Contenido principal - solo visible en horizontal */}
      <div 
        className="w-screen overflow-hidden relative bg-black select-none touch-none"
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          height: '100dvh'
        }}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
      <div
        className={`flex ${isDragging ? '' : 'transition-transform duration-500 ease-out'}`}
        style={{ 
          transform: `translateX(${currentTranslate}px)`,
          height: '100dvh'
        }}
      >
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.id}
              className="flex-shrink-0 flex flex-col items-center justify-center relative bg-center bg-no-repeat"
              style={{ 
                backgroundImage: `url(${section.backgroundImage})`,
                backgroundSize: 'cover',
                width: '100vw',
                height: '100dvh'
              }}
            >
              <div className="text-center text-white px-8 space-y-8 relative z-10 pointer-events-none">
                <div className="flex justify-center mb-8">
                  <div className="p-6 bg-white/10 backdrop-blur-sm rounded-full">
                    <Icon size={80} className="text-white" strokeWidth={1.5} />
                  </div>
                </div>
                <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
                  {section.title}
                </h1>
                <p className="text-2xl md:text-3xl font-light opacity-90">
                  {section.subtitle}
                </p>
                <button className="mt-8 px-12 py-4 bg-white text-gray-900 rounded-full text-lg font-semibold hover:scale-105 transition-transform duration-200 shadow-2xl pointer-events-auto">
                  Comenzar Ahora
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
}

export default App;
