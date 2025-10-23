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
                
                {/* Ghost Button en la esquina inferior izquierda */}
                <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 z-50">
                  <div className="relative">
                    {/* Texto "Kim jestem?" */}
                    <div className="kim-text">KIM JESTEM?</div>
                    
                    {/* Fantasma pixelado */}
                    <div 
                      id="ghost"
                      onClick={() => {
                        // En móvil, girar pantalla automáticamente y abrir video
                        if (isMobile) {
                          // Intentar girar la pantalla automáticamente
                          const rotateScreen = async () => {
                            try {
                              // Intentar usar Screen Orientation API
                              if (screen.orientation && screen.orientation.lock) {
                                await screen.orientation.lock('landscape');
                              }
                            } catch (error) {
                              console.log('No se pudo girar automáticamente:', error);
                            }
                          };
                          
                          // Ejecutar rotación
                          rotateScreen();
                          
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
                          `;
                          
                          videoContainer.appendChild(video);
                          
                          // Mensaje de confirmación
                          const confirmMessage = document.createElement('div');
                          confirmMessage.innerHTML = '🔄 Pantalla girando automáticamente...';
                          confirmMessage.style.cssText = `
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
                          
                          videoContainer.appendChild(confirmMessage);
                          document.body.appendChild(videoContainer);
                          
                          // Ocultar mensaje después de 2 segundos
                          setTimeout(() => {
                            if (confirmMessage.parentNode) {
                              confirmMessage.parentNode.removeChild(confirmMessage);
                            }
                          }, 2000);
                          
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
                          
                          closeButton.onclick = async () => {
                            // Intentar volver a portrait al cerrar
                            try {
                              if (screen.orientation && screen.orientation.lock) {
                                await screen.orientation.lock('portrait');
                              }
                            } catch (error) {
                              console.log('No se pudo volver a portrait:', error);
                            }
                            
                            document.body.removeChild(videoContainer);
                            if (mainContent) {
                              (mainContent as HTMLElement).style.display = 'block';
                            }
                          };
                          
                          videoContainer.appendChild(closeButton);
                        } else {
                          // En desktop, mostrar video en pantalla completa con fondo de la web
                          // Ocultar el contenido actual
                          const mainContent = document.querySelector('.w-screen.overflow-hidden.relative.bg-black');
                          if (mainContent) {
                            (mainContent as HTMLElement).style.display = 'none';
                          }
                          
                          // Crear video en pantalla completa con fondo de la web
                          const videoContainer = document.createElement('div');
                          videoContainer.style.cssText = `
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100vw;
                            height: 100vh;
                            background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%);
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
                            max-width: 90%;
                            max-height: 90%;
                            object-fit: contain;
                            box-shadow: 0 0 50px rgba(0, 0, 0, 0.8);
                          `;
                          
                          videoContainer.appendChild(video);
                          
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
                            width: 50px;
                            height: 50px;
                            font-size: 24px;
                            cursor: pointer;
                            z-index: 10000;
                            transition: all 0.3s ease;
                          `;
                          
                          closeButton.onmouseover = () => {
                            closeButton.style.background = 'rgba(255, 0, 0, 0.8)';
                            closeButton.style.transform = 'scale(1.1)';
                          };
                          
                          closeButton.onmouseout = () => {
                            closeButton.style.background = 'rgba(0,0,0,0.7)';
                            closeButton.style.transform = 'scale(1)';
                          };
                          
                          closeButton.onclick = () => {
                            document.body.removeChild(videoContainer);
                            if (mainContent) {
                              (mainContent as HTMLElement).style.display = 'block';
                            }
                          };
                          
                          videoContainer.appendChild(closeButton);
                          document.body.appendChild(videoContainer);
                        }
                      }}
                    >
                      <div id="red">
                        <div id="top0"></div>
                        <div id="top1"></div>
                        <div id="top2"></div>
                        <div id="top3"></div>
                        <div id="top4"></div>
                        <div id="st0"></div>
                        <div id="st1"></div>
                        <div id="st2"></div>
                        <div id="st3"></div>
                        <div id="st4"></div>
                        <div id="st5"></div>
                        <div id="an1"></div>
                        <div id="an2"></div>
                        <div id="an3"></div>
                        <div id="an4"></div>
                        <div id="an5"></div>
                        <div id="an6"></div>
                        <div id="an7"></div>
                        <div id="an8"></div>
                        <div id="an9"></div>
                        <div id="an10"></div>
                        <div id="an11"></div>
                        <div id="an12"></div>
                        <div id="an13"></div>
                        <div id="an14"></div>
                        <div id="an15"></div>
                        <div id="an16"></div>
                        <div id="an17"></div>
                        <div id="an18"></div>
                      </div>
                      <div id="eye"></div>
                      <div id="eye1"></div>
                      <div id="pupil"></div>
                      <div id="pupil1"></div>
                      <div id="mouthstart"></div>
                      <div id="mouth1"></div>
                      <div id="mouth2"></div>
                      <div id="mouth3"></div>
                      <div id="mouth4"></div>
                      <div id="mouth5"></div>
                      <div id="mouthend"></div>
                      <div id="shadow"></div>
                    </div>
                  </div>
                </div>
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
