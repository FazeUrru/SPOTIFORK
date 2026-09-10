import { useState, useEffect, useRef } from 'react'
import './App.css'

// Tipos
interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  cover: string;
}

interface Playlist {
  id: number;
  name: string;
  tracks: Track[];
}

type SettingsCategory = 'general' | 'playback' | 'account' | 'privacy';

interface AppSettings {
  darkMode: boolean;
  audioQuality: string;
  autoplay: boolean;
  crossfade: number;
  volume: number;
  explicitContent: boolean;
  privateSession: boolean;
  notifications: boolean;
  language: string;
}

interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'livi';
  timestamp: Date;
}

interface DailySuggestion {
  id: number;
  text: string;
}

const defaultSettings: AppSettings = {
  darkMode: true,
  audioQuality: 'normal',
  autoplay: true,
  crossfade: 0,
  volume: 75,
  explicitContent: true,
  privateSession: false,
  notifications: true,
  language: 'es',
};

// Sugerencias diarias para DJ LiVi (se actualizan cada día)
const allSuggestions: DailySuggestion[][] = [
  [
    { id: 1, text: "🎵 Pon algo relajante para estudiar" },
    { id: 2, text: "🔥 Necesito energía para el gym" },
    { id: 3, text: "☕ Música suave para la mañana" },
    { id: 4, text: "🌙 Algo tranquilo para dormir" },
    { id: 5, text: "🎉 Fiesta en casa este fin de semana" },
    { id: 6, text: "🚗 Playlist para viaje largo" },
  ],
  [
    { id: 1, text: "🎸 Rock clásico de los 80s" },
    { id: 2, text: "🎹 Electrónica para programar" },
    { id: 3, text: "🎺 Jazz para cena romántica" },
    { id: 4, text: "🎤 Pop latino actual" },
    { id: 5, text: "🥁 Beats para concentrarme" },
    { id: 6, text: "🌈 Canciones felices para animarme" },
  ],
  [
    { id: 1, text: "🎻 Clásica para leer" },
    { id: 2, text: "🎷 Blues para tarde lluviosa" },
    { id: 3, text: "🎪 Reggaeton para bailar" },
    { id: 4, text: "🌟 Éxitos del momento" },
    { id: 5, text: "🎯 Indie alternativo" },
    { id: 6, text: "💫 Algo nuevo y diferente" },
  ],
  [
    { id: 1, text: "🏃 Running intensivo" },
    { id: 2, text: "🧘 Meditación y mindfulness" },
    { id: 3, text: "🎭 Bandas sonoras épicas" },
    { id: 4, text: "🍳 Cocina con ritmo" },
    { id: 5, text: "📚 Focus total para trabajar" },
    { id: 6, text: "🎨 Creatividad artística" },
  ],
  [
    { id: 1, text: "🌅 Amanecer acústico" },
    { id: 2, text: "🌃 Noche urbana" },
    { id: 3, text: "🎪 Festival virtual" },
    { id: 4, text: "☁️ Dream pop etéreo" },
    { id: 5, text: "⚡ Electro swing divertido" },
    { id: 6, text: "🌊 Chillwave relajante" },
  ],
  [
    { id: 1, text: "🎸 Guitarra española" },
    { id: 2, text: "🥁 Percusión africana" },
    { id: 3, text: "🎺 Trompeta jazzística" },
    { id: 4, text: "🎹 Piano minimalista" },
    { id: 5, text: "🎻 Cuerdas orquestales" },
    { id: 6, text: "🌍 World music global" },
  ],
  [
    { id: 1, text: "🚀 Synthwave futurista" },
    { id: 2, text: "🦄 K-pop energético" },
    { id: 3, text: "🤠 Country moderno" },
    { id: 4, text: "🎪 Cabaret vintage" },
    { id: 5, text: "🌌 Ambient espacial" },
    { id: 6, text: "🎯 Trap latino" },
  ]
];

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'library' | 'settings'>('home');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('spotifork_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  const [activeSettingsCategory, setActiveSettingsCategory] = useState<SettingsCategory>('general');

  // Guardar ajustes en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem('spotifork_settings', JSON.stringify(settings));
  }, [settings]);

  // Función para resetear la aplicación (V1.2.0)
  const resetApp = () => {
    if (window.confirm('¿Estás seguro de que quieres resetear la aplicación? Se borrarán tus favoritos, historial y ajustes.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Funciones para actualizar ajustes
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Datos de ejemplo
  const featuredPlaylists: Playlist[] = [
    { id: 1, name: "Éxitos del Momento", tracks: [] },
    { id: 2, name: "Música para Programar", tracks: [] },
    { id: 3, name: "Relax Total", tracks: [] },
    { id: 4, name: "Workout Mix", tracks: [] },
  ];

  const recentTracks: Track[] = [
    { id: 1, title: "Blinding Lights", artist: "The Weeknd", duration: "3:20", cover: "🎵" },
    { id: 2, title: "Shape of You", artist: "Ed Sheeran", duration: "3:53", cover: "🎶" },
    { id: 3, title: "Levitating", artist: "Dua Lipa", duration: "3:23", cover: "🎤" },
  ];

  const searchResults: Track[] = searchQuery.length > 0 
    ? recentTracks.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  // Categorías de ajustes
  const settingsCategories: { id: SettingsCategory; label: string; icon: string }[] = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'playback', label: 'Reproducción', icon: '▶️' },
    { id: 'account', label: 'Cuenta', icon: '👤' },
    { id: 'privacy', label: 'Privacidad', icon: '🔒' },
  ];

  return (
    <div className={`app ${settings.darkMode ? 'dark' : 'light'}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-icon">🎧</span>
          <h1>SPOTIFORK</h1>
        </div>
        
        <nav className="nav-menu">
          <button 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <span className="icon">🏠</span>
            Inicio
          </button>
          <button 
            className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <span className="icon">🔍</span>
            Buscar
          </button>
          <button 
            className={`nav-item ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => setActiveTab('library')}
          >
            <span className="icon">📚</span>
            Biblioteca
          </button>
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="icon">⚙️</span>
            Ajustes
          </button>
        </nav>

        <div className="user-section">
          <div className="user-avatar">👤</div>
          <span>Usuario</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-actions">
            <button className="nav-btn">◀</button>
            <button className="nav-btn">▶</button>
          </div>
          {activeTab === 'search' && (
            <input
              type="text"
              placeholder="¿Qué quieres escuchar?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          )}
          <div className="header-right">
            <button 
              className="theme-toggle"
              onClick={() => updateSetting('darkMode', !settings.darkMode)}
              title={settings.darkMode ? 'Modo claro' : 'Modo oscuro'}
            >
              {settings.darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="content-area">
          {activeTab === 'home' && (
            <>
              <section className="hero-section">
                <h2>Bienvenido a SPOTIFORK</h2>
                <p>Tu música favorita, en un solo lugar</p>
              </section>

              <section className="playlists-section">
                <h3>Playlists Destacadas</h3>
                <div className="cards-grid">
                  {featuredPlaylists.map((playlist) => (
                    <div key={playlist.id} className="card">
                      <div className="card-image">🎵</div>
                      <div className="card-info">
                        <h4>{playlist.name}</h4>
                        <p>Playlist • Varios artistas</p>
                      </div>
                      <button 
                        className="play-overlay"
                        onClick={() => playTrack(recentTracks[0])}
                      >
                        ▶
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="recent-section">
                <h3>Escuchado Recientemente</h3>
                <div className="tracks-list">
                  {recentTracks.map((track) => (
                    <div 
                      key={track.id} 
                      className={`track-item ${currentTrack?.id === track.id ? 'playing' : ''}`}
                      onClick={() => playTrack(track)}
                    >
                      <div className="track-cover">{track.cover}</div>
                      <div className="track-info">
                        <div className="track-title">{track.title}</div>
                        <div className="track-artist">{track.artist}</div>
                      </div>
                      <div className="track-duration">{track.duration}</div>
                      {currentTrack?.id === track.id && isPlaying && (
                        <div className="equalizer">
                          <span></span><span></span><span></span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === 'search' && (
            <section className="search-section">
              <h2>Buscar Música</h2>
              {searchQuery.length > 0 ? (
                <div className="search-results">
                  {searchResults.length > 0 ? (
                    searchResults.map((track) => (
                      <div 
                        key={track.id} 
                        className="track-item"
                        onClick={() => playTrack(track)}
                      >
                        <div className="track-cover">{track.cover}</div>
                        <div className="track-info">
                          <div className="track-title">{track.title}</div>
                          <div className="track-artist">{track.artist}</div>
                        </div>
                        <div className="track-duration">{track.duration}</div>
                      </div>
                    ))
                  ) : (
                    <p className="no-results">No se encontraron resultados para "{searchQuery}"</p>
                  )}
                </div>
              ) : (
                <div className="browse-categories">
                  <h3>Explorar Categorías</h3>
                  <div className="categories-grid">
                    {['Pop', 'Rock', 'Hip-Hop', 'Electrónica', 'Jazz', 'Clásica', 'Reggaeton', 'Indie'].map((cat) => (
                      <button key={cat} className="category-card">
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === 'library' && (
            <section className="library-section">
              <h2>Tu Biblioteca</h2>
              <div className="library-tabs">
                <button className="lib-tab active">Playlists</button>
                <button className="lib-tab">Artistas</button>
                <button className="lib-tab">Álbumes</button>
              </div>
              <div className="empty-state">
                <span className="empty-icon">📚</span>
                <p>Tu biblioteca está vacía</p>
                <button className="btn-primary">Explorar música</button>
              </div>
            </section>
          )}

          {activeTab === 'settings' && (
            <section className="settings-section-v2">
              <h2>Ajustes</h2>
              
              <div className="settings-container">
                {/* Sidebar de categorías */}
                <div className="settings-sidebar">
                  {settingsCategories.map((cat) => (
                    <button
                      key={cat.id}
                      className={`settings-category-btn ${activeSettingsCategory === cat.id ? 'active' : ''}`}
                      onClick={() => setActiveSettingsCategory(cat.id)}
                    >
                      <span className="cat-icon">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Panel de ajustes */}
                <div className="settings-panel">
                  {/* GENERAL */}
                  {activeSettingsCategory === 'general' && (
                    <div className="settings-content">
                      <h3>⚙️ General</h3>
                      
                      <div className="setting-item">
                        <div className="setting-label">
                          <span className="setting-title">Modo Oscuro</span>
                          <span className="setting-desc">Cambiar tema de la aplicación</span>
                        </div>
                        <label className="toggle">
                          <input 
                            type="checkbox" 
                            checked={settings.darkMode}
                            onChange={() => updateSetting('darkMode', !settings.darkMode)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="setting-item">
                        <div className="setting-label">
                          <span className="setting-title">Idioma</span>
                          <span className="setting-desc">Selecciona tu idioma preferido</span>
                        </div>
                        <select 
                          className="select-input"
                          value={settings.language}
                          onChange={(e) => updateSetting('language', e.target.value)}
                        >
                          <option value="es">Español</option>
                          <option value="en">English</option>
                          <option value="pt">Português</option>
                          <option value="fr">Français</option>
                        </select>
                      </div>

                      <div className="setting-item">
                        <div className="setting-label">
                          <span className="setting-title">Calidad de Audio</span>
                          <span className="setting-desc">Selecciona la calidad de reproducción</span>
                        </div>
                        <select 
                          className="select-input"
                          value={settings.audioQuality}
                          onChange={(e) => updateSetting('audioQuality', e.target.value)}
                        >
                          <option value="low">Baja (96 kbps)</option>
                          <option value="normal">Normal (160 kbps)</option>
                          <option value="high">Alta (320 kbps)</option>
                        </select>
                      </div>

                      <div className="setting-item">
                        <div className="setting-label">
                          <span className="setting-title">Notificaciones</span>
                          <span className="setting-desc">Recibir notificaciones de la app</span>
                        </div>
                        <label className="toggle">
                          <input 
                            type="checkbox" 
                            checked={settings.notifications}
                            onChange={() => updateSetting('notifications', !settings.notifications)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* REPRODUCCIÓN */}
                  {activeSettingsCategory === 'playback' && (
                    <div className="settings-content">
                      <h3>▶️ Reproducción</h3>
                      
                      <div className="setting-item">
                        <div className="setting-label">
                          <span className="setting-title">Volumen por Defecto</span>
                          <span className="setting-desc">Nivel actual: {settings.volume}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={settings.volume}
                          onChange={(e) => updateSetting('volume', Number(e.target.value))}
                          className="volume-slider"
                        />
                      </div>

                      <div className="setting-item">
                        <div className="setting-label">
                          <span className="setting-title">Reproducción Automática</span>
                          <span className="setting-desc">Reproducir siguiente canción automáticamente</span>
                        </div>
                        <label className="toggle">
                          <input 
                            type="checkbox" 
                            checked={settings.autoplay}
                            onChange={() => updateSetting('autoplay', !settings.autoplay)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="setting-item">
                        <div className="setting-label">
                          <span className="setting-title">Crossfade</span>
                          <span className="setting-desc">Transición entre canciones: {settings.crossfade}s</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="12" 
                          value={settings.crossfade}
                          onChange={(e) => updateSetting('crossfade', Number(e.target.value))}
                          className="volume-slider"
                        />
                      </div>
                    </div>
                  )}

                  {/* CUENTA */}
                  {activeSettingsCategory === 'account' && (
                    <div className="settings-content">
                      <h3>👤 Cuenta</h3>
                      
                      <div className="setting-item">
                        <div className="setting-label">
                          <span className="setting-title">Nombre de Usuario</span>
                          <span className="setting-desc">Tu nombre visible en la app</span>
                        </div>
                        <input type="text" className="text-input" defaultValue="Usuario" />
                      </div>

                      <div className="setting-item">
                        <div className="setting-label">
                          <span className="setting-title">Email</span>
                          <span className="setting-desc">Correo electrónico asociado</span>
                        </div>
                        <input type="email" className="text-input" defaultValue="usuario@ejemplo.com" />
                      </div>

                      <div className="setting-item vertical">
                        <button className="btn-secondary full-width">Editar Perfil</button>
                        <button className="btn-secondary full-width" onClick={resetApp}>Resetear Aplicación</button>
                        <button className="btn-danger full-width">Cerrar Sesión</button>
                      </div>
                    </div>
                  )}

                  {/* PRIVACIDAD */}
                  {activeSettingsCategory === 'privacy' && (
                    <div className="settings-content">
                      <h3>🔒 Privacidad</h3>
                      
                      <div className="setting-item">
                        <div className="setting-label">
                          <span className="setting-title">Contenido Explícito</span>
                          <span className="setting-desc">Mostrar música con contenido explícito</span>
                        </div>
                        <label className="toggle">
                          <input 
                            type="checkbox" 
                            checked={settings.explicitContent}
                            onChange={() => updateSetting('explicitContent', !settings.explicitContent)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="setting-item">
                        <div className="setting-label">
                          <span className="setting-title">Sesión Privada</span>
                          <span className="setting-desc">No guardar historial de reproducción</span>
                        </div>
                        <label className="toggle">
                          <input 
                            type="checkbox" 
                            checked={settings.privateSession}
                            onChange={() => updateSetting('privateSession', !settings.privateSession)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="setting-item">
                        <div className="setting-label">
                          <span className="setting-title">Ahorro de Datos</span>
                          <span className="setting-desc">Reducir consumo de datos móviles</span>
                        </div>
                        <label className="toggle">
                          <input 
                            type="checkbox" 
                            checked={settings.dataSaver}
                            onChange={() => updateSetting('dataSaver', !settings.dataSaver)}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="privacy-note">
                        <p>📋 Tus datos están protegidos. Consulta nuestra política de privacidad para más información.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Player Bar */}
      {currentTrack && (
        <footer className="player-bar">
          <div className="now-playing">
            <div className="track-cover-small">{currentTrack.cover}</div>
            <div className="track-details">
              <div className="track-name">{currentTrack.title}</div>
              <div className="track-artist-small">{currentTrack.artist}</div>
            </div>
          </div>
          
          <div className="player-controls">
            <button className="control-btn">⏮</button>
            <button 
              className="control-btn play-pause"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button className="control-btn">⏭</button>
          </div>
          
          <div className="volume-controls">
            <span>🔊</span>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={settings.volume}
              onChange={(e) => updateSetting('volume', Number(e.target.value))}
              className="volume-slider-small"
            />
          </div>
        </footer>
      )}
    </div>
  )
}

export default App
