import React, { useEffect, useState } from "react";
import fishPhoto from "./beautiful-group-fish-undersea.jpg";
import fishPhotoTwo from "./fish_1_cropped.jpg";
import fishPhotoThree from "./fish_3_cropped.jpg";
import fishPhotoFour from "./fish_5_cropped.jpg";
import fishPhotoFive from "./fish_6_cropped.jpg";
import fishPhotoSix from "./fish_7_cropped.jpg";

const photos = [
  fishPhoto,
  fishPhotoTwo,
  fishPhotoThree,
  fishPhotoFour,
  fishPhotoFive,
  fishPhotoSix,
];

export default function LoginSlideshow() {
  const [frame, setFrame] = useState({ current: 0, previous: null });
  const [loaded, setLoaded] = useState([]);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    function updatePlayback() {
      setPlaying(!document.hidden && !motion.matches);
      if (motion.matches) setFrame({ current: 0, previous: null });
    }
    updatePlayback();
    document.addEventListener("visibilitychange", updatePlayback);
    motion.addEventListener("change", updatePlayback);
    return () => {
      document.removeEventListener("visibilitychange", updatePlayback);
      motion.removeEventListener("change", updatePlayback);
    };
  }, []);

  useEffect(() => {
    // Wait for every photograph before starting. A failed load leaves image 1
    // visible rather than advancing to an empty layer.
    if (loaded.length !== photos.length || !playing) return;
    const timer = window.setTimeout(
      () => {
        setFrame(({ current }) => ({
          current: (current + 1) % photos.length,
          previous: current,
        }));
      },
      4000,
    );
    // Start a 2s dissolve every 4s, leaving 2s between transitions.
    return () => window.clearTimeout(timer);
  }, [loaded.length, playing, frame.current, frame.previous]);

  return (
    <div className="auth-photo auth-slideshow">
      {photos.map((src, index) => (
        <img
          key={src}
          src={src}
          alt={
            index === 0 ? "A school of fish swimming in sunlit ocean water" : ""
          }
          aria-hidden={index !== 0 ? true : undefined}
          fetchPriority={index === 0 ? "high" : "low"}
          loading="eager"
          className={
            index === frame.current
              ? "is-current"
              : index === frame.previous
                ? "is-previous"
                : ""
          }
          onLoad={() =>
            setLoaded((images) =>
              images.includes(index) ? images : [...images, index],
            )
          }
        />
      ))}
    </div>
  );
}
