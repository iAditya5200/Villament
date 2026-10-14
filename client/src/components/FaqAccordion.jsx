/**
 * FaqAccordion.jsx
 * ----------------
 * A list of questions; clicking one reveals its answer.
 * Only one answer is open at a time.
 */

import { useState } from "react";
import Icon from "./Icon.jsx";

export default function FaqAccordion({ questions }) {
  const [openQuestionIndex, setOpenQuestionIndex] = useState(0);

  return (
    <div className="faq">
      {questions.map((faqItem, index) => {
        const isOpen = openQuestionIndex === index;
        const answerElementId = `faq-answer-${index}`;

        return (
          <div className={`faq__item ${isOpen ? "faq__item--open" : ""}`} key={faqItem.question}>
            <button
              type="button"
              className="faq__question"
              aria-expanded={isOpen}
              aria-controls={answerElementId}
              onClick={() => setOpenQuestionIndex(isOpen ? -1 : index)}
            >
              <span>{faqItem.question}</span>
              <Icon name="chevronDown" size={20} />
            </button>
            <div className="faq__answer" id={answerElementId} hidden={!isOpen}>
              <p>{faqItem.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
