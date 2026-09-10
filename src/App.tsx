import { useState } from 'react'
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

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'library' | 'settings'>('home');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [volume, setVolume] = useState(75);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(true);

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

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
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
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Modo claro' : 'Modo oscuro'}
            >
              {darkMode ? '☀️' : '🌙'}
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
            <section className="settings-section">
              <h2>Ajustes</h2>
              
              <div className="settings-group">
                <h3>Preferencias</h3>
                <div className="setting-item">
                  <div className="setting-label">
                    <span>Modo Oscuro</span>
                    <small>Cambiar tema de la aplicación</small>
                  </div>
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={darkMode}
                      onChange={() => setDarkMode(!darkMode)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                
                <div className="setting-item">
                  <div className="setting-label">
                    <span>Calidad de Audio</span>
                    <small>Alta calidad para mejor experiencia</small>
                  </div>
                  <select className="select-input">
                    <option>Baja (96 kbps)</option>
                    <option selected>Normal (160 kbps)</option>
                    <option>Alta (320 kbps)</option>
                  </select>
                </div>
              </div>

              <div className="settings-group">
                <h3>Reproducción</h3>
                <div className="setting-item">
                  <div className="setting-label">
                    <span>Volumen por Defecto</span>
                    <small>Nivel actual: {volume}%</small>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="volume-slider"
                  />
                </div>
                
                <div className="setting-item">
                  <div className="setting-label">
                    <span>Reproducción Automática</span>
                    <small>Reproducir siguiente canción automáticamente</small>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="settings-group">
                <h3>Cuenta</h3>
                <button className="btn-secondary">Cerrar Sesión</button>
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
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="volume-slider-small"
            />
          </div>
        </footer>
      )}
    </div>
  )
}

export default App
