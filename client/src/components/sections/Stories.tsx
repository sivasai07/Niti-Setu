import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronRight, ChevronLeft, X, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Story {
  _id?: string;
  id?: string;
  farmerName: string;
  name?: string;
  location: string;
  scheme: string;
  story: string;
  quote?: string;
  imageUrl?: string;
  videoUrl?: string;
  isActive?: boolean;
}

// Hardcoded stories - will display immediately
const hardcodedStories: Story[] = [
  {
    id: '1',
    farmerName: 'Rajesh Kumar',
    location: 'Haryana',
    scheme: 'PM-KISAN',
    story: 'I never knew I was eligible for PM-KISAN. Within 10 seconds, niti-setu told me everything I needed to know. Now I receive ₹6,000 every year.',
    videoUrl: 'http://localhost:5000/uploads/stories/rajesh-kumar.mp4',
  },
  {
    id: '2',
    farmerName: 'Lakshmi Devi',
    location: 'Maharashtra',
    scheme: 'PM-KUSUM',
    story: 'Got a solar pump with 70% subsidy through PM-KUSUM. The voice-based system made it so easy - no complicated forms or visits to the office.',
    videoUrl: 'http://localhost:5000/uploads/stories/lakshmi-devi.mp4',
  },
  {
    id: '3',
    farmerName: 'Suresh Patel',
    location: 'Gujarat',
    scheme: 'Agri Infrastructure',
    story: 'This platform is a blessing for farmers. It shows exactly which page of the government document says I\'m eligible. Complete transparency!',
    videoUrl: 'http://localhost:5000/uploads/stories/suresh-patel.mp4',
  },
  {
    id: '4',
    farmerName: 'Ramesh Singh',
    location: 'Punjab',
    scheme: 'Crop Insurance',
    story: 'Lost my crop to floods last year. Thanks to niti-setu, I found out about crop insurance scheme and got compensation within weeks.',
    videoUrl: 'http://localhost:5000/uploads/stories/ramesh-singh.mp4',
  },
  {
    id: '5',
    farmerName: 'Anita Sharma',
    location: 'Rajasthan',
    scheme: 'Soil Health Card',
    story: 'The app told me about soil health card scheme in my language. Now I know exactly what nutrients my soil needs. My yield increased by 30%!',
    videoUrl: 'http://localhost:5000/uploads/stories/anita-sharma.mp4',
  },
  {
    id: '6',
    farmerName: 'Vijay Reddy',
    location: 'Telangana',
    scheme: 'Drip Irrigation',
    story: 'Saved 40% water with drip irrigation subsidy. The platform showed me step-by-step how to apply. Everything was so simple and clear.',
    videoUrl: 'http://localhost:5000/uploads/stories/vijay-reddy.mp4',
  },
];

