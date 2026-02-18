import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useState } from 'react';

interface Story {
  id: string;
  name: string;
  location: string;
  scheme: string;
  quote: string;
  videoUrl: string;
}

// TODO: REPLACE WITH REAL FARMER TESTIMONIAL VIDEOS
// Instructions:
// 1. Record video testimonials from actual farmers who benefited from government schemes
// 2. Upload videos to YouTube (unlisted/public) or your own video hosting
// 3. For YouTube: Use format https://www.youtube.com/embed/VIDEO_ID?autoplay=1&mute=1&loop=1&playlist=VIDEO_ID&controls=0&modestbranding=1&rel=0
// 4. For direct video files: Use format /videos/farmer-name.mp4 and update the iframe to <video> tag
// 5. Replace the videoUrl below with actual video URLs

const stories: Story[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    location: 'Haryana',
    scheme: 'PM-KISAN',
    quote: 'I never knew I was eligible for PM-KISAN. Within 10 seconds, niti-setu told me everything I needed to know. Now I receive ₹6,000 every year.',
    videoUrl: 'REPLACE_WITH_RAJESH_KUMAR_VIDEO_URL', // TODO: Add real video URL
  },
  {
    id: '2',
    name: 'Lakshmi Devi',
    location: 'Maharashtra',
    scheme: 'PM-KUSUM',
    quote: 'Got a solar pump with 70% subsidy through PM-KUSUM. The voice-based system made it so easy - no complicated forms or visits to the office.',
    videoUrl: 'REPLACE_WITH_LAKSHMI_DEVI_VIDEO_URL', // TODO: Add real video URL
  },
  {
    id: '3',
    name: 'Suresh Patel',
    location: 'Gujarat',
    scheme: 'Agri Infrastructure',
    quote: 'This platform is a blessing for farmers. It shows exactly which page of the government document says I\'m eligible. Complete transparency!',
    videoUrl: 'REPLACE_WITH_SURESH_PATEL_VIDEO_URL', // TODO: Add real video URL
  },
  {
    id: '4',
    name: 'Ramesh Singh',
    location: 'Punjab',
    scheme: 'Crop Insurance',
    quote: 'Lost my crop to floods last year. Thanks to niti-setu, I found out about crop insurance scheme and got compensation within weeks.',
    videoUrl: 'REPLACE_WITH_RAMESH_SINGH_VIDEO_URL', // TODO: Add real video URL
  },
  {
    id: '5',
    name: 'Anita Sharma',
    location: 'Rajasthan',
    scheme: 'Soil Health Card',
    quote: 'The app told me about soil health card scheme in my language. Now I know exactly what nutrients my soil needs. My yield increased by 30%!',
    videoUrl: 'REPLACE_WITH_ANITA_SHARMA_VIDEO_URL', // TODO: Add real video URL
  },
  {
    id: '6',
    name: 'Vijay Reddy',
    location: 'Telangana',
    scheme: 'Drip Irrigation',
    quote: 'Saved 40% water with drip irrigation subsidy. The platform showed me step-by-step how to apply. Everything was so simple and clear.',
    videoUrl: 'REPLACE_WITH_VIJAY_REDDY_VIDEO_URL', // TODO: Add real video URL
  },
];

export function Stories() {
  const [currentPage, setCurrentPage] = useState(0);
  const storiesPerPage = 3;
  const totalPages = Math.ceil(stories.length / storiesPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const isAtStart = currentPage === 0;
  const isAtEnd = currentPage === totalPages - 1;

  const currentStories = stories.slice(
    currentPage * storiesPerPage,
    (currentPage + 1) * storiesPerPage
  );

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

        {/* Stories Grid with Navigation */}
        <div className="flex items-center justify-center gap-6">
          {/* Left Arrow */}
          <motion.button
            whileHover={{ scale: isAtStart ? 1 : 1.1 }}
            whileTap={{ scale: isAtStart ? 1 : 0.9 }}
            onClick={prevPage}
            disabled={isAtStart}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
              isAtStart
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>

          {/* Stories Grid */}
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-3 gap-6 flex-1 max-w-6xl"
          >
            {currentStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </motion.div>

          {/* Right Arrow */}
          <motion.button
            whileHover={{ scale: isAtEnd ? 1 : 1.1 }}
            whileTap={{ scale: isAtEnd ? 1 : 0.9 }}
            onClick={nextPage}
            disabled={isAtEnd}
            className={`w-10 h-10 rounded-full text-white flex items-center justify-center transition-colors flex-shrink-0 ${
              isAtEnd
                ? 'bg-orange-300 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>
      </div>
    </section>
  );
}

function StoryCard({ story }: { story: Story }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -12, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      {/* Hover glow effect */}
      <motion.div
        className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 via-saffron/20 to-green/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />

      <div className="relative bg-white dark:bg-dark-muted rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 border border-transparent group-hover:border-orange-500/30 dark:group-hover:border-orange-400/30">
        {/* Video Embed - Autoplay, No Controls */}
        <div className="relative aspect-video overflow-hidden bg-black">
          <iframe
            src={story.videoUrl}
            title={`${story.name} testimonial - ${story.scheme}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ border: 'none' }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Quote Icon */}
          <motion.div
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.4 }}
          >
            <Quote className="w-8 h-8 text-orange-500 dark:text-orange-400 mb-3" />
          </motion.div>

          {/* Quote */}
          <p className="text-base text-light-muted-foreground dark:text-dark-muted-foreground group-hover:text-light-foreground dark:group-hover:text-dark-foreground mb-4 line-clamp-4 italic transition-colors duration-300">
            "{story.quote}"
          </p>

          {/* Author Info */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="font-bold text-base text-light-foreground dark:text-dark-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
              {story.name}
            </h4>
            <p className="text-base text-light-muted-foreground dark:text-dark-muted-foreground">
              {story.location}
            </p>
            <div className="mt-3 inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-sm font-bold rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors duration-300">
              {story.scheme}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
