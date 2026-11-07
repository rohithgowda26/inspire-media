/**
 * Single source of truth for Inspire Media's details and website copy.
 * Every claim comes from IM.pdf; the wording is written in a short, punchy
 * manifesto voice. Edit copy here, not inside components.
 */

export const site = {
  name: "Inspire Media",
  /** Set NEXT_PUBLIC_SITE_URL to the live domain before deploying (used for SEO + share images). */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  tagline: "We don't just market your brand. We grow it.",
  description:
    "Inspire Media is a performance marketing agency built exclusively for Brands and D2C businesses — SEO, performance ads and creative content strategy working as one growth engine.",
  services: ["SEO", "Performance Ads", "Creative Strategies"],

  contact: {
    phones: [
      { display: "+91 79962 98443", tel: "+917996298443" },
      { display: "+91 81978 70825", tel: "+918197870825" },
    ],
    /** Number used by the floating Call / WhatsApp buttons and the popup. */
    primaryPhone: {
      display: "+91 79962 98443",
      tel: "+917996298443",
      whatsapp: "917996298443",
    },
    email: "inspiremediabusinesses@gmail.com",
    address: {
      line1: "126, Revenue Colony, Raj Nagar",
      city: "Hubli",
      postalCode: "580032",
      region: "Karnataka",
      country: "IN",
    },
    instagram: {
      handle: "@inspire.media.in",
      url: "https://www.instagram.com/inspire.media.in/",
    },
  },

  nav: [
    { label: "Services", href: "#services" },
    { label: "Work", href: "#work" },
    { label: "About", href: "#about" },
    { label: "Process", href: "#process" },
    { label: "Contact", href: "#contact" },
  ],

  /** Proof points exactly as stated in IM.pdf (page 1). */
  stats: [
    { value: "90", unit: "Days", label: "To see results" },
    { value: "3", unit: "x", label: "Average ROAS growth" },
    { value: "30", unit: "+", label: "Brands scaled" },
  ],
} as const;

/** Homepage copy (v4 layout). Every claim is from IM.pdf. */
export const home = {
  hero: {
    title: "We grow brands",
    body: "We don’t just market your brand — we grow it. SEO, performance ads and creative strategy for Brands & D2C businesses.",
    trusted: "Trusted by 30+ growing brands",
  },
  statement: ["Every rupee [tracked],", "optimised and [accountable]."],
  bento: {
    content: {
      title: "Creative content strategy",
      body: "Strategies rooted in data, designed to connect emotionally — content that builds brand and drives sales.",
    },
    ads: {
      title: "Performance ads",
      body: "High-converting campaigns across Meta, Google and beyond, tailored to your goals.",
    },
    roas: {
      title: "3x average ROAS growth",
      body: "We test creatives, audiences and funnels to bring acquisition cost down while scaling returns.",
    },
    seo: {
      title: "Search engine optimisation",
      body: "Long-term organic visibility, tied to revenue — not just rankings. Traffic that compounds over time.",
    },
  },
  clients: {
    title: "Brands we’ve [worked with]",
    body: "Real estate, hospitality, sports, food and the public sector — the brands that trusted us with their growth.",
    footTitle: "30+ brands scaled with one growth partner",
    footBody:
      "Every engagement starts with an audit of your marketing, competitors and opportunities — and is measured by results.",
  },
  about: {
    title: "Built for brands, [see for yourself]",
    body: "is a performance marketing agency built exclusively for Brands and D2C businesses. We operate as your growth partner — deeply invested in your numbers, your category and your customers.",
    stats: [
      {
        value: 90,
        unit: " Days",
        label: "to see results",
        body: "A commitment to measurable improvement within 90 days, with transparent, data-driven reporting.",
      },
      {
        value: 3,
        unit: "x",
        label: "average ROAS growth",
        body: "Every rupee you spend is tracked, optimised and accountable.",
      },
      {
        value: 30,
        unit: "+",
        label: "brands scaled",
        body: "Real estate, hospitality, sports, food and the public sector — growth partner, not vendor.",
      },
    ],
  },
  start: {
    title: "Ready to [grow] your brand?",
    body: "Book a 20-minute strategy call and see how SEO, ads and content can work together for your numbers.",
  },
  partner: {
    title: "Your growth partner, from [audit to scale]",
    body: "SEO, advertising and content integrated to drive profitable scaling — never in silos.",
  },
  contact: {
    title: "Book your [strategy call]",
    body: "Tell us about your brand. We’ll review your details and come back to schedule a focused 20-minute call.",
  },
};