export function Stories() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [stories, setStories] = useState<Story[]>(hardcodedStories);

  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    
    // Show left arrow if not at the start
    setShowLeftArrow(scrollLeft > 10);
    
    // Show right arrow if not at the end
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // Check initial position
    checkScrollPosition();

    // Add scroll listener
    scrollContainer.addEventListener('scroll', checkScrollPosition);
    
    // Check on resize
    window.addEventListener('resize', checkScrollPosition);

    return () => {
      scrollContainer.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, []);

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 380, behavior: 'smooth' });
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -380, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="stories"
      className="relative py-12 lg:py-16 bg-light-background dark:bg-dark-background overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-48 w-96 h-96 bg-saffron/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-48 w-96 h-96 bg-green/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 mb-4 text-sm font-semibold text-green bg-green/10 rounded-full"
          >
            Success Stories
          </motion.span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
            Stories from Our <span className="gradient-text">Farmers</span>
          </h2>
          <p className="text-lg text-light-muted-foreground dark:text-dark-muted-foreground max-w-2xl mx-auto">
            Real people, real impact
          </p>
        </motion.div>

        {/* Loading State */}
        {stories.length === 0 ? (
          <div className="text-center py-12">
            <Quote className="w-16 h-16 mx-auto mb-4 text-light-muted-foreground dark:text-dark-muted-foreground opacity-50" />
            <p className="text-light-muted-foreground dark:text-dark-muted-foreground">No stories available yet</p>
          </div>
        ) : (
          <>
            {/* Stories with Scroll Buttons */}
            <div className="relative">
              <div 
                ref={scrollContainerRef}
                className="overflow-x-auto scrollbar-hide pb-4"
                style={{ scrollBehavior: 'smooth' }}
              >
                <div className="flex gap-6 px-4">
                  {stories.map((story, index) => (
                    <motion.div
                      key={story.id || story._id}
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="w-[350px] flex-shrink-0"
                    >
                      <StoryCard story={story} onClick={() => setSelectedStory(story)} />
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Scroll Left Button - Only show if not at start */}
              {showLeftArrow && (
                <button
                  onClick={scrollLeft}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 z-10"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Scroll Right Button - Only show if not at end */}
              {showRightArrow && (
                <button
                  onClick={scrollRight}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 z-10"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Video Popup Modal */}
      <AnimatePresence>
        {selectedStory && (
          <VideoModal story={selectedStory} onClose={() => setSelectedStory(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}

function StoryCard({ story, onClick }: { story: Story; onClick: () => void }) {
  const [videoError, setVideoError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.play().catch(err => console.error('Error playing video:', err));
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Construct video URL from story data
  const videoUrl = story.videoUrl || `/uploads/stories/${story.farmerName.toLowerCase().replace(/\s+/g, '-')}.mp4`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -12, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group relative cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Hover glow effect */}
      <motion.div
        className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 via-saffron/20 to-green/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />

      <div className="relative bg-white dark:bg-dark-muted rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 border border-transparent group-hover:border-orange-500/30 dark:group-hover:border-orange-400/30">
        {/* Video Player */}
        <div className="relative aspect-video overflow-hidden bg-black">
          {videoError ? (
            <div className="w-full h-full flex items-center justify-center text-white text-sm p-4 text-center bg-gradient-to-br from-gray-700 to-gray-900">
              {story.imageUrl ? (
                <img src={story.imageUrl} alt={story.farmerName} className="w-full h-full object-cover" />
              ) : (
                'Video unavailable'
              )}
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-cover"
                muted={isMuted}
                loop
                playsInline
                preload="metadata"
                onError={() => setVideoError(true)}
              />
              {/* Unmute Button on Hover */}
              {isHovered && !isMuted && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={toggleMute}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 z-10"
                  title="Mute"
                >
                  <Volume2 className="w-5 h-5 text-white" />
                </motion.button>
              )}
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Quote className="w-8 h-8 text-orange-500 dark:text-orange-400 mb-3" />
          </motion.div>
          <p className="text-base text-light-muted-foreground dark:text-dark-muted-foreground group-hover:text-light-foreground dark:group-hover:text-dark-foreground mb-4 line-clamp-4 italic transition-colors duration-300">
            "{story.story}"
          </p>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="font-bold text-base text-light-foreground dark:text-dark-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
              {story.farmerName}
            </h4>
            <p className="text-base text-light-muted-foreground dark:text-dark-muted-foreground">
              {story.location}
            </p>
            <div className="mt-3 inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-sm font-bold rounded-full">
              {story.scheme}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function VideoModal({ story, onClose }: { story: Story; onClose: () => void }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Listen for fullscreen changes
  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  useState(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  });

  // Construct video URL from story data
  const videoUrl = story.videoUrl || `/uploads/stories/${story.farmerName.toLowerCase().replace(/\s+/g, '-')}.mp4`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        ref={containerRef}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center transition-all z-20"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Video */}
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full aspect-video"
          autoPlay
          loop
          playsInline
          controls={false}
        />

        {/* Video Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
          {/* Story Info */}
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
            <h3 className="text-white font-bold">{story.farmerName}</h3>
            <p className="text-white/80 text-sm">{story.location} • {story.scheme}</p>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2">
            {/* Mute/Unmute */}
            <button
              onClick={toggleMute}
              className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 text-white" />
              ) : (
                <Maximize className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
