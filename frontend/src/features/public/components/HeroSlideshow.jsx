import React, { useEffect, useState } from "react";
import { photos } from "../data.js";
import { Icon } from "./Common.jsx";
export default function HeroSlideshow({ children }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [hidden, setHidden] = useState(() => document.hidden);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => setReduced(media.matches);
    const visibility = () => setHidden(document.hidden);
    media.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      media.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    if (paused || reduced || hidden) return;
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % 3),
      4000,
    );
    return () => clearInterval(timer);
  }, [paused, reduced, hidden]);
  return (
    <section className="hero" aria-label="Welcome to HarborX">
      <div className="hero-images" aria-hidden="true">
        {photos.slice(0, 3).map((photo, i) => (
          <img
            key={photo.src}
            className={`hero-slide ${index === i ? "is-active" : ""}`}
            data-slide={i}
            src={photo.src}
            alt=""
            fetchPriority={i === 0 ? "high" : "auto"}
            style={{ objectPosition: photo.position }}
          />
        ))}
      </div>
      <div className="hero-shade" />
      <div className="hero-copy">{children}</div>
      <div className="hero-bottom">
        <span className="hero-location">
          <Icon name="MapPin" size={15} />
          {photos[index].location}
        </span>
        <span className="hero-scroll">
          A better way forward <span>↓</span>
        </span>
        <div className="slide-controls" aria-label="Slideshow controls">
          {photos.slice(0, 3).map((photo, i) => (
            <button
              key={photo.src}
              className={index === i ? "selected" : ""}
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={index === i}
              onClick={() => setIndex(i)}
            >
              <span />
            </button>
          ))}
          <button
            className="pause-slide"
            disabled={reduced}
            onClick={() => setPaused(!paused)}
            aria-label={
              reduced
                ? "Slideshow paused for reduced motion"
                : paused
                  ? "Play slideshow"
                  : "Pause slideshow"
            }
          >
            <Icon name={paused || reduced ? "Play" : "Pause"} size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}
