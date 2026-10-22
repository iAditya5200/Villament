/**
 * siteContent.js
 * --------------
 * Text content that does not change often (company details, the "why us"
 * pillars, FAQs, testimonials). Keeping it here means non-developers can
 * edit the wording without touching the page layouts.
 *
 * IMPORTANT: the phone number, email, address and testimonials below are
 * PLACEHOLDERS. Replace them with Villament's real details and real buyer
 * quotes (with the buyers' permission) before the website goes live.
 */

export const COMPANY_DETAILS = {
  phoneDisplay: "+91 93543 04142",
  phoneLink: "+91 93543 04142", // used in "tel:" links – digits only
  whatsappNumber: "919354304142", // used in WhatsApp links – country code + number, no "+"
  email: "info@villament.co.in",
  address: "4th Floor, Palm Court, Sector 17, Vashi, Navi Mumbai 400703",
  officeHours: "24*7",
  // Used for the map on the Contact page
  officeLatitude: 19.0771,
  officeLongitude: 72.9986,
};

/** Big numbers shown in the band under the hero. */
export const COMPANY_STATS = [
  { value: "9", label: "Communities planned" },
  { value: "480+", label: "Families who call them home" },
  { value: "110", label: "Acres of open green" },
  { value: "0", label: "Projects delivered late" },
];

/** The four promises in the "The Villament way" section. */
export const BRAND_PILLARS = [
  {
    iconName: "leaf",
    title: "Land first, buildings second",
    description:
      "We study the slope, the trees and the monsoon before drawing a single wall. Most of every site stays open and green.",
  },
  {
    iconName: "shield",
    title: "Clear titles, open books",
    description:
      "Every project is RERA-registered with documents you can read before you pay. One price sheet, no hidden charges.",
  },
  {
    iconName: "key",
    title: "One relationship manager",
    description:
      "From the first site visit to the day you get the keys, the same person answers your calls.",
  },
  {
    iconName: "layers",
    title: "Built to be handed down",
    description:
      "Stone, lime and hardwood that age well, and layouts that adapt as families grow — homes meant for the next generation too.",
  },
];

/** Steps of the buying journey on the About page. */
export const BUYING_JOURNEY = [
  { title: "Talk to us", description: "Tell us what you are looking for. We'll suggest communities that fit — and say so if none do." },
  { title: "Walk the land", description: "Visit with your family. We arrange the drive, lunch and time with our architects." },
  { title: "Read everything", description: "Take home the title documents, approvals and agreement draft. Ask your lawyer anything." },
  { title: "Make it yours", description: "Reserve your home, choose finishes, and follow construction with monthly photo updates." },
];

/**
 * PLACEHOLDER testimonials – replace with real buyer quotes before launch.
 */
export const TESTIMONIALS = [
  {
    quote:
      "We wanted somewhere our children would actually want to come back to. The courtyard is where everyone ends up, every single weekend.",
    personName: "Buyer name",
    personDetail: "Homeowner, Aranya Courtyard Villas",
  },
  {
    quote:
      "Our relationship manager explained every document line by line. For a first purchase, that patience mattered more than anything.",
    personName: "Buyer name",
    personDetail: "Plot owner, Sahyadri Meadows",
  },
  {
    quote:
      "The site visit felt like a day out, not a sales pitch. We booked a week later after reading every paper at home.",
    personName: "Buyer name",
    personDetail: "Farmhouse owner, Banyan Estate",
  },
];

/** Frequently asked questions on the home page. */
export const FREQUENTLY_ASKED_QUESTIONS = [
  {
    question: "Are all Villament projects RERA registered?",
    answer:
      "Yes. Every project that is open for sale carries a MahaRERA registration number, shown on its page. Projects marked \"Coming Soon\" are listed so you can register interest; bookings open only after registration.",
  },
  {
    question: "Can I get a home loan for a villa plot?",
    answer:
      "Our plotted developments are approved by leading banks for plot-plus-construction loans. Our team can introduce you to partner lenders and help with the paperwork.",
  },
  {
    question: "How do site visits work?",
    answer:
      "Pick a date with the \"Book a Visit\" button. We confirm by phone, arrange pick-up from Mumbai or Pune if you like, and spend as long as you need on site.",
  },
  {
    question: "Who looks after the community after handover?",
    answer:
      "Villament's estate team manages maintenance, security and landscaping for the first two years, after which the residents' association can continue with us or appoint their own team.",
  },
];
