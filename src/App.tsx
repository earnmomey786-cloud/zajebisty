import { useState, useEffect, useRef } from 'react';

function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [startPosY, setStartPosY] = useState(0);
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
      backgroundImage: "/fondo1.png"
    },
    {
      id: 1,
      backgroundImage: "/fondo2.png"
    },
    {
      id: 2,
      backgroundImage: "/fondo3.png"
    },
    {
      id: 3,
      backgroundImage: "/fondo4.png"
    }
  ];

  const getPositionX = (event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    return 'touches' in event ? event.touches[0].clientX : event.clientX;
  };
  const getPositionY = (event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    return 'touches' in event ? event.touches[0].clientY : event.clientY;
  };

  const handleStart = (event: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    setStartPos(getPositionX(event));
    setStartPosY(getPositionY(event));
    setPrevTranslate(currentTranslate);
  };

  const handleMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (isDragging) {
      const currentX = getPositionX(event);
      const currentY = getPositionY(event);
      const diffX = currentX - startPos;
      const diffY = currentY - startPosY;

      // Si el gesto es más vertical que horizontal, no bloquear: permitir scroll
      if (Math.abs(diffY) > Math.abs(diffX)) {
        return;
      }

      // Gesto principalmente horizontal: prevenir scroll y arrastrar
      event.preventDefault();
      const diff = diffX;
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
          {/* Imagen superpuesta en la parte inferior */}
          <img
            src="/obrocekran.png"
            alt="Obróć ekran"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] max-w-xs mb-4 pointer-events-none"
            draggable={false}
            style={{ zIndex: 60 }}
          />
        </div>
      )}

      {/* Contenido principal - solo visible en horizontal */}
      <div 
        className="w-screen overflow-hidden relative bg-black touch-pan-y"
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          height: '100vh',
          overflow: 'hidden'
        }}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >


      <div
        className={`flex ${isDragging ? '' : 'transition-transform duration-300 ease-out'}`}
        style={{ 
          transform: `translateX(${currentTranslate}px)`,
          height: '100vh'
        }}
      >
        {sections.map((section) => (
          <div
            key={section.id}
            className="section-bg flex-shrink-0 w-screen h-screen relative"
            style={{
              backgroundImage: `url(${section.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Título con efecto glitch, solo en la primera sección */}
            {section.id === 0 && (
              <div className="glitch absolute top-4 right-4 md:top-8 md:right-8 w-[50vw] max-w-[900px] pointer-events-none select-none z-50">
                <img src="/zajebistymarketing.png" alt="Zajebisty Marketing" draggable={false} />
                <img src="/zajebistymarketing.png" alt="" aria-hidden="true" draggable={false} />
                <img src="/zajebistymarketing.png" alt="" aria-hidden="true" draggable={false} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    </>
  );
}

export default App;
