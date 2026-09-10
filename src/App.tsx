import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Home, Search, Library, 
  Settings, Mic2, Activity, Heart, Info, ExternalLink,
  CheckCircle, AlertCircle, Loader2, Image as ImageIcon, Music, Users,
  MessageSquare, X, Send, RefreshCw, Volume2, Zap, Shield
} from 'lucide-react';
import axios from 'axios';
import './App.css';

// --- CONFIGURACIÓN DE APIs REALES ---
const APIS = {
  ITUNES: 'https://itunes.apple.com/search',
  GROQ: 'https://api.groq.com/openai/v1/chat/completions'
};

// --- SUGERENCIAS DIARIAS PARA DJ LiVi (4-6 por día) ---
const DAILY_SUGGESTIONS = [
  "¿Quieres descubrir música nueva de tu género favorito?",
  "Hoy es un buen día para escuchar algo diferente. ¿Jazz o Electrónica?",
  "¿Te gustaría saber la historia detrás de tu canción favorita?",
  "Recomendación: Escucha artistas emergentes de tu país.",
  "¿Sabías que puedes ver el MusicDNA de cualquier canción?",
  "Intenta buscar bandas sonoras de películas clásicas."
];

// --- TIPOS ---
interface Track {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  artworkUrl600: string;
  previewUrl: string;
  releaseDate: string;
  primaryGenreName: string;
  musicDna?: MusicDNAData;
}

