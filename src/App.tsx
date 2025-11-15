import { useState, useEffect, useRef } from 'react';

function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [startPosY, setStartPosY] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0);
  const [isLandscape, setIsLandscape] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState<string | null>(null);
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
      {/* Página de fondo cuando se hace clic en una tarjeta */}
      {currentPage && (
        <div 
          className="fixed inset-0 z-[100] w-screen h-screen"
          style={{
            backgroundImage: `url(/${currentPage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Botón de retroceso */}
          <button
            onClick={() => setCurrentPage(null)}
            className="absolute top-4 left-4 md:top-8 md:left-8 bg-black/50 hover:bg-black/70 text-white px-6 py-3 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm"
          >
            ← Volver
          </button>
        </div>
      )}

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
                    
                    {/* Foto clickeable */}
                    <img 
                      src="/Kim jestesmy.png"
                      alt="Kim jestem?"
                      className="cursor-pointer hover:scale-105 transition-transform duration-300 float-button"
                      style={{ maxWidth: '200px', height: 'auto' }}
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
                    />
                  </div>
                </div>
              </>
            )}

            {/* Tarjeta 3D interactiva en la segunda sección */}
            {section.id === 1 && (
              <div className="absolute inset-0 flex items-center justify-center z-50">
                <div className="card-container noselect">
                  <div className="canvas">
                    <div className="tracker tr-1"></div>
                    <div className="tracker tr-2"></div>
                    <div className="tracker tr-3"></div>
                    <div className="tracker tr-4"></div>
                    <div className="tracker tr-5"></div>
                    <div className="tracker tr-6"></div>
                    <div className="tracker tr-7"></div>
                    <div className="tracker tr-8"></div>
                    <div className="tracker tr-9"></div>
                    <div className="tracker tr-10"></div>
                    <div className="tracker tr-11"></div>
                    <div className="tracker tr-12"></div>
                    <div className="tracker tr-13"></div>
                    <div className="tracker tr-14"></div>
                    <div className="tracker tr-15"></div>
                    <div className="tracker tr-16"></div>
                    <div className="tracker tr-17"></div>
                    <div className="tracker tr-18"></div>
                    <div className="tracker tr-19"></div>
                    <div className="tracker tr-20"></div>
                    <div className="tracker tr-21"></div>
                    <div className="tracker tr-22"></div>
                    <div className="tracker tr-23"></div>
                    <div className="tracker tr-24"></div>
                    <div className="tracker tr-25"></div>
                    <div id="card">
                      <p id="prompt">
                        Potrzebujesz <span className="highlight-word">ZAJEBISTEJ</span> strony internetowej, co <span className="highlight-word">ZAJEBISCIE</span> sprzedaje?
                      </p>
                      <div className="title">
                        <p className="title-top">ZAJEBISCIE SIĘ SKŁADA! ZNALAZŁEŚ MNIE!</p>
                        <div className="title-content">
                          <p className="intro-text">Bo trzeba przyciągnąć uwagę klientów i sprawić, że będą o tobie pamiętać w tym świecie pełnym klonów.</p>
                          <p className="subtitle-text">Dlatego tworzę:</p>
                          <ul className="services-list">
                            <li><span className="highlight-word">Zajebisty</span> copywriting (coś, z jajami!)</li>
                            <li><span className="highlight-word">Zajebista</span> strona internetowa</li>
                            <li><span className="highlight-word">Zajebisty</span> marketing</li>
                            <li><span className="highlight-word">Zajebisty</span> branding</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Imagen en la esquina superior izquierda de la tercera sección */}
            {section.id === 2 && (
              <>
                <div className="absolute top-4 left-4 md:top-8 md:left-8 z-50">
                  <div className="glitch w-[300px] pointer-events-none select-none">
                    <img src="/marketingzjajami.png" alt="Marketing z jajami" draggable={false} />
                    <img src="/marketingzjajami.png" alt="" aria-hidden="true" draggable={false} />
                    <img src="/marketingzjajami.png" alt="" aria-hidden="true" draggable={false} />
                  </div>
                </div>

                {/* Tarjetas en el lado derecho: dos arriba, una abajo */}
                <div className="absolute right-32 top-1/2 -translate-y-1/2 z-40">
                  <div className="flex flex-col items-center gap-6">
                    {/* Fila superior: dos tarjetas */}
                    <div className="flex gap-6">
                      {/* Tarjeta 1 - Marketing Klon */}
                      <div 
                        className="flip-card cursor-pointer"
                        onClick={() => setCurrentPage('marketingklon.png')}
                      >
                        <div className="flip-card-front">
                          <p className="flip-card-front-title">Marketing<br/>Klon</p>
                          <div className="flip-card-price-box">
                            <span className="flip-card-currency">€</span>
                            <span className="flip-card-amount">500</span>
                          </div>
                        </div>
                        <div className="flip-card__content">
                          <div className="flip-card__header">
                            <span className="flip-card__icon">⚠️</span>
                            <h3 className="flip-card__subtitle">Co zawiera?</h3>
                          </div>
                          <p className="flip-card__text"><span className="highlight-red">Spersonalizowana</span> strona internetowa <span className="highlight-red">skopiowana</span> z innych, tak jak wszystkie.</p>
                          <p className="flip-card__text">Design z szablonów, marketing bez strategii, treści z copy-paste'u.</p>
                          <div className="flip-card__verdict">
                            <p>Zajebisty? <span className="verdict-no">NIE</span></p>
                            <p>Tani? <span className="verdict-yes">TAK</span></p>
                          </div>
                        </div>
                      </div>

                      {/* Tarjeta 2 - Zajebista Strona */}
                      <div 
                        className="flip-card cursor-pointer"
                        onClick={() => setCurrentPage('zajebistastrona.png')}
                      >
                        <div className="flip-card-front">
                          <p className="flip-card-front-title">Zajebista<br/>Strona<br/>Internetowa</p>
                          <div className="flip-card-price-box">
                            <span className="flip-card-currency">€</span>
                            <span className="flip-card-amount">3000</span>
                          </div>
                        </div>
                        <div className="flip-card__content">
                          <p className="flip-card__title">Tarjeta 2</p>
                          <p className="flip-card__description">Descripción de la segunda tarjeta con más detalles.</p>
                        </div>
                      </div>
                    </div>

                    {/* Fila inferior: una tarjeta centrada */}
                    <div 
                      className="flip-card cursor-pointer"
                      onClick={() => setCurrentPage('itojestzajebistymarketing.png')}
                    >
                      <div className="flip-card-front">
                        <p className="flip-card-front-title">Marketing<br/>z jajami</p>
                        <div className="flip-card-price-box">
                          <span className="flip-card-currency">€</span>
                          <span className="flip-card-amount">5000</span>
                        </div>
                      </div>
                      <div className="flip-card__content">
                        <p className="flip-card__title">Tarjeta 3</p>
                        <p className="flip-card__description">Descripción de la tercera tarjeta con contenido relevante.</p>
                      </div>
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
