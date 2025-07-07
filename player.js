// Player Radio con tema anni 2000 - Versione ottimizzata
document.addEventListener('DOMContentLoaded', () => {
    // ======================
    //  CONFIGURAZIONE BASE
    // ======================
    const DOM = {
        audioPlayer: document.getElementById('radio-stream'),
        playPauseBtn: document.getElementById('playPauseBtn'),
        led: document.getElementById('on-air-led'),
        themeButtons: document.querySelectorAll('.theme-btn'),

    };

    const METADATA_FIELDS = [
        'current-track', 
        'current-artist', 
        'next-track', 
        'next-artist'
    ];

    const STATE = {
        isPlaying: false,
        currentTheme: localStorage.getItem('radioTheme') || 'theme-green'
    };

    // ======================
    //  FUNZIONALITÀ CORE
    // ======================
    // Gestione metadati
    const updateTrackInfo = (data) => {
        setField('current-track', data.current?.metadata?.track_title);
        setField('current-artist', data.current?.metadata?.artist_name);
        setField('next-track', data.next?.metadata?.track_title);
        setField('next-artist', data.next?.metadata?.artist_name);
        updateOnAirStatus();
    };

    const setOfflineStatus = () => {
        METADATA_FIELDS.forEach(id => {
            setField(id, null);
        });
        updateOnAirStatus();
    };

    const fetchRadioData = async () => {
        try {
            const response = await fetch('https://radiokiki.airtime.pro/api/live-info');
            const data = await response.json();
            
            (data.current || data.next) 
                ? updateTrackInfo(data) 
                : setOfflineStatus();
                
        } catch (error) {
            setOfflineStatus();
            console.error('Errore fetch metadati:', error);
        }
    };

    // Controllo audio
    const togglePlayback = () => {
        if (STATE.isPlaying) {
            DOM.audioPlayer.pause();
        } else {
            DOM.audioPlayer.play().catch(handlePlayError);
        }
        STATE.isPlaying = !STATE.isPlaying;
        updatePlayButton();
    };

    const handlePlayError = (error) => {
        STATE.isPlaying = false;
        updatePlayButton();
        console.error('Errore riproduzione:', error);
    };

    // UI Utilities
    const setField = (id, value) => {
        const element = document.getElementById(id);
        element.textContent = value || "Nothing Scheduled :c";
    };

    const updatePlayButton = () => {
        const icons = {
            play: DOM.playPauseBtn.querySelector('.play-icon'),
            pause: DOM.playPauseBtn.querySelector('.pause-icon')
        };
        
        icons.play.style.display = STATE.isPlaying ? 'none' : 'inline';
        icons.pause.style.display = STATE.isPlaying ? 'inline' : 'none';
    };

    const updateOnAirStatus = () => {
        const currentTrack = document.getElementById('current-track').textContent;
        DOM.led.classList.toggle(
            'active', 
            currentTrack && currentTrack !== "Nothing Scheduled :c"
        );
    };

    // Gestione temi
    const initTheme = () => {
        document.body.className = STATE.currentTheme;
        
        DOM.themeButtons.forEach(btn => {
            if (btn.dataset.theme === STATE.currentTheme) {
                btn.classList.add('active');
            }
            
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                document.body.className = theme;
                DOM.themeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                localStorage.setItem('radioTheme', theme);
            });
        });
    };

    // ======================
    //  INIZIALIZZAZIONE
    // ======================
    // Setup event handlers
    DOM.playPauseBtn.addEventListener('click', togglePlayback);
    DOM.audioPlayer.addEventListener('playing', () => {
        STATE.isPlaying = true;
        updatePlayButton();
    });
    DOM.audioPlayer.addEventListener('pause', () => {
        STATE.isPlaying = false;
        updatePlayButton();
    });

    // Avvio componenti
    initTheme();
    setInterval(fetchRadioData, 5000);
    fetchRadioData();
    updatePlayButton();
});