/** IM.pdf page 2 — "What We Do". */
export const services = [
  {
    id: "seo",
    formValue: "SEO",
    num: "01",
    title: "SEO",
    subtitle: "Search Engine Optimisation",
    punch: "Show up when they search.",
    body: "We build long-term organic visibility so your brand shows up when your customers are actively searching. From keyword strategy and technical SEO to content architecture and link building — everything is tied to revenue, not just rankings. The result is sustainable traffic that compounds over time.",
    tags: [
      "Keyword strategy",
      "Technical SEO",
      "Content architecture",
      "Link building",
    ],
  },
  {
    id: "paid-ads",
    formValue: "Paid Ads",
    num: "02",
    title: "Paid Ads",
    subtitle: "Performance Advertising",
    punch: "Every rupee accountable.",
    body: "We manage high-converting ad campaigns across Meta, Google and beyond — tailored to your audience and business goals. Every rupee you spend is tracked, optimised and accountable. We continuously test creatives, audiences and funnels to bring your cost per acquisition down while scaling returns.",
    tags: ["Meta Ads", "Google Ads", "Creative testing", "Funnel optimisation"],
  },
  {
    id: "content",
    formValue: "Creative Content",
    num: "03",
    title: "Content",
    subtitle: "Creative Content Strategy",
    punch: "Content that sells.",
    body: "Great ads and SEO need great content behind them. Our team builds strategies rooted in data but designed to connect emotionally with your audience — from ad creatives and landing pages to social content and brand storytelling. Content that builds brand and drives sales.",
    tags: [
      "Ad creatives",
      "Landing pages",
      "Social content",
      "Brand storytelling",
    ],
  },
] as const;

export const clients = [
  {
    name: "Ganesh Promoters & Developers",
    logo: "/clients/ganesh-promoters.png",
    w: 359,
    h: 360,
  },
  {
    name: "Hubli-Dharwad Municipal Corporation",
    logo: "/clients/hubli-dharwad-municipal-corporation.png",
    w: 358,
    h: 358,
  },
  {
    name: "Kreedangana Sports Management",
    logo: "/clients/kreedangana-sports.png",
    w: 321,
    h: 303,
  },
  {
    name: "SVT Gold Cooking Oil",
    logo: "/clients/svt-gold.png",
    w: 360,
    h: 235,
  },
  {
    name: "SLS Cricket Academy",
    logo: "/clients/sls-cricket-academy.png",
    w: 360,
    h: 185,
  },
  {
    name: "Cotton County Club",
    logo: "/clients/cotton-county-club.png",
    w: 360,
    h: 359,
  },
  {
    name: "Sri Srinivasa Garden",
    logo: "/clients/sri-srinivasa-garden.png",
    w: 360,
    h: 174,
  },
  {
    name: "Hubli Shamiyana Suppliers",
    logo: "/clients/hubli-shamiyana.png",
    w: 360,
    h: 121,
  },
  { name: "Hotel Naveen", logo: "/clients/hotel-naveen.png", w: 360, h: 141 },
  {
    name: "Arasi Swasthya Organic",
    logo: "/clients/arasi-swasthya.png",
    w: 350,
    h: 351,
  },
  {
    name: "Raitha Spandana",
    logo: "/clients/raitha-spandana.png",
    w: 352,
    h: 360,
  },
  {
    name: "Parge Constructions",
    logo: "/clients/parge-constructions.png",
    w: 360,
    h: 140,
  },
] as const;