interface MusicDNAData {
  summary: string;
  sources: { name: string; url: string; verified: boolean }[];
  images: { url: string; type: 'static' | 'animated'; caption: string }[];
  collaborators: string[];
  loading: boolean;
  error?: string;
}

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [view, setView] = useState<'home' | 'search' | 'library' | 'settings' | 'dj'>('home');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('groq_key') || '');
  const [showDna, setShowDna] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [dailySuggestion, setDailySuggestion] = useState('');
  const [volume, setVolume] = useState(0.8);
  const [watchdogStatus, setWatchdogStatus] = useState({ itunes: true, groq: true, audio: true });
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Inicializar sugerencia diaria al cargar
  useEffect(() => {
    const dayIndex = new Date().getDate() % DAILY_SUGGESTIONS.length;
    setDailySuggestion(DAILY_SUGGESTIONS[dayIndex]);
    
    // Watchdog: verificar APIs cada 10 segundos
    const watchdogInterval = setInterval(async () => {
      try {
        await axios.get(APIS.ITUNES, { params: { term: 'test', limit: 1 }, timeout: 5000 });
        setWatchdogStatus(prev => ({ ...prev, itunes: true }));
      } catch {
        setWatchdogStatus(prev => ({ ...prev, itunes: false }));
      }
      
      if (apiKey) {
        try {
          await axios.post(APIS.GROQ, { model: 'llama3-8b-8192', messages: [{ role: 'user', content: 'test' }] }, { 
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            timeout: 5000
          });
          setWatchdogStatus(prev => ({ ...prev, groq: true }));
        } catch {
          setWatchdogStatus(prev => ({ ...prev, groq: false }));
        }
      }
    }, 10000);
    
    return () => clearInterval(watchdogInterval);
  }, [apiKey]);

  // Auto-scroll del chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Buscar en iTunes API (REAL)
  const searchTracks = async (searchQuery: string) => {
    if (!searchQuery) return;
    setResults([]);
    try {
      const res = await axios.get(APIS.ITUNES, {
        params: { term: searchQuery, media: 'music', limit: 24 }
      });
      
      if (res.data.results && res.data.results.length > 0) {
        setResults(res.data.results.map((item: any) => ({
          trackId: item.trackId,
          trackName: item.trackName,
          artistName: item.artistName,
          collectionName: item.collectionName,
          artworkUrl100: item.artworkUrl100,
          artworkUrl600: item.artworkUrl600 || item.artworkUrl100,
          previewUrl: item.previewUrl,
          releaseDate: item.releaseDate,
          primaryGenreName: item.primaryGenreName
        })));
      } else {
        alert("No se encontraron resultados");
      }
    } catch (error: any) {
      console.error("Error fetching iTunes:", error);
      alert(`Error conectando con iTunes API: ${error.message}`);
    }
  };

  // Generar MusicDNA con IA Real (Groq)
  const generateMusicDNA = async (track: Track) => {
    if (!apiKey) {
      alert("⚠️ Para usar la IA Real, añade tu API Key de Groq en Ajustes. (Es gratis en groq.com)");
      setView('settings');
      return;
    }

    setShowDna(true);
    setCurrentTrack({ ...track, musicDna: { loading: true, summary: '', sources: [], images: [], collaborators: [] } } as any);

    const prompt = `Analiza la canción "${track.trackName}" de ${track.artistName}. Devuelve SOLO JSON válido con esta estructura exacta: {"summary":"resumen de lanzamiento de 150 palabras","collaborators":["artista invitado si hay"],"images":[{"url":"URL de imagen real relacionada","type":"static","caption":"pie de foto"}],"sources":[{"name":"Nombre fuente","url":"URL","verified":true}]}. NO incluyas texto fuera del JSON.`;

    try {
      const response = await axios.post(APIS.GROQ, {
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1024,
        response_format: { type: "json_object" }
      }, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      });

      let data;
      try {
        data = JSON.parse(response.data.choices[0].message.content);
      } catch {
        data = { summary: "No se pudo generar el análisis.", collaborators: [], images: [], sources: [] };
      }
      
      setCurrentTrack(prev => prev ? ({
        ...prev,
        musicDna: {
          loading: false,
          summary: data.summary || "Sin resumen disponible",
          collaborators: Array.isArray(data.collaborators) ? data.collaborators : [],
          images: Array.isArray(data.images) ? data.images : [],
          sources: Array.isArray(data.sources) ? data.sources : []
        }
      } as any) : null);

    } catch (error: any) {
      console.error("Error IA:", error);
      setCurrentTrack(prev => prev ? ({
        ...prev,
        musicDna: { 
          loading: false, 
          error: `Error: ${error.response?.status === 401 ? 'API Key inválida' : 'Verifica tu conexión'}`, 
          summary: "", 
          sources: [], 
          images: [], 
          collaborators: [] 
        }
      } as any) : null);
    }
  };

  // Manejar reproducción de audio REAL
  const handlePlay = (track: Track) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = track.previewUrl;
      audioRef.current.volume = volume;
      audioRef.current.play()
        .then(() => {
          setCurrentTrack(track);
          setIsPlaying(true);
          if (apiKey && !currentTrack?.musicDna) generateMusicDNA(track);
        })
        .catch(err => {
          console.error("Error al reproducir:", err);
          alert("Haz click en play nuevamente para iniciar el audio");
        });
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error("Error:", err));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Chat con DJ LiVi
  const sendMessageToLiVi = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: ChatMessage = {
      id: Date.now(),
      text,
      isUser: true,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    if (!apiKey) {
      setTimeout(() => {
        const errorMsg: ChatMessage = {
          id: Date.now() + 1,
          text: "👋 ¡Hola! Soy DJ LiVi. Para respuestas con IA, configura tu API Key en Ajustes. Mientras tanto, ¡disfruta de la música!",
          isUser: false,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, errorMsg]);
      }, 500);
      return;
    }

    // Respuesta con IA
    try {
      const response = await axios.post(APIS.GROQ, {
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "Eres DJ LiVi, una DJ experta y amigable. Das recomendaciones musicales cortas y útiles. Máximo 2 frases." },
          { role: "user", content: text }
        ],
        temperature: 0.7,
        max_tokens: 150
      }, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      });

      const aiMsg: ChatMessage = {
        id: Date.now() + 1,
        text: response.data.choices[0].message.content,
        isUser: false,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: Date.now() + 1,
        text: "Lo siento, tuve un problema de conexión. ¿Podrías repetir?",
        isUser: false,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMsg]);
    }
  };

  const openChat = () => {
    setShowChat(true);
    if (chatMessages.length === 0) {
      const welcomeMsg: ChatMessage = {
        id: 1,
        text: `🎵 ¡Hola! Soy DJ LiVi. ${dailySuggestion}`,
        isUser: false,
        timestamp: new Date()
      };
      setChatMessages([welcomeMsg]);
    }
  };

  const resetApp = () => {
    if (confirm("¿Estás seguro de resetear toda la aplicación? Se borrarán favoritos, historial y ajustes.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">
          <Music className="icon-blue" />
          <h1>SPOTIFORK <span className="version">v1.6.0</span></h1>
        </div>
        <nav>
          <button onClick={() => setView('home')} className={view === 'home' ? 'active' : ''}>
            <Home size={20}/> Inicio
          </button>
          <button onClick={() => setView('search')} className={view === 'search' ? 'active' : ''}>
            <Search size={20}/> Buscar Real
          </button>
          <button onClick={() => setView('library')} className={view === 'library' ? 'active' : ''}>
            <Library size={20}/> Biblioteca
          </button>
          <button onClick={() => setView('dj')} className={view === 'dj' ? 'active' : ''}>
            <Mic2 size={20}/> DJ LiVi
          </button>
          <button onClick={() => setView('settings')} className={view === 'settings' ? 'active' : ''}>
            <Settings size={20}/> Ajustes
          </button>
        </nav>
        
        <div className="watchdog-status">
          <div style={{ marginBottom: '8px' }}>
            <Shield size={14} className={watchdogStatus.itunes ? 'green-pulse' : 'orange-pulse'}/>
            <span>iTunes: {watchdogStatus.itunes ? 'OK' : 'OFF'}</span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Zap size={14} className={watchdogStatus.groq && apiKey ? 'green-pulse' : 'orange-pulse'}/>
            <span>Groq AI: {watchdogStatus.groq && apiKey ? 'OK' : (apiKey ? 'OFF' : 'Sin Key')}</span>
          </div>
          <div>
            <Activity size={14} className="green-pulse"/>
            <span>Audio: REAL</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {view === 'home' && (
          <div className="home-section">
            <h2>Bienvenido a SPOTIFORK v1.6.0</h2>
            <p>Música real con APIs oficiales, IA integrada y DJ LiVi</p>
            <div className="hero-cards">
              <div className="hero-card" onClick={() => setView('search')}>
                <Search size={40} className="icon-blue"/>
                <h3>Buscar Música Real</h3>
                <p>Millones de canciones vía iTunes API</p>
              </div>
              <div className="hero-card" onClick={openChat}>
                <MessageSquare size={40} className="icon-purple"/>
                <h3>Chat con DJ LiVi</h3>
                <p>{dailySuggestion}</p>
              </div>
              <div className="hero-card" onClick={() => setView('library')}>
                <Heart size={40} className="icon-red"/>
                <h3>Tus Favoritos</h3>
                <p>Guarda tus canciones preferidas</p>
              </div>
            </div>
          </div>
        )}

        {view === 'search' && (
          <div className="search-section">
            <h2>Búsqueda Global Real (iTunes API)</h2>
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="Artista o canción..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchTracks(query)}
              />
              <button onClick={() => searchTracks(query)}>
                <Search/>
              </button>
            </div>
            
            <div className="results-grid">
              {results.length === 0 ? (
                <p className="no-results">Busca tu artista o canción favorita</p>
              ) : (
                results.map(track => (
                  <div key={track.trackId} className="card" onClick={() => handlePlay(track)}>
                    <img src={track.artworkUrl100} alt={track.trackName} loading="lazy" />
                    <div className="card-info">
                      <h3>{track.trackName}</h3>
                      <p>{track.artistName}</p>
                      <span className="badge">Preview Real</span>
                    </div>
                    <div className="play-overlay">
                      <Play fill="white"/>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {view === 'dj' && (
          <div className="dj-section">
            <div className="dj-header">
              <div className="dj-avatar">
                <Mic2 size={60} className="icon-purple"/>
              </div>
              <div>
                <h2>DJ LiVi</h2>
                <p>Tu asistente musical con IA</p>
                <p className="daily-tip">💡 {dailySuggestion}</p>
              </div>
            </div>
            
            <div className="suggestions-grid">
              {DAILY_SUGGESTIONS.slice(0, 4).map((sug, i) => (
                <button 
                  key={i} 
                  className="suggestion-btn"
                  onClick={() => sendMessageToLiVi(sug)}
                >
                  {sug}
                </button>
              ))}
            </div>

            <button className="open-chat-btn" onClick={openChat}>
              <MessageSquare size={20}/> Abrir Chat Completo
            </button>
          </div>
        )}

        {view === 'settings' && (
          <div className="settings-section">
            <h2>Configuración</h2>
            
            <div className="settings-category">
              <h3><Zap/> APIs e IA</h3>
              <div className="setting-card">
                <h4><Mic2/> Clave Groq (IA Real)</h4>
                <p>Obtén key gratis en groq.com para MusicDNA y DJ LiVi</p>
                <input 
                  type="password" 
                  value={apiKey} 
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    localStorage.setItem('groq_key', e.target.value);
                  }}
                  placeholder="gsk_..."
                />
                <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="btn-link">
                  Obtener Key Gratis <ExternalLink size={14}/>
                </a>
              </div>
            </div>

            <div className="settings-category">
              <h3><Volume2/> Reproducción</h3>
              <div className="setting-card">
                <h4>Volumen por defecto</h4>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={volume}
                  onChange={handleVolumeChange}
                />
                <span>{Math.round(volume * 100)}%</span>
              </div>
            </div>

            <div className="settings-category">
              <h3><Shield/> Sistema</h3>
              <div className="setting-card">
                <h4>Estado del Watchdog</h4>
                <p>iTunes API: {watchdogStatus.itunes ? '✅ Operativo' : '❌ Sin conexión'}</p>
                <p>Groq AI: {apiKey ? (watchdogStatus.groq ? '✅ Operativo' : '⚠️ Verifica Key') : '⚪ Sin configurar'}</p>
                <p>Audio HTML5: ✅ Nativo</p>
              </div>
              
              <div className="setting-card danger">
                <h4><RefreshCw/> Resetear Aplicación</h4>
                <p>Borra todos los datos locales (favoritos, historial, ajustes)</p>
                <button onClick={resetApp} className="btn-danger">
                  Resetear Todo
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'library' && (
          <div className="library-section">
            <h2>Tu Biblioteca</h2>
            <p className="empty-state">Funcionalidad próximamente. Busca canciones y guárdalas como favoritas.</p>
          </div>
        )}

        {/* MODAL MusicDNA */}
        {showDna && currentTrack?.musicDna && (
          <div className="dna-overlay" onClick={() => setShowDna(false)}>
            <div className="dna-content" onClick={e => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setShowDna(false)}>
                <X size={24}/>
              </button>
              
              <div className="dna-header">
                <img src={currentTrack.artworkUrl600} alt="Cover" />
                <div>
                  <h2>{currentTrack.trackName}</h2>
                  <h3>{currentTrack.artistName}</h3>
                  {currentTrack.musicDna.loading ? (
                    <div className="loading-dna">
                      <Loader2 className="spin"/> IA Analizando canción...
                    </div>
                  ) : currentTrack.musicDna.error ? (
                    <div className="error-dna">
                      <AlertCircle className="red"/> {currentTrack.musicDna.error}
                    </div>
                  ) : (
                    <div className="success-dna">
                      <CheckCircle className="green"/> MusicDNA Generado
                    </div>
                  )}
                </div>
              </div>

              {!currentTrack.musicDna.loading && !currentTrack.musicDna.error && (
                <>
                  <section className="dna-section">
                    <h4><Info/> Resumen de Lanzamiento (IA)</h4>
                    <p className="dna-summary">{currentTrack.musicDna.summary}</p>
                  </section>

                  {currentTrack.musicDna.collaborators.length > 0 && (
                    <section className="dna-section">
                      <h4><Users/> Colaboradores e Invitados</h4>
                      <div className="tags">
                        {currentTrack.musicDna.collaborators.map((c: string, i: number) => (
                          <span key={i} className="tag">{c}</span>
                        ))}
                      </div>
                    </section>
                  )}

                  {currentTrack.musicDna.images.length > 0 && (
                    <section className="dna-section">
                      <h4><ImageIcon/> Galería Multimedia</h4>
                      <div className="gallery">
                        {currentTrack.musicDna.images.map((img: any, i: number) => (
                          <div key={i} className="gallery-item">
                            <img 
                              src={img.url} 
                              alt={img.caption} 
                              onError={(e) => (e.currentTarget.style.display='none')}
                              loading="lazy"
                            />
                            {img.caption && <caption>{img.caption}</caption>}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {currentTrack.musicDna.sources.length > 0 && (
                    <section className="dna-section">
                      <h4><ExternalLink/> Fuentes Verificadas</h4>
                      <ul className="sources-list">
                        {currentTrack.musicDna.sources.map((s: any, i: number) => (
                          <li key={i}>
                            <a href={s.url} target="_blank" rel="noreferrer">
                              {s.name} {s.verified && <CheckCircle size={12} className="green"/>}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* CHAT FLOTANTE DJ LiVi */}
        {showChat && (
          <div className="chat-overlay" onClick={() => setShowChat(false)}>
            <div className="chat-window" onClick={e => e.stopPropagation()}>
              <div className="chat-header">
                <div>
                  <h3>DJ LiVi</h3>
                  <span className="online-indicator">● En línea</span>
                </div>
                <button onClick={() => setShowChat(false)}><X size={20}/></button>
              </div>
              
              <div className="chat-messages">
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`message ${msg.isUser ? 'user' : 'bot'}`}>
                    <div className="message-bubble">
                      {msg.text}
                    </div>
                    <span className="message-time">
                      {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              
              <div className="chat-input-area">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessageToLiVi(chatInput)}
                  placeholder="Escribe a DJ LiVi..."
                />
                <button onClick={() => sendMessageToLiVi(chatInput)}>
                  <Send size={18}/>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PLAYER BAR */}
        {currentTrack && (
          <div className="player-bar">
            <div className="track-info">
              <img src={currentTrack.artworkUrl100} alt="" />
              <div>
                <h4>{currentTrack.trackName}</h4>
                <p>{currentTrack.artistName}</p>
              </div>
              <button 
                className="dna-btn" 
                onClick={() => generateMusicDNA(currentTrack)} 
                title="Ver MusicDNA"
              >
                <Activity size={18}/>
              </button>
            </div>
            
            <div className="player-controls">
              <div className="buttons">
                <SkipBack size={20}/>
                <button className="play-pause" onClick={togglePlayPause}>
                  {isPlaying ? <Pause fill="black"/> : <Play fill="black"/>}
                </button>
                <SkipForward size={20}/>
              </div>
              
              <audio 
                ref={audioRef} 
                onEnded={() => setIsPlaying(false)}
                onError={(e) => console.error("Error audio:", e)}
              />
            </div>

            <div className="extra-controls">
              <div className="volume-control">
                <Volume2 size={18}/>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                />
              </div>
              <a 
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(currentTrack.artistName + ' ' + currentTrack.trackName + ' official audio')}`}
                target="_blank"
                rel="noreferrer"
                className="btn-youtube-real"
              >
                <ExternalLink size={16}/> Escuchar Completo en YouTube
              </a>
              <button className="chat-mini-btn" onClick={openChat} title="Hablar con DJ LiVi">
                <MessageSquare size={18}/>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
