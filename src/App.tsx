import { useState, useEffect, useRef } from 'react';

function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0);
  const [isLandscape, setIsLandscape] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // Intentar reproducir con sonido cuando el componente se monta
  useEffect(() => {
    const playVideoWithSound = async () => {
      if (videoRef.current) {
        try {
          videoRef.current.muted = false;
          await videoRef.current.play();
        } catch (error) {
          // Si falla, intentar con muted primero y luego activar sonido
          console.log('Intento con muted primero');
          videoRef.current.muted = true;
          await videoRef.current.play();
        }
      }
    };

    playVideoWithSound();
  }, []);

  // Activar sonido al hacer click/touch
  const handleVideoInteraction = async () => {
    if (videoRef.current && videoRef.current.muted) {
      videoRef.current.muted = false;
      try {
        await videoRef.current.play();
      } catch (error) {
        console.log('Error al activar sonido:', error);
      }
    }
  };

  // Scroll hacia abajo para ocultar la barra de direcciones
  useEffect(() => {
    if (!isLandscape) {
      // Hacer scroll hacia abajo para ocultar la barra
      setTimeout(() => {
        window.scrollTo(0, 1);
      }, 100);
    }
  }, [isLandscape]);

  const sections = [
    {
      id: 0,
      title: "Transforma Tu Negocio",
      subtitle: "Soluciones innovadoras para el futuro",
      backgroundImage: "/1.png"
    },
    {
      id: 1,
      title: "Velocidad Extrema",
      subtitle: "Resultados en tiempo récord",
      backgroundImage: "/2.png"
    },
    {
      id: 2,
      title: "Precisión Total",
      subtitle: "Alcanza tus objetivos con exactitud",
      backgroundImage: "/3.png"
    },
    {
      id: 3,
      title: "Únete a Nosotros",
      subtitle: "Miles de clientes satisfechos",
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
        <div 
          className="fixed inset-0 bg-black z-50" 
          style={{ 
            height: '100vh',
            width: '100vw',
            top: 0,
            left: 0
          }}
          onClick={handleVideoInteraction}
          onTouchStart={handleVideoInteraction}
        >
          <video
            ref={videoRef}
            src="/mueveelmovil.mp4"
            autoPlay
            loop
            playsInline
            className="w-full h-full object-cover"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
          />
        </div>
      )}

      {/* Contenido principal - solo visible en horizontal */}
      <div 
        className="w-screen overflow-hidden relative bg-black touch-none"
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          minHeight: '120vh',
          height: 'auto'
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
          minHeight: '120vh'
        }}
      >
        {sections.map((section) => {
          return (
            <div
              key={section.id}
              className="flex-shrink-0 flex flex-col items-center justify-center relative bg-center bg-no-repeat"
              style={{ 
                backgroundImage: `url(${section.backgroundImage})`,
                backgroundSize: 'cover',
                width: '100vw',
                minHeight: '120vh'
              }}
            >
              {/* Título en imagen, solo en la primera sección (arriba a la derecha) */}
              {section.id === 0 && (
                <div className="glitch absolute top-4 right-4 md:top-8 md:right-8 w-[80vw] max-w-[900px] md:w-[50vw] pointer-events-none select-none z-20">
                  <img src="/zajebistymarketing.png" alt="Zajebisty Marketing" draggable={false} />
                  <img src="/zajebistymarketing.png" alt="" aria-hidden="true" draggable={false} />
                  <img src="/zajebistymarketing.png" alt="" aria-hidden="true" draggable={false} />
                </div>
              )}
              <div className="text-center text-white px-8 space-y-8 relative z-10 pointer-events-none">
                {/* Texto grande eliminado a petición: título y subtítulo */}
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