/**
 * "We grow brands through …" section (below the hero).
 * profiles: one card per client Instagram profile.
 *   handle — the client's Instagram username, without @ (e.g. "hotelnaveen")
 *   image  — a screenshot of their Instagram profile page saved in public/instagram/ (e.g. "/instagram/hotel-naveen.jpg")
 * Until `image` is set, the card shows an Instagram-style profile built from the client's logo,
 * category and brand colours (`colors`: [accent, dark]). No follower numbers are shown — none are invented.
 */
export const growthIntro = {
  eyebrow: "Performance marketing agency · Hubli, Karnataka",
  titleStart: "We grow brands through",
  words: ["Strategy.", "Performance Ads.", "SEO.", "Creative Content."],
  body: "Inspire Media is a performance marketing agency built exclusively for Brands and D2C businesses — SEO, performance ads and creative content strategy working as one growth engine.",
  primary: { label: "Book a free strategy call", href: "#contact" },
  secondary: { label: "See our work", href: "#reels" },
  /** Seconds between automatic slide changes. */
  autoplaySeconds: 2.6,
  profiles: [
    {
      client: clients[8],
      handle: "",
      image: "",
      category: "Hotel & restaurant · Hubli",
      colors: ["#c9a24b", "#3a2a12"],
    },
    {
      client: clients[3],
      handle: "",
      image: "",
      category: "Cooking oil brand",
      colors: ["#e8b422", "#b3261e"],
    },
    {
      client: clients[11],
      handle: "",
      image: "",
      category: "Construction company",
      colors: ["#f08a24", "#2b2f3a"],
    },
    {
      client: clients[4],
      handle: "",
      image: "",
      category: "Cricket academy",
      colors: ["#1fa58f", "#0c3b4a"],
    },
    {
      client: clients[0],
      handle: "",
      image: "",
      category: "Real estate developer",
      colors: ["#3f7bd8", "#15233f"],
    },
    {
      client: clients[2],
      handle: "",
      image: "",
      category: "Sports management",
      colors: ["#d8343b", "#1b1b1f"],
    },
    {
      client: clients[5],
      handle: "",
      image: "",
      category: "Club & resort",
      colors: ["#5aa05a", "#173322"],
    },
    {
      client: clients[9],
      handle: "",
      image: "",
      category: "Organic food products",
      colors: ["#8bb33a", "#2f3d14"],
    },
  ],
};

/**
 * "What clients say" — two rows of review cards scrolling in opposite directions.
 * Items 1–4 = top row, 5–8 = bottom row.
 *   quote  — the client's own words (approved by them).
 *   name / role — optional: the person who gave the review, e.g. "Ravi Kumar", "Owner".
 *                 If empty, the card shows the company name and "Inspire Media client".
 *   rating — 1–5 stars, only if the client actually gave that rating. 0 = no stars (a quote mark is shown).
 */
export const testimonials = {
  eyebrow: "What clients say",
  title: "Brands that [grew] with us",
  body: "In their own words — from the businesses we work with across real estate, hospitality, sports and food.",
  items: [
    {
      client: clients[8],
      quote:
        "Working with Inspire Media has helped us improve our online presence and showcase our hotel services more effectively. Their creative approach and professional support are appreciated.",
      name: "",
      role: "",
      rating: 0,
    },
    {
      client: clients[3],
      quote:
        "Inspire Media brings fresh ideas to digital marketing and brand promotion. Their content helps us present our products professionally and reach a wider audience.",
      name: "",
      role: "",
      rating: 0,
    },
    {
      client: clients[11],
      quote:
        "The team understands how to present our construction projects professionally online. Their creative work and marketing approach help us strengthen our digital presence.",
      name: "",
      role: "",
      rating: 0,
    },
    {
      client: clients[4],
      quote:
        "Inspire Media has helped us explore better ways to promote our cricket academy online. Their creative content makes it easier to showcase our training and activities.",
      name: "",
      role: "",
      rating: 0,
    },
    {
      client: clients[0],
      quote:
        "Their approach to digital marketing and property promotion is impressive. The team focuses on presenting our projects professionally and improving our online visibility.",
      name: "",
      role: "",
      rating: 0,
    },
    {
      client: clients[2],
      quote:
        "Inspire Media offers creative ideas for promoting sports activities and events. Their professional approach helps us communicate our services more effectively online.",
      name: "",
      role: "",
      rating: 0,
    },
    {
      client: clients[5],
      quote:
        "The team brings a fresh perspective to online promotion and brand communication. Their creative approach helps us showcase our club and activities in an appealing way.",
      name: "",
      role: "",
      rating: 0,
    },
    {
      client: clients[9],
      quote:
        "Inspire Media understands the importance of presenting organic products attractively online. Their creative marketing ideas help us communicate our brand and products more effectively.",
      name: "",
      role: "",
      rating: 0,
    },
  ],
};

