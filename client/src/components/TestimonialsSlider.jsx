/**
 * TestimonialsSlider.jsx
 * ----------------------
 * Shows one buyer quote at a time with previous / next buttons and dots.
 * Moves to the next quote automatically every 7 seconds, and pauses while the
 * visitor's mouse is over it.
 */

import { useEffect, useState } from "react";
import Icon from "./Icon.jsx";
import { TESTIMONIALS } from "../data/siteContent.js";

const AUTO_ADVANCE_DELAY_IN_MILLISECONDS = 7000;

export default function TestimonialsSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const totalTestimonials = TESTIMONIALS.length;

  /** Moves forwards (+1) or backwards (-1), wrapping around at the ends. */
  function moveBy(stepCount) {
    setActiveIndex((currentIndex) => (currentIndex + stepCount + totalTestimonials) % totalTestimonials);
  }

  useEffect(() => {
    if (isPaused) return undefined;
    const timerId = window.setInterval(() => moveBy(1), AUTO_ADVANCE_DELAY_IN_MILLISECONDS);
    return () => window.clearInterval(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused]);

  const activeTestimonial = TESTIMONIALS[activeIndex];

  return (
    <div className="testimonials" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <blockquote className="testimonials__quote" key={activeIndex}>
        <p>“{activeTestimonial.quote}”</p>
        <footer>
          <strong>{activeTestimonial.personName}</strong>
          <span>{activeTestimonial.personDetail}</span>
        </footer>
      </blockquote>

      <div className="testimonials__controls">
        <button type="button" className="icon-button" onClick={() => moveBy(-1)} aria-label="Previous testimonial">
          <Icon name="arrowLeft" />
        </button>
        <div className="testimonials__dots">
          {TESTIMONIALS.map((testimonial, index) => (
            <button
              type="button"
              key={testimonial.personDetail}
              className={`testimonials__dot ${index === activeIndex ? "testimonials__dot--active" : ""}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show testimonial ${index + 1}`}
            />
          ))}
        </div>
        <button type="button" className="icon-button" onClick={() => moveBy(1)} aria-label="Next testimonial">
          <Icon name="arrowRight" />
        </button>
      </div>
    </div>
  );
}
