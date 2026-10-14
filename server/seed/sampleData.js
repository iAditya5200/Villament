/**
 * sampleData.js
 * -------------
 * Demo content used by seedDatabase.js. Replace these with your real projects
 * from the admin panel once the site is live.
 *
 * Images are free photos from Unsplash (https://unsplash.com/license).
 */

/** Builds an Unsplash image address at a sensible size for the website. */
function unsplashImage(photoId) {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1600&q=80`;
}

export const sampleProperties = [
  {
    title: "Aranya Courtyard Villas",
    tagline: "Courtyard homes wrapped in a private forest",
    description:
      "Aranya is a gated community of 42 courtyard villas set within twelve acres of protected woodland near Lonavala. " +
      "Every home is planned around an open-to-sky courtyard, so light, breeze and the sound of rain move through the house. " +
      "Double-height living rooms, stone-clad facades and private gardens make each villa feel like a retreat, " +
      "while a clubhouse, organic farm and walking trails keep the community connected.",
    location: { locality: "Tungarli", city: "Lonavala", state: "Maharashtra", latitude: 18.7546, longitude: 73.4062 },
    propertyType: "Villa",
    status: "Now Selling",
    startingPrice: 28500000,
    configuration: "3 & 4 BHK Courtyard Villas",
    sizeRange: "2,850 – 4,200 sq.ft",
    totalUnits: 42,
    landArea: "12 Acres",
    possession: "March 2028",
    reraNumber: "P52100054321",
    amenities: ["Clubhouse", "Infinity pool", "Organic farm", "Forest trail", "Yoga deck", "24×7 security", "EV charging"],
    highlights: ["Private courtyard in every villa", "70% open green area", "90 minutes from Mumbai"],
    images: [
      unsplashImage("photo-1613490493576-7fde63acd811"),
      unsplashImage("photo-1600607687939-ce8a6c25118c"),
      unsplashImage("photo-1600566753190-17f0baa2a6c3"),
    ],
    isFeatured: true,
  },
  {
    title: "Sahyadri Meadows",
    tagline: "Clear-title villa plots at the foot of the Sahyadris",
    description:
      "Sahyadri Meadows offers RERA-registered villa plots with mountain views on three sides. " +
      "Build your own home at your own pace — the roads, underground utilities, landscaping and clubhouse are delivered by Villament, " +
      "and our in-house architects can help you design a home that suits the plot and the climate.",
    location: { locality: "Kondivade", city: "Karjat", state: "Maharashtra", latitude: 18.9107, longitude: 73.3235 },
    propertyType: "Villa Plot",
    status: "Now Selling",
    startingPrice: 6800000,
    configuration: "Villa Plots",
    sizeRange: "2,500 – 6,000 sq.ft plots",
    totalUnits: 118,
    landArea: "24 Acres",
    possession: "Ready to build",
    reraNumber: "P52000067890",
    amenities: ["Clubhouse", "Children's play area", "Amphitheatre", "Cycling track", "Gated entry", "Underground cabling"],
    highlights: ["Clear title, bank approved", "Design support from in-house architects", "River 2 km away"],
    images: [
      unsplashImage("photo-1500382017468-9049fed747ef"),
      unsplashImage("photo-1449844908441-8829872d2607"),
    ],
    isFeatured: true,
  },
  {
    title: "Tamarind Row",
    tagline: "Coastal townhouses, a short walk from the beach",
    description:
      "A row of 28 three-storey townhouses shaded by old tamarind trees, ten minutes from Alibaug's beaches. " +
      "Each home has its own terrace garden, a ground-floor studio that can become a guest room or home office, and shared access to a lap pool.",
    location: { locality: "Varsoli", city: "Alibaug", state: "Maharashtra", latitude: 18.6414, longitude: 72.8722 },
    propertyType: "Townhouse",
    status: "Coming Soon",
    startingPrice: 19000000,
    configuration: "3 BHK Townhouses",
    sizeRange: "2,100 – 2,450 sq.ft",
    totalUnits: 28,
    landArea: "4.5 Acres",
    possession: "To be announced",
    reraNumber: "",
    amenities: ["Lap pool", "Terrace gardens", "Bicycle shed", "Community kitchen"],
    highlights: ["Ferry + road access from Mumbai", "Only 28 homes", "Register now for launch pricing"],
    images: [
      unsplashImage("photo-1600585154340-be6161a56a0c"),
      unsplashImage("photo-1502005229762-cf1b2da7c5d6"),
    ],
    isFeatured: true,
  },
  {
    title: "Banyan Estate",
    tagline: "Half-acre farmhouses for weekends that last",
    description:
      "Banyan Estate is a collection of managed farmhouses on half-acre and one-acre parcels near Panvel. " +
      "Villament's estate team looks after farming, gardening and maintenance, so your weekend home is ready whenever you arrive.",
    location: { locality: "Nere", city: "Panvel", state: "Maharashtra", latitude: 18.9894, longitude: 73.1175 },
    propertyType: "Farmhouse",
    status: "Now Selling",
    startingPrice: 34000000,
    configuration: "4 BHK Farmhouses",
    sizeRange: "0.5 – 1 Acre parcels",
    totalUnits: 20,
    landArea: "18 Acres",
    possession: "December 2027",
    reraNumber: "P52000011223",
    amenities: ["Managed farming", "Private pool", "Orchard", "Caretaker quarters", "Estate management"],
    highlights: ["Near the new Navi Mumbai airport", "Fully managed estate", "Mature fruit trees on every parcel"],
    images: [
      unsplashImage("photo-1512917774080-9991f1c4c750"),
      unsplashImage("photo-1564013799919-ab600027ffc6"),
    ],
    isFeatured: false,
  },
  {
    title: "The Laterite House",
    tagline: "Our first community — now home to 36 families",
    description:
      "Built with locally quarried laterite stone and lime plaster, The Laterite House was Villament's first project. " +
      "All homes are sold, and the community now runs its own residents' association, weekend market and library.",
    location: { locality: "Gangapur Road", city: "Nashik", state: "Maharashtra", latitude: 20.0112, longitude: 73.7462 },
    propertyType: "Villa",
    status: "Sold Out",
    startingPrice: 15500000,
    configuration: "3 BHK Villas",
    sizeRange: "2,200 – 2,600 sq.ft",
    totalUnits: 36,
    landArea: "6 Acres",
    possession: "Delivered 2024",
    reraNumber: "P51600009876",
    amenities: ["Library", "Residents' club", "Vineyard walk", "Solar power"],
    highlights: ["Delivered on schedule", "IGBC Gold rated", "100% sold"],
    images: [
      unsplashImage("photo-1580587771525-78b9dba3b914"),
      unsplashImage("photo-1600047509807-ba8f99d2cdde"),
    ],
    isFeatured: false,
  },
  {
    title: "Monsoon Grove",
    tagline: "Hillside villa plots overlooking a valley",
    description:
      "Monsoon Grove is a terraced hillside layout of villa plots near Khopoli, planned so every plot has an unblocked valley view. " +
      "Register your interest to receive the layout plan and launch pricing before public release.",
    location: { locality: "Tambati", city: "Khopoli", state: "Maharashtra", latitude: 18.7856, longitude: 73.3459 },
    propertyType: "Villa Plot",
    status: "Coming Soon",
    startingPrice: 0, // price on request
    configuration: "Villa Plots",
    sizeRange: "3,000 – 8,000 sq.ft plots",
    totalUnits: 64,
    landArea: "16 Acres",
    possession: "To be announced",
    reraNumber: "",
    amenities: ["Viewing deck", "Clubhouse", "Nature trail", "Gated entry"],
    highlights: ["Every plot faces the valley", "Close to Mumbai–Pune Expressway", "Early-bird pricing"],
    images: [
      unsplashImage("photo-1416331108676-a22ccb276e35"),
      unsplashImage("photo-1505843513577-22bb7d21e455"),
    ],
    isFeatured: false,
  },
];

/**
 * Creates demo leads linked to the properties that were just saved.
 * Some are already contacted, some are new, so the lead tracker has variety.
 *
 * @param {Array} savedProperties - Property documents returned by MongoDB.
 */
export function buildSampleEnquiries(savedProperties) {
  const daysAgo = (numberOfDays) => new Date(Date.now() - numberOfDays * 24 * 60 * 60 * 1000);
  const daysFromNow = (numberOfDays) => new Date(Date.now() + numberOfDays * 24 * 60 * 60 * 1000);
  const [aranya, sahyadri, tamarind, banyan] = savedProperties;

  return [
    {
      fullName: "Riya Mehta",
      email: "riya.mehta@example.com",
      phone: "+91 98200 11223",
      message: "We are looking for a 4 BHK for our parents. Can we visit this Saturday?",
      enquiryType: "Site Visit",
      property: aranya._id,
      propertyTitle: aranya.title,
      preferredVisitDate: daysFromNow(3),
      leadStatus: "New",
      isContacted: false,
      createdAt: daysAgo(0),
      activityLog: [{ activityType: "created", message: "Site Visit enquiry received from the website." }],
    },
    {
      fullName: "Arjun Nair",
      email: "arjun.nair@example.com",
      phone: "+91 99870 44556",
      message: "Please share the plot layout and payment plan.",
      enquiryType: "Brochure Request",
      property: sahyadri._id,
      propertyTitle: sahyadri.title,
      leadStatus: "Contacted",
      isContacted: true,
      contactedAt: daysAgo(1),
      nextFollowUpDate: daysAgo(0),
      createdAt: daysAgo(2),
      activityLog: [
        { activityType: "created", message: "Brochure Request enquiry received from the website." },
        { activityType: "status_change", message: 'Status changed from "New" to "Contacted".', performedBy: "Villament Admin" },
        { activityType: "note", message: "Sent brochure on WhatsApp. Interested in 4,000 sq.ft plots.", performedBy: "Villament Admin" },
      ],
    },
    {
      fullName: "Sneha & Karan Kulkarni",
      email: "kulkarni.family@example.com",
      phone: "+91 90040 77889",
      message: "Please notify us when bookings open.",
      enquiryType: "Register Interest",
      property: tamarind._id,
      propertyTitle: tamarind.title,
      leadStatus: "New",
      isContacted: false,
      createdAt: daysAgo(1),
      activityLog: [{ activityType: "created", message: "Register Interest enquiry received from the website." }],
    },
    {
      fullName: "Vikram Shah",
      email: "vikram.shah@example.com",
      phone: "+91 98111 22334",
      message: "Visited last week. Ready to discuss the booking amount.",
      enquiryType: "Site Visit",
      property: banyan._id,
      propertyTitle: banyan.title,
      leadStatus: "Site Visit Scheduled",
      isContacted: true,
      contactedAt: daysAgo(5),
      nextFollowUpDate: daysFromNow(2),
      createdAt: daysAgo(8),
      activityLog: [
        { activityType: "created", message: "Site Visit enquiry received from the website." },
        { activityType: "status_change", message: 'Status changed from "New" to "Site Visit Scheduled".', performedBy: "Villament Admin" },
      ],
    },
    {
      fullName: "Fatima Sheikh",
      email: "fatima.sheikh@example.com",
      phone: "+91 97690 55667",
      message: "Booked villa A-12. Thank you to the team!",
      enquiryType: "General",
      property: aranya._id,
      propertyTitle: aranya.title,
      leadStatus: "Converted",
      isContacted: true,
      contactedAt: daysAgo(20),
      createdAt: daysAgo(25),
      activityLog: [
        { activityType: "created", message: "General enquiry received from the website." },
        { activityType: "status_change", message: 'Status changed from "New" to "Converted".', performedBy: "Villament Admin" },
      ],
    },
    {
      fullName: "Rahul Desai",
      email: "rahul.desai@example.com",
      phone: "+91 93222 88990",
      message: "Do you have anything near Pune?",
      enquiryType: "General",
      leadStatus: "New",
      isContacted: false,
      createdAt: daysAgo(3),
      activityLog: [{ activityType: "created", message: "General enquiry received from the website." }],
    },
  ];
}