/**
 * "Meet our crew" (between "Brands that grew with us" and "Ready to grow your brand?").
 * Each person: photo (public/crew/), name + designation under the photo, and a short statement beside it.
 *   name      — fill in the person's real name.
 *   role      — designation; leave "" until decided (it is simply hidden when empty).
 *   statement — their line in first person. These are suggestions: please confirm each one with the person.
 */
export const crew = {
  eyebrow: "Meet our crew",
  titleStart: "The people behind",
  titleAccent: "the perspective.",
  body: "Every bold idea starts with people who see possibilities differently. From strategy and storytelling to design and digital, our crew brings curiosity, craft and commitment to every brand we grow.",
  members: [
    {
      name: "",
      role: "Founder & CEO",
      photo: "/crew/crew-1.jpg",
      w: 800,
      h: 1000,
      statement:
        "Every brand has a story worth growing. I built Inspire Media to make sure the right people hear it.",
    },
    {
      name: "",
      role: "",
      photo: "/crew/crew-2.jpg",
      w: 900,
      h: 1125,
      statement:
        "We work with passion, and it shows in every post, every campaign and every result.",
    },
    {
      name: "",
      role: "",
      photo: "/crew/crew-3.jpg",
      w: 860,
      h: 1075,
      statement:
        "Ideas are a start. Execution is everything. I care about the details that make work land.",
    },
    {
      name: "",
      role: "",
      photo: "/crew/crew-4.jpg",
      w: 900,
      h: 1125,
      statement:
        "Creativity with a purpose: content that looks good and moves the numbers.",
    },
    {
      name: "",
      role: "",
      photo: "/crew/crew-5.jpg",
      w: 900,
      h: 1125,
      statement:
        "Behind every great campaign is a clear plan. I make sure ours is ready before we spend a rupee.",
    },
    {
      name: "",
      role: "",
      photo: "/crew/crew-6.jpg",
      w: 720,
      h: 900,
      statement:
        "The best stories are told with honesty, consistency and a little bit of fun.",
    },
  ],
};
/**
 * Services section (#services — the "Services" menu link scrolls here): an editorial index.
 * Click a service to open the contact form with it selected.
 *   line — one short line shown beside the name (edit freely).
 *   formValue — must match an option in leadOptions.services
 */
export const serviceList = {
  eyebrow: "Services",
  title: "Services, crafted for [growth]",
  body: "Six disciplines under one roof — planned together, measured together and delivered by one team that knows your brand.",
  items: [
    {
      title: "Digital Marketing",
      line: "One plan across search, social and ads",
      formValue: "Full-funnel growth",
    },
    {
      title: "Performance Ads",
      line: "Campaigns measured by return, not reach",
      formValue: "Paid Ads",
    },
    {
      title: "Meta Ads",
      line: "Facebook and Instagram campaigns that convert",
      formValue: "Paid Ads",
    },
    {
      title: "Google Ads",
      line: "Search, display and YouTube, built to convert",
      formValue: "Paid Ads",
    },
    {
      title: "Creative Content",
      line: "Reels, posts and stories with a purpose",
      formValue: "Creative Content",
    },
    {
      title: "Website Development",
      line: "Fast, mobile-first websites and landing pages",
      formValue: "Website Development",
    },
  ],
  /** Separate line under the list that opens its own landing page. */
  feature: {
    label: "Also from Inspire Media",
    title: "Political Campaigns",
    line: "Campaign strategy, communication and public outreach",
    href: "/political-campaigns",
  },
};

/**
 * Political campaigns landing page (/political-campaigns).
 * PLACEHOLDER CONTENT — replace each text below with the final copy when it is ready.
 */
