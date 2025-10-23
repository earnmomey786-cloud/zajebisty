import { useState, useEffect, useRef } from 'react';

function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [startPosY, setStartPosY] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0);
  const [isLandscape, setIsLandscape] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const checkDevice = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  // Reproducir video con sonido cuando esté listo
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const playVideoWithSound = () => {
        video.muted = false;
        video.volume = 1.0;
        video.play().catch(err => console.log('Error al reproducir con sonido:', err));
      };
      video.addEventListener('canplay', playVideoWithSound);
      video.addEventListener('loadeddata', playVideoWithSound);
      return () => {
        video.removeEventListener('canplay', playVideoWithSound);
        video.removeEventListener('loadeddata', playVideoWithSound);
      };
    }
  }, []);

  // Activar sonido al hacer click/touch
  const handleVideoInteraction = async () => {
    if (videoRef.current) {
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
    if (!isLandscape && isMobile) {
      // Hacer scroll hacia abajo para ocultar la barra
      setTimeout(() => {
        window.scrollTo(0, 1);
        // Forzar el scroll después de un momento
        setTimeout(() => {
          window.scrollTo(0, 1);
        }, 500);
      }, 100);
    }
  }, [isLandscape, isMobile]);

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
      {/* Video para móvil en vertical */}
      {!isLandscape && isMobile && (
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
            src="/obrocekran.mp4"
            autoPlay
            loop
            playsInline
            muted={false}
            className="w-full h-full object-cover"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              objectFit: 'cover'
            }}
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
              <>
                <div className="glitch absolute top-4 right-4 md:top-8 md:right-8 w-[50vw] max-w-[900px] pointer-events-none select-none z-50">
                  <img src="/zajebistymarketing.png" alt="Zajebisty Marketing" draggable={false} />
                  <img src="/zajebistymarketing.png" alt="" aria-hidden="true" draggable={false} />
                  <img src="/zajebistymarketing.png" alt="" aria-hidden="true" draggable={false} />
                </div>
                
                {/* Botón con animación flotante en la esquina inferior izquierda */}
                <button 
                  className="absolute bottom-4 left-4 md:bottom-8 md:left-8 z-50 hover:scale-110 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-lg"
                  onClick={() => {
                    // En móvil, ocultar la pantalla actual y abrir video
                    if (isMobile) {
                      // Ocultar el contenido actual
                      const mainContent = document.querySelector('.w-screen.overflow-hidden.relative.bg-black');
                      if (mainContent) {
                        (mainContent as HTMLElement).style.display = 'none';
                      }
                      
                      // Crear video en pantalla completa
                      const videoContainer = document.createElement('div');
                      videoContainer.style.cssText = `
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100vw;
                        height: 100vh;
                        background: black;
                        z-index: 9999;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                      `;
                      
                      const video = document.createElement('video');
                      video.src = '/marketingzjajami.mp4';
                      video.controls = true;
                      video.autoplay = true;
                      video.style.cssText = `
                        width: 100%;
                        height: 100%;
                        object-fit: contain;
                        transform: rotate(90deg);
                        transform-origin: center;
                      `;
                      
                      videoContainer.appendChild(video);
                      
                      // Mensaje para girar el móvil
                      const rotateMessage = document.createElement('div');
                      rotateMessage.innerHTML = '📱 Gira tu móvil para ver el video en horizontal';
                      rotateMessage.style.cssText = `
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: rgba(0,0,0,0.8);
                        color: white;
                        padding: 20px;
                        border-radius: 10px;
                        font-size: 16px;
                        text-align: center;
                        z-index: 10001;
                        pointer-events: none;
                      `;
                      
                      videoContainer.appendChild(rotateMessage);
                      document.body.appendChild(videoContainer);
                      
                      // Ocultar mensaje después de 3 segundos
                      setTimeout(() => {
                        if (rotateMessage.parentNode) {
                          rotateMessage.parentNode.removeChild(rotateMessage);
                        }
                      }, 3000);
                      
                      // Botón para cerrar
                      const closeButton = document.createElement('button');
                      closeButton.innerHTML = '✕';
                      closeButton.style.cssText = `
                        position: absolute;
                        top: 20px;
                        right: 20px;
                        background: rgba(0,0,0,0.7);
                        color: white;
                        border: none;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        font-size: 20px;
                        cursor: pointer;
                        z-index: 10000;
                      `;
                      
                      closeButton.onclick = () => {
                        document.body.removeChild(videoContainer);
                        if (mainContent) {
                          (mainContent as HTMLElement).style.display = 'block';
                        }
                      };
                      
                      videoContainer.appendChild(closeButton);
                    } else {
                      // En desktop, abrir en nueva ventana
                      const videoUrl = '/marketingzjajami.mp4';
                      window.open(videoUrl, '_blank');
                    }
                  }}
                >
                  <img 
                    src="/jajo.svg" 
                    alt="Botón Jajo" 
                    className="w-48 h-48 md:w-64 md:h-64 object-contain animate-float"
                    draggable={false}
                  />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
    </>
  );
}

export default App;
