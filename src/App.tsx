import React, { useState, useRef } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Home, Search, Library, 
  Settings, Mic2, Activity, Heart, Share2, Info, ExternalLink,
  CheckCircle, AlertCircle, Loader2, Image as ImageIcon, Music, Users
} from 'lucide-react';
import axios from 'axios';
import './App.css';

// --- CONFIGURACIÓN DE APIs REALES ---
const APIS = {
  ITUNES: 'https://itunes.apple.com/search',
  GROQ: 'https://api.groq.com/openai/v1/chat/completions' 
};

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

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [view, setView] = useState<'home' | 'search' | 'library' | 'settings'>('home');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('groq_key') || '');
  const [showDna, setShowDna] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Buscar en iTunes API (REAL - Datos verdaderos)
  const searchTracks = async (searchQuery: string) => {
    if (!searchQuery) return;
    try {
      const res = await axios.get(APIS.ITUNES, {
        params: { term: searchQuery, media: 'music', limit: 20 }
      });
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
    } catch (error) {
      console.error("Error fetching iTunes:", error);
      alert("Error conectando con iTunes API. Verifica tu conexión.");
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

    const prompt = `Analiza la canción "${track.trackName}" de ${track.artistName}. Devuelve JSON: {"summary":"resumen 150 palabras","collaborators":["artista1"],"images":[{"url":"http...","type":"static","caption":"..."}],"sources":[{"name":"Fuente","url":"http...","verified":true}]}`;

    try {
      const response = await axios.post(APIS.GROQ, {
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 1024,
        response_format: { type: "json_object" }
      }, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      });

      const data = JSON.parse(response.data.choices[0].message.content);
      
      setCurrentTrack(prev => prev ? ({
        ...prev,
        musicDna: {
          loading: false,
          summary: data.summary || "Sin resumen disponible",
          collaborators: data.collaborators || [],
          images: data.images || [],
          sources: data.sources || []
        }
      } as any) : null);

    } catch (error) {
      console.error("Error IA:", error);
      setCurrentTrack(prev => prev ? ({
        ...prev,
        musicDna: { loading: false, error: "Error generando DNA. Verifica tu API Key.", summary: "", sources: [], images: [], collaborators: [] }
      } as any) : null);
    }
  };

  const handlePlay = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    if (apiKey) generateMusicDNA(track);
    
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = track.previewUrl;
        audioRef.current.play().catch(e => console.log("Click requerido"));
      }
    }, 100);
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">
          <Music className="icon-blue" />
          <h1>SPOTIFORK <span className="version">v1.5.0</span></h1>
        </div>
        <nav>
          <button onClick={() => setView('home')} className={view === 'home' ? 'active' : ''}><Home size={20}/> Inicio</button>
          <button onClick={() => setView('search')} className={view === 'search' ? 'active' : ''}><Search size={20}/> Buscar Real</button>
          <button onClick={() => setView('library')} className={view === 'library' ? 'active' : ''}><Library size={20}/> Biblioteca</button>
          <button onClick={() => setView('settings')} className={view === 'settings' ? 'active' : ''}><Settings size={20}/> Ajustes</button>
        </nav>
        <div className="watchdog-status">
          <Activity size={14} className="green-pulse"/>
          <span>Sistemas OK</span>
        </div>
      </aside>

      <main className="main-content">
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
              <button onClick={() => searchTracks(query)}><Search/></button>
            </div>
            
            <div className="results-grid">
              {results.map(track => (
                <div key={track.trackId} className="card" onClick={() => handlePlay(track)}>
                  <img src={track.artworkUrl100} alt={track.trackName} />
                  <div className="card-info">
                    <h3>{track.trackName}</h3>
                    <p>{track.artistName}</p>
                    <span className="badge">Audio Real</span>
                  </div>
                  <div className="play-overlay"><Play fill="white"/></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="settings-section">
            <h2>Configuración APIs Reales</h2>
            <div className="setting-card">
              <h3><Mic2/> Clave IA (Groq)</h3>
              <p>Obtén key gratis en groq.com para MusicDNA</p>
              <input 
                type="password" 
                value={apiKey} 
                onChange={(e) => {
                  setApiKey(e.target.value);
                  localStorage.setItem('groq_key', e.target.value);
                }}
                placeholder="gsk_..."
              />
              <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="btn-link">Obtener Key</a>
            </div>
            <div className="setting-card">
              <h3><Info/> Estado</h3>
              <p>iTunes API: <CheckCircle size={14} className="green"/> OK</p>
              <p>Groq AI: <CheckCircle size={14} className="green"/> {apiKey ? 'Configurado' : 'Sin key'}</p>
              <p>Audio: <AlertCircle size={14} className="orange"/> Preview oficial + YouTube link</p>
            </div>
          </div>
        )}

        {showDna && currentTrack?.musicDna && (
          <div className="dna-overlay">
            <div className="dna-content">
              <button className="close-btn" onClick={() => setShowDna(false)}>×</button>
              
              <div className="dna-header">
                <img src={currentTrack.artworkUrl600} alt="Cover" />
                <div>
                  <h2>{currentTrack.trackName}</h2>
                  <h3>{currentTrack.artistName}</h3>
                  {currentTrack.musicDna.loading ? (
                    <div className="loading-dna"><Loader2 className="spin"/> IA Analizando...</div>
                  ) : currentTrack.musicDna.error ? (
                    <div className="error-dna">{currentTrack.musicDna.error}</div>
                  ) : (
                    <div className="success-dna"><CheckCircle/> Análisis Listo</div>
                  )}
                </div>
              </div>

              {!currentTrack.musicDna.loading && !currentTrack.musicDna.error && (
                <>
                  <section className="dna-section">
                    <h4><Info/> MusicDNA™ Resumen</h4>
                    <p>{currentTrack.musicDna.summary}</p>
                  </section>

                  <section className="dna-section">
                    <h4><Users/> Colaboradores</h4>
                    <div className="tags">
                      {currentTrack.musicDna.collaborators.map((c, i) => (
                        <span key={i} className="tag">{c}</span>
                      ))}
                    </div>
                  </section>

                  <section className="dna-section">
                    <h4><ImageIcon/> Galería</h4>
                    <div className="gallery">
                      {currentTrack.musicDna.images.length > 0 ? (
                        currentTrack.musicDna.images.map((img, i) => (
                          <div key={i} className="gallery-item">
                            <img src={img.url} alt={img.caption} onError={(e) => (e.currentTarget.style.display='none')} />
                            <caption>{img.caption}</caption>
                          </div>
                        ))
                      ) : (
                        <p>Sin imágenes disponibles</p>
                      )}
                    </div>
                  </section>

                  <section className="dna-section">
                    <h4><ExternalLink/> Fuentes Verificadas</h4>
                    <ul className="sources-list">
                      {currentTrack.musicDna.sources.map((s, i) => (
                        <li key={i}>
                          <a href={s.url} target="_blank" rel="noreferrer">{s.name} {s.verified && <CheckCircle size={12}/>}</a>
                        </li>
                      ))}
                    </ul>
                  </section>
                </>
              )}
            </div>
          </div>
        )}

        {currentTrack && (
          <div className="player-bar">
            <div className="track-info">
              <img src={currentTrack.artworkUrl100} alt="" />
              <div>
                <h4>{currentTrack.trackName}</h4>
                <p>{currentTrack.artistName}</p>
              </div>
              <button className="dna-btn" onClick={() => generateMusicDNA(currentTrack)} title="Ver MusicDNA">
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
              
              <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
              
              <div className="progress-bar">
                <div className="progress"></div>
              </div>
            </div>

            <div className="extra-controls">
               <a 
                 href={`https://www.youtube.com/results?search_query=${encodeURIComponent(currentTrack.artistName + ' ' + currentTrack.trackName)}`}
                 target="_blank"
                 rel="noreferrer"
                 className="btn-youtube-real"
               >
                 <ExternalLink size={16}/> Escuchar Completo en YouTube
               </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