export const political = {
  metaTitle: "Political Campaigns",
  metaDescription:
    "Political campaign strategy, communication and public outreach by Inspire Media, Hubli.",
  eyebrow: "Political campaigns",
  title: "Campaigns that connect with [people]",
  body: "Content coming soon — this page will explain how Inspire Media plans and runs political campaigns and public communication.",
  cta: "Talk to us about your campaign",
  sections: [
    { title: "Campaign strategy", body: "Content coming soon." },
    { title: "Social media management", body: "Content coming soon." },
    { title: "Media & public relations", body: "Content coming soon." },
    { title: "On-ground event coverage", body: "Content coming soon." },
  ],
};

/**
 * "Graphic design" strip (between the client band and "Built for brands"): a moving reel of real
 * creatives with word tiles in between. Images live in public/designs/ (900px tall, any width).
 * "word" entries are the black tiles with the rolling words.
 */
export const designWork = {
  eyebrow: "Graphic design",
  title: "Creatives that make people [stop scrolling]",
  body: "Festive campaigns, offers, product launches and event creatives — designed in-house for the brands we grow.",
  hint: "Tap a design to view it",
  /** Words rolling inside the black tiles. */
  words: [
    "Social posts",
    "Festive creatives",
    "Ad creatives",
    "Offers",
    "Product launches",
    "Event posters",
    "Branding",
    "Regional campaigns",
  ],
  /** Seconds for one full loop of the strip (lower = faster). */
  loopSeconds: 60,
  tiles: [
    {
      src: "/designs/design-02.jpg",
      w: 720,
      h: 900,
      alt: "SVT Gold Teacher's Day social post",
    },
    {
      src: "/designs/design-01.jpg",
      w: 900,
      h: 900,
      alt: "Mira Silver Jewellery Kerala Kundan necklace post",
    },
    {
      src: "/designs/design-09.jpg",
      w: 720,
      h: 900,
      alt: "Ganesh Promoters Dasara plot offer creative",
    },
    {
      src: "/designs/design-04.jpg",
      w: 506,
      h: 900,
      alt: "SLS Cricket Academy Renegades Cup results story",
    },
    { word: true },
    {
      src: "/designs/design-07.jpg",
      w: 720,
      h: 900,
      alt: "Murshilli's Hubballi Avalakki product ad",
    },
    {
      src: "/designs/design-11.jpg",
      w: 720,
      h: 900,
      alt: "Mira Silver Jewellery discount offer creative",
    },
    {
      src: "/designs/design-05.jpg",
      w: 720,
      h: 900,
      alt: "SVN Gold Buyers Kannada gold value ad",
    },
    {
      src: "/designs/design-03.jpg",
      w: 720,
      h: 900,
      alt: "SVT Gold refined oil Kannada ad",
    },
    {
      src: "/designs/design-13.jpg",
      w: 720,
      h: 900,
      alt: "Mira Silver Jewellery Maha Shivratri post",
    },
    {
      src: "/designs/design-10.jpg",
      w: 720,
      h: 900,
      alt: "Ganesh Promoters site price offer creative",
    },
    { word: true },
    {
      src: "/designs/design-12.jpg",
      w: 720,
      h: 900,
      alt: "Mira Silver Jewellery Shivaji Jayanti post",
    },
    {
      src: "/designs/design-06.jpg",
      w: 506,
      h: 900,
      alt: "INCOMEX 2026 exhibition story for Hubli Shamiyana Suppliers",
    },
    {
      src: "/designs/design-08.jpg",
      w: 720,
      h: 900,
      alt: "Murshilli's three poha varieties product post",
    },
    {
      src: "/designs/design-14.jpg",
      w: 900,
      h: 900,
      alt: "Mira Silver Jewellery necklace product shot",
    },
  ],
};
export const compare = {
  eyebrow: "Why Inspire Media",
  title: "Not another [agency].",
  body: "Most brands have worked with an agency that posted, billed and disappeared. Here’s what working with us looks like instead.",
  them: "Typical agency",
  us: "Inspire Media",
  rows: [
    {
      them: "Separate freelancers for ads, design and SEO",
      us: "One team for strategy, content, ads and SEO",
    },
    {
      them: "The same template for every client",
      us: "A custom roadmap for your goals and budget",
    },
    {
      them: "Posting for likes and followers",
      us: "Content built to bring enquiries and sales",
    },
    {
      them: "Reports full of jargon",
      us: "Clear, data-driven reports — every rupee accountable",
    },
    {
      them: "Set it up and forget it",
      us: "Creatives, audiences and funnels tested and improved continuously",
    },
    {
      them: "Rankings and reach as the goal",
      us: "Growth measured by real business results",
    },
  ],
  cta: "Book a free strategy call",
};
export const manifesto = {
  eyebrow: "What we do, simply",
  pairs: [
    { from: "Views", to: "Visits" },
    { from: "Likes", to: "Leads" },
    { from: "Clicks", to: "Customers" },
    { from: "Reach", to: "Revenue" },
    { from: "Scrolls", to: "Sales" },
    { from: "Budget", to: "Growth" },
  ],
  line: "Attention is easy to buy. We turn it into [business].",
  proof: ["3x average ROAS growth", "30+ brands scaled"],
};
/** Frequently asked questions (answers use only facts from IM.pdf and this site — edit freely). */
export const faq = {
  eyebrow: "FAQ",
  title: "Frequently asked [questions]",
  body: "Straight answers before you book a call. Can’t find yours? Message us — we reply on WhatsApp.",
  items: [
    {
      q: "What does Inspire Media do?",
      a: "We’re a performance marketing agency built exclusively for Brands and D2C businesses. We combine SEO, performance ads (Meta and Google) and creative content strategy into one growth engine.",
    },
    {
      q: "Who do you work with?",
      a: "Brands and D2C businesses. Our clients include real estate developers, hotels, sports academies, food and FMCG brands, and the public sector.",
    },
    {
      q: "How soon will I see results?",
      a: "Our commitment is measurable improvement within 90 days, backed by transparent, data-driven reporting so you can see exactly what’s working.",
    },
    {
      q: "How does working with you start?",
      a: "With a free strategy call or ad account audit. We analyse your current marketing, competitors and opportunities, build a custom roadmap for your goals and budget, then execute and scale what works.",
    },
    {
      q: "How much does it cost?",
      a: "Every plan is custom — it depends on your goals, channels and monthly ad budget. Share your budget range in the form and we’ll recommend a plan that fits it.",
    },
    {
      q: "Will I know where my money is going?",
      a: "Yes. Every rupee you spend is tracked, optimised and accountable, and you get clear, regular reports — no jargon, no hidden numbers.",
    },
    {
      q: "Where are you based?",
      a: "Our office is at 126, Revenue Colony, Raj Nagar, Hubli – 580032, Karnataka. Call or WhatsApp +91 79962 98443 to set up a meeting or a call.",
    },
  ],
};

