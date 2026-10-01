import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function TopLoadingBar() {
  const [location] = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // When location changes, trigger YouTube-style loading bar
    setVisible(true);
    setProgress(25);

    const t1 = setTimeout(() => {
      setProgress(75);
    }, 100);

    const t2 = setTimeout(() => {
      setProgress(100);
    }, 280);

    const t3 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 450);

    // Scroll smoothly to top on page change
    window.scrollTo({ top: 0, behavior: "instant" });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [location]);

  if (!visible && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px] pointer-events-none overflow-hidden bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-sky-500 via-sky-400 to-indigo-400 transition-all duration-200 ease-out shadow-[0_0_12px_rgba(14,165,233,0.85)] relative"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
          transitionProperty: "width, opacity",
        }}
      >
        {/* Glowing dot at the leading tip like YouTube */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-transparent to-white/80 shadow-[0_0_10px_#38bdf8]" />
      </div>
    </div>
  );
}
