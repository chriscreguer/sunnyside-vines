document.addEventListener('DOMContentLoaded', () => {
    // Video cycling functionality
    const videos = [
        '../../img/roseto_family_vineyard_talking_video.mp4',
        '../../img/roseto_family_vineyard_wine_pour_video.mp4',
        '../../img/roseto_family_vineyard_family_dinner_video.mp4',
        '../../img/roseto_family_vineyard_family_video.mp4'
    ];
    
    let currentVideoIndex = 0;
    let videoElement = document.getElementById('background-video');
    
    function loadNextVideo() {
        currentVideoIndex = (currentVideoIndex + 1) % videos.length;
        console.log('Loading video:', currentVideoIndex, videos[currentVideoIndex]);
        
        // Simply change the source
        videoElement.src = videos[currentVideoIndex];
        videoElement.load();
        
        // Play the video
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error('Video play failed:', error);
            });
        }
    }
    
    // Set up initial video
    if (videoElement) {
        videoElement.src = videos[currentVideoIndex];
        videoElement.muted = true;
        videoElement.autoplay = true;
        videoElement.loop = false;
        
        // Add event listeners
        videoElement.addEventListener('ended', loadNextVideo);
        videoElement.addEventListener('loadeddata', () => {
            console.log('Video loaded:', currentVideoIndex);
        });
        videoElement.addEventListener('error', (e) => {
            console.error('Video error:', e, 'for video:', videos[currentVideoIndex]);
            // Try next video after a delay
            setTimeout(loadNextVideo, 1000);
        });
        
        // Try to start playing
        videoElement.load();
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Initial video started playing');
            }).catch(error => {
                console.error('Initial video play failed:', error);
                // Try to play on user interaction
                document.addEventListener('click', () => {
                    videoElement.play();
                }, { once: true });
            });
        }
    } else {
        console.error('Video element not found');
    }
    
    // Handle CTA button click
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            const contentSection = document.querySelector('.content-section');
            if (contentSection) {
                contentSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});