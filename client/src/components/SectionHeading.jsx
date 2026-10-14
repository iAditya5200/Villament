/**
 * SectionHeading.jsx
 * ------------------
 * A consistent heading block for page sections:
 *   small "eyebrow" label  →  large serif title  →  optional intro sentence
 */

export default function SectionHeading({ eyebrow, title, description, align = "left", tone = "dark", children }) {
  return (
    <div className={`section-heading section-heading--${align} section-heading--${tone}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="section-heading__title">{title}</h2>
      {description && <p className="section-heading__description">{description}</p>}
      {children}
    </div>
  );
}
