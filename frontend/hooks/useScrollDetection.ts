import { useState, useEffect } from 'react';
import { useScroll } from 'motion/react';

export const useScrollDetection = (threshold: number = 0.05) => {
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setScrolled(latest > threshold);
    });
    return () => unsubscribe();
  }, [scrollYProgress, threshold]);

  return scrolled;
};