export const processSteps = [
  {
    title: "Audit",
    body: "We analyse your current marketing, competitors and market opportunities.",
  },
  {
    title: "Strategy",
    body: "We build a custom roadmap tailored to your brand goals and budget.",
  },
  {
    title: "Execute",
    body: "We launch and manage campaigns, content and SEO with precision.",
  },
  {
    title: "Scale",
    body: "We optimise continuously, double down on what works and scale results.",
  },
] as const;

/**
 * "How we plan & deliver" wheel (Approach section). The four steps from IM.pdf
 * (Audit → Strategy → Execute → Scale) broken into eight phases. Edit freely.
 */
/**
 * "Social Media Content That Drives Growth" — a moving strip of reels (between About and Our approach).
 * Videos live in public/reels/ (reel-1.mp4 … reel-7.mp4).
 *   poster — optional cover image (e.g. "/reels/reel-1.jpg"). Leave "" to use the video's first frame.
 *   title / tag — short labels shown on each card (edit freely).
 * To add a reel: put reel-8.mp4 in public/reels/ and add a line below.
 */
export const socialReels = {
  eyebrow: "Social media content",
  title: "Social Media Content That [Drives Growth]",
  body: "We create strategy-led reels, short-form videos and social content designed to increase reach, engagement and qualified customer action.",
  hint: "Tap any reel to watch with sound",
  /** Seconds for one full loop of the strip (lower = faster). */
  loopSeconds: 45,
  reels: [
    {
      video: "/reels/reel-1.mp4",
      poster: "/reels/reel-1.jpg",
      title: "Cricket academy",
      tag: "Sports",
    },
    {
      video: "/reels/reel-2.mp4",
      poster: "/reels/reel-2.jpg",
      title: "Sports event",
      tag: "Sports",
    },
    {
      video: "/reels/reel-3.mp4",
      poster: "/reels/reel-3.jpg",
      title: "Build within budget",
      tag: "Construction",
    },
    {
      video: "/reels/reel-4.mp4",
      poster: "/reels/reel-4.jpg",
      title: "Event venue",
      tag: "Events",
    },
    {
      video: "/reels/reel-5.mp4",
      poster: "/reels/reel-5.jpg",
      title: "Plots in Hubballi",
      tag: "Real estate",
    },
    {
      video: "/reels/reel-6.mp4",
      poster: "/reels/reel-6.jpg",
      title: "Property listings",
      tag: "Real estate",
    },
    {
      video: "/reels/reel-7.mp4",
      poster: "/reels/reel-7.jpg",
      title: "Showroom walkthrough",
      tag: "Retail",
    },
  ],
};

export const journey = {
  label: "Our approach",
  eyebrow: "How we plan & deliver · Idea to impact",
  titleStart: "From first spark to",
  titleAccent: "full scale",
  body: "We don’t start with a template. We listen before we launch, plan before we spend and measure before we scale — eight deliberate steps that turn your brand’s potential into growth you can see.",
  hint: "Drag or click to move through the journey",
  phases: [
    {
      title: "Discover",
      body: "Get to know your brand, your customers and what growth means to you.",
    },
    {
      title: "Audit",
      body: "Analyse your current marketing, competitors and market opportunities.",
    },
    {
      title: "Strategy",
      body: "Build a custom roadmap tailored to your brand goals and budget.",
    },
    {
      title: "Create",
      body: "Craft the content and creative that make people stop, watch and act.",
    },
    {
      title: "Launch",
      body: "Go live with campaigns, content and SEO — set up with precision.",
    },
    {
      title: "Optimise",
      body: "Test, learn and refine every week based on real performance data.",
    },
    {
      title: "Report",
      body: "Transparent, data-driven reporting — every rupee accountable.",
    },
    {
      title: "Scale",
      body: "Double down on what works and scale the results.",
    },
  ],
} as const;

/** Options for the lead forms. Budget ranges are placeholders — edit to suit. */
export const leadOptions = {
  services: [
    "SEO",
    "Paid Ads",
    "Creative Content",
    "Website Development",
    "Political Campaigns",
    "Full-funnel growth",
  ],
  industries: [
    "D2C / E-commerce",
    "Retail & Stores",
    "Food & Beverage",
    "Fashion & Lifestyle",
    "Beauty & Wellness",
    "Healthcare",
    "Education",
    "Real Estate",
    "Automotive",
    "Other",
  ],
  /** Suggestions for the popup's city field (any city can still be typed). */
  cities: [
    "Hubli",
    "Dharwad",
    "Belagavi",
    "Bengaluru",
    "Mysuru",
    "Mangaluru",
    "Davanagere",
    "Kalaburagi",
    "Ballari",
    "Vijayapura",
    "Shivamogga",
    "Udupi",
    "Mumbai",
    "Pune",
    "Hyderabad",
    "Chennai",
    "Goa",
    "Delhi",
  ],
  budgets: [
    "Under ₹50,000",
    "₹50,000 – ₹1,00,000",
    "₹1,00,000 – ₹3,00,000",
    "Above ₹3,00,000",
  ],
} as const;

export const whatsappUrl = (
  message = "Hi Inspire Media, I'd like to book a strategy call.",
) =>
  `https://wa.me/${site.contact.primaryPhone.whatsapp}?text=${encodeURIComponent(message)}`;
