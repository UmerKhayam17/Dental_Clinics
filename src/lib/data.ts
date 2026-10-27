import dr1 from "@/assets/dr-1.jpg";
import dr2 from "@/assets/dr-2.jpg";
import dr3 from "@/assets/dr-3.jpg";

export const CLINIC = {
  name: "Lumière Dental Studio",
  tagline: "Modern Dentistry. Beautiful Confidence.",
  address: "24 Harbour Crescent, Suite 3, Bayview",
  phone: "+1 (555) 014-2200",
  whatsapp: "+1 (555) 014-2201",
  email: "hello@lumiere-dental.demo",
  hours: [
    ["Monday – Friday", "8:00 – 19:00"],
    ["Saturday", "9:00 – 15:00"],
    ["Sunday", "Closed (emergency line open)"],
  ] as const,
};

export type Treatment = {
  slug: string;
  name: string;
  short: string;
  overview: string;
  benefits: string[];
  whoFor: string[];
  process: string[];
  aftercare: string[];
  faqs: { q: string; a: string }[];
  duration: number;
  price: number;
};

const t = (
  slug: string,
  name: string,
  short: string,
  duration: number,
  price: number,
  extra: Partial<Treatment> = {},
): Treatment => ({
  slug,
  name,
  short,
  duration,
  price,
  overview: extra.overview ?? `${name} at Lumière begins with an unhurried consultation. ${short}`,
  benefits: extra.benefits ?? ["A plan shaped around your goals", "Costs explained before treatment", "Unhurried, comfort-focused visits"],
  whoFor: extra.whoFor ?? ["Adults and, where noted, children who want this care", "Anyone advised to consider it after an examination"],
  process: extra.process ?? ["Consultation and examination", "Written plan and estimate", "Treatment across the visits you actually need", "A review to check comfort and result"],
  aftercare: extra.aftercare ?? ["Follow the written aftercare you are given", "Keep your usual brushing and cleaning routine", "Call the studio if pain, swelling, or a bite change worries you"],
  faqs: extra.faqs ?? [
    { q: `Does ${name.toLowerCase()} hurt?`, a: "Most people are comfortable with local anaesthetic where it is needed. We agree the approach before we start." },
    { q: "How many visits?", a: `A typical appointment is about ${duration} minutes. Your dentist will say if more than one visit is required.` },
  ],
});

export const TREATMENTS: Treatment[] = [
  t("general-dentistry", "General Dentistry", "Check-ups, fillings, and preventive care that keep small problems small.", 30, 90, {
    overview: "General dentistry at Lumière is the quiet work of keeping teeth and gums healthy: examinations, radiographs when they are useful, fillings, and a plan you can actually follow.",
    whoFor: ["Anyone due a routine examination", "People with sensitivity, a broken filling, or a tooth that catches food"],
    benefits: ["Problems found while they are still straightforward", "Fillings matched to the tooth, not a default package", "A clear interval for your next visit"],
  }),
  t("teeth-whitening", "Teeth Whitening", "Dentist-supervised whitening for a brighter shade that still looks like your teeth.", 60, 350, {
    overview: "Whitening is planned around the shade you have now and the one that will still look natural in daylight. We check the teeth and gums first, because whitening is not the right first step for every stain.",
    whoFor: ["Adults with healthy teeth and gums who want a lighter shade", "People whose colour has deepened from coffee, tea, or time"],
    benefits: ["Shade discussed before the gel is used", "Supervised strength rather than an unknown kit", "Guidance for sensitivity"],
    faqs: [
      { q: "Will my teeth look unnaturally white?", a: "We aim for a lighter version of your own shade. You approve the direction before treatment." },
      { q: "How long does it last?", a: "Diet and habits change the result over time. Your dentist will tell you what to expect and when a refresh might help." },
    ],
  }),
  t("dental-implants", "Dental Implants", "A fixed way to replace a missing tooth, planned around bone, bite, and the teeth beside it.", 90, 2400, {
    overview: "An implant is a small titanium post placed in the jaw, later restored with a crown. It is a longer course of care than a filling, and it is only recommended after imaging and a medical review.",
    whoFor: ["Adults missing one or more teeth who want a fixed replacement", "People who have been told a denture moves more than they would like"],
    process: ["Examination and imaging", "Discussion of implant, bridge, and denture options", "Placement and healing, which takes months", "Crown or bridge once the implant is stable", "Review of cleaning around the new tooth"],
    benefits: ["Neighbouring teeth can often be left untouched", "A replacement that does not come in and out", "A written estimate before you decide"],
  }),
  t("orthodontics", "Orthodontics", "Clear aligners and braces for teens and adults, planned around the face as well as the teeth.", 45, 2900, {
    overview: "Orthodontics moves teeth into a bite that is easier to clean and more even to look at. Dr. Lin plans aligners and braces for teenagers and adults, and says plainly when a case needs a different approach.",
    whoFor: ["Teens and adults with crowding, spacing, or a bite that feels off", "People who want to know, before they start, how long it is likely to take"],
    benefits: ["A plan you can see before you commit", "Aligners or braces chosen for the case, not as a default", "Review visits kept short and predictable"],
  }),
  t("root-canal-treatment", "Root Canal Treatment", "Care for the inside of a tooth when the nerve is inflamed or infected, so the tooth can stay.", 75, 780, {
    overview: "Root canal treatment removes inflamed or infected tissue from inside a tooth, then seals the space. It is usually done to relieve pain and to keep a tooth that would otherwise be lost.",
    whoFor: ["People with lingering toothache, swelling, or a tooth that hurts to bite", "Teeth with deep decay or injury that has reached the nerve"],
    benefits: ["The tooth can often be kept", "Treatment under local anaesthetic", "A clear explanation of whether a crown will be needed afterwards"],
  }),
  t("cosmetic-dentistry", "Cosmetic Dentistry", "Bonding, veneers, and small smile changes designed around your features.", 60, 650, {
    overview: "Cosmetic dentistry at Lumière is specific: a chipped edge, a dark tooth, a gap you notice in photographs. We photograph and talk through options before any tooth is prepared.",
    whoFor: ["Adults who want to change the shape or colour of particular teeth", "People comparing bonding, whitening, and veneers"],
    benefits: ["Preview of the direction before irreversible steps", "Options from bonding through to porcelain", "Shade matched in natural light"],
  }),
  t("pediatric-dentistry", "Pediatric Dentistry", "Shorter, calmer visits that help children learn what a dental chair is for.", 30, 70, {
    overview: "Children’s visits are paced for the child in the chair. We explain each step in plain language, keep appointments short, and involve the parent in what to practise at home.",
    whoFor: ["Children coming for a first check-up", "Families who want a steady dentist rather than a one-off visit"],
    benefits: ["Time spent on trust, not only on teeth", "Prevention advice parents can use", "A calm route into any treatment that is actually needed"],
  }),
  t("crowns-and-bridges", "Dental Crowns & Bridges", "Restorations that rebuild a weakened tooth or fill a space, made to match the bite.", 60, 1100, {
    overview: "A crown covers a tooth that is cracked, heavily filled, or root-treated. A bridge replaces a missing tooth by anchoring to the teeth beside the space. Both are made to fit the bite you already have.",
    whoFor: ["Teeth that can no longer hold a filling reliably", "A single missing tooth where a bridge is a reasonable option"],
    benefits: ["Strength returned to a fragile tooth", "Shape and shade discussed before the final visit", "Written care for the gum line around the restoration"],
  }),
  t("teeth-cleaning", "Teeth Cleaning", "A hygienist visit to remove buildup and leave the gums calmer.", 45, 120, {
    overview: "A cleaning removes hardened buildup that brushing misses and lets us show you the spots that need a different brush or floss. It is prevention, not a cosmetic add-on.",
    whoFor: ["Anyone on a regular hygiene interval", "People whose gums bleed when they brush"],
    benefits: ["Buildup removed without rushing", "Home-care coaching for the areas you actually miss", "A note back to your dentist if something else needs a look"],
  }),
  t("emergency-dental-care", "Emergency Dental Care", "Same-day time for toothache, swelling, a knocked tooth, or a broken edge.", 30, 150, {
    overview: "Emergency visits are for pain, swelling, trauma, and broken teeth. We aim to see you the same day, make you comfortable, and explain what the follow-up should be. This is not a substitute for medical emergency care.",
    whoFor: ["Severe toothache or a swelling in the face or gum", "A tooth that has broken, been knocked, or lost a crown"],
    process: ["Call the studio and describe the problem", "Same-day examination", "Pain relief and the most useful immediate treatment", "A planned return visit if more care is needed"],
    faqs: [
      { q: "What if I cannot breathe or swallow properly?", a: "That is a medical emergency. Contact emergency services first, then let us know." },
      { q: "Do you always finish the tooth the same day?", a: "Often we stabilise first. A permanent filling, crown, or root treatment may need a later visit." },
    ],
  }),
];

export type Dentist = {
  id: string;
  name: string;
  title: string;
  qualifications: string;
  specialties: string[];
  languages: string[];
  experience: string;
  bio: string;
  branches: string[];
  photo?: string;
};

export const DENTISTS: Dentist[] = [
  {
    id: "d1",
    name: "Dr. Melissa Carter",
    title: "Principal Dentist",
    qualifications: "DDS, MSc Restorative Dentistry",
    specialties: ["General Dentistry", "Crowns & Bridges", "Cosmetic Dentistry"],
    languages: ["English", "Spanish"],
    experience: "Over 15 years in practice",
    bio: "Melissa opened Lumière so examinations could run long enough to be useful. She spends most of her week on restorative care, worn teeth, and patients who want a plan rather than a single quick fix.",
    branches: ["bayview"],
    photo: dr1,
  },
  {
    id: "d2",
    name: "Dr. Arjun Mehta",
    title: "Endodontic & Implant Dentist",
    qualifications: "BDS, MDS Endodontics",
    specialties: ["Root Canal Treatment", "Dental Implants", "Emergency Care"],
    languages: ["English", "Hindi"],
    experience: "Over 10 years in practice",
    bio: "Arjun treats teeth other people have been told to remove, when saving them is the sound choice. He also plans single-tooth implants and takes the studio’s same-day emergency list.",
    branches: ["bayview"],
    photo: dr2,
  },
  {
    id: "d3",
    name: "Dr. Hana Lin",
    title: "Orthodontist",
    qualifications: "DMD, Cert. Orthodontics",
    specialties: ["Orthodontics", "Pediatric Dentistry", "Cosmetic Dentistry"],
    languages: ["English", "Mandarin"],
    experience: "Over 8 years in practice",
    bio: "Hana plans aligner and brace treatment for teenagers and adults, and looks after the children’s list at Riverside. She would rather decline a case than stretch an aligner past what it can do.",
    branches: ["bayview", "riverside"],
    photo: dr3,
  },
];

export const REVIEWS = [
  { name: "Sophie R.", treatment: "Teeth Whitening", text: "The visit was unhurried. The shade we agreed on still looks like my teeth, only lighter." },
  { name: "Daniel K.", treatment: "Dental Implants", text: "I was given the alternatives, including doing nothing for a while. The implant visits were spaced exactly as described." },
  { name: "Priya S.", treatment: "Orthodontics", text: "The aligner plan included a finish date and what would happen if a tooth did not move. That honesty mattered." },
  { name: "Mark T.", treatment: "Emergency Care", text: "I was seen the morning a molar cracked. They stabilised it and booked the proper visit, rather than rushing a crown." },
  { name: "Elena V.", treatment: "Pediatric Dentistry", text: "My daughter knew what the mirror was for before anyone asked her to open wide. We left with one small thing to practise." },
  { name: "James O.", treatment: "Teeth Cleaning", text: "No lecture, just the two spots I miss and a cleaning that did not feel hurried." },
];

export const TIME_SLOTS = ["09:00", "09:45", "10:30", "11:15", "13:00", "13:45", "14:30", "15:15", "16:00", "16:45"];

export const PROCEDURES = [
  { name: "Examination", cost: 90 },
  { name: "Composite filling", cost: 180 },
  { name: "Crown", cost: 1100 },
  { name: "Root canal treatment", cost: 780 },
  { name: "Extraction", cost: 220 },
  { name: "Dental implant", cost: 2400 },
  { name: "Scale and polish", cost: 120 },
  { name: "Whitening", cost: 350 },
  { name: "Porcelain veneer", cost: 950 },
];

export type Branch = {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  blurb: string;
  area: string;
  faqs: { q: string; a: string }[];
  map: string;
};

export const BRANCHES: Branch[] = [
  {
    id: "bayview",
    name: "Bayview Studio",
    city: "Bayview",
    address: "24 Harbour Crescent, Suite 3, Bayview",
    phone: "+1 (555) 014-2200",
    email: "bayview@lumiere-dental.demo",
    hours: "Monday to Friday 8:00–19:00 · Saturday 9:00–15:00",
    blurb: "The original studio, with general, restorative, implant, and emergency care on one quiet floor above the crescent.",
    area: "Bayview and the harbour neighbourhoods",
    faqs: [
      { q: "Is there evening time?", a: "The Bayview list runs until 19:00 on weekdays. Evening slots go first, so request the day rather than a promise of a particular hour." },
      { q: "Where do I come for an emergency?", a: "Call the Bayview line. Same-day emergency care is arranged from this studio." },
    ],
    map: "https://www.openstreetmap.org/export/embed.html?bbox=-0.15%2C51.49%2C-0.11%2C51.51&layer=mapnik",
  },
  {
    id: "riverside",
    name: "Riverside Studio",
    city: "Riverside",
    address: "88 Willow Quay, Level 2, Riverside",
    phone: "+1 (555) 014-2288",
    email: "riverside@lumiere-dental.demo",
    hours: "Monday to Friday 9:00–18:00 · Saturday 9:00–13:00",
    blurb: "A smaller room on Willow Quay for orthodontics, children’s visits, and hygiene, with restorative care referred to Bayview when that is the better setting.",
    area: "Riverside and the quay",
    faqs: [
      { q: "Can I see Dr. Carter at Riverside?", a: "Dr. Carter works at Bayview. Dr. Lin consults at both studios and looks after the children’s and orthodontic lists here." },
      { q: "Do you whiten teeth at Riverside?", a: "Whitening and implant placement are booked at Bayview, where the longer appointments are held." },
    ],
    map: "https://www.openstreetmap.org/export/embed.html?bbox=-0.13%2C51.50%2C-0.09%2C51.52&layer=mapnik",
  },
];

export const STAFF = [
  { id: "s1", name: "Amira Shah", role: "Receptionist", branchId: "bayview", email: "amira@lumiere-dental.demo" },
  { id: "s2", name: "Jonah Blake", role: "Receptionist", branchId: "riverside", email: "jonah@lumiere-dental.demo" },
  { id: "s3", name: "Priya Nair", role: "Accountant", branchId: "bayview", email: "priya@lumiere-dental.demo" },
  { id: "s4", name: "Luis Ortega", role: "Inventory", branchId: "bayview", email: "luis@lumiere-dental.demo" },
] as const;

export type Post = { slug: string; title: string; date: string; excerpt: string; paragraphs: string[] };

export const POSTS: Post[] = [
  {
    slug: "your-first-visit",
    title: "What actually happens at a first visit",
    date: "2026-09-02",
    excerpt: "A first appointment is a conversation and an examination, not a surprise course of treatment.",
    paragraphs: [
      "Arrive a few minutes early so the medical questions are finished before you sit down. We ask about medications, allergies, and what you want from the visit. If you are nervous, say so. It changes the pace, and it should.",
      "The examination looks at teeth, gums, bite, and the soft tissues. Radiographs are recommended when they change a decision, not as a routine extra. You will be told what was seen in ordinary language.",
      "Treatment is not started on the day unless you are in pain or you ask to proceed and there is time. Most people leave with a written suggestion, a fee range, and a choice about when to return.",
      "This note is general information for a fictional studio. It is not a personal recommendation. A dentist who has examined you is the right person to plan your care.",
    ],
  },
  {
    slug: "caring-for-a-crown",
    title: "Living with a new crown",
    date: "2026-08-11",
    excerpt: "A crown is strong. The edge where it meets the tooth still needs ordinary, careful cleaning.",
    paragraphs: [
      "The bite can feel high for a day. If a tooth still meets first after forty-eight hours, call and have it adjusted. Leaving a high spot can make the tooth ache.",
      "Clean the margin, the line where crown meets tooth, the way you clean any other tooth. Floss may catch slightly on the way up. Slide it out sideways rather than snapping it back through the contact.",
      "Crowns do not decay, but the tooth underneath can. Sweet drinks held against the edge, and a missed patch of plaque, are the usual reasons a crowned tooth needs more treatment later.",
      "Avoid biting hard sweets and ice on a new restoration for the first week. If the crown loosens or tastes persistently strange, stop using that side and contact the studio.",
    ],
  },
  {
    slug: "children-in-the-chair",
    title: "Helping a child feel ordinary at the dentist",
    date: "2026-06-20",
    excerpt: "The useful preparation is short, true, and free of stories about how brave someone else was.",
    paragraphs: [
      "Tell your child they will sit in a chair, we will count their teeth, and they can ask us to pause. That is usually the whole of a first visit. Promising no instruments, if instruments might be needed, makes the second visit harder.",
      "Come when they are fed and not at the end of a long day if you can choose. A parent in the room is welcome. Narrating every move from the side of the chair is less helpful than it feels.",
      "If a tooth does need treatment, we explain it to the child with the same words we will use when we do it. There is no separate, softer version.",
      "Pain, swelling, or a tooth that has been knocked out of place should be telephoned in, not saved for a routine check-up.",
    ],
  },
];

export const VISIT_PREP = [
  { title: "A list of medicines", body: "Include anything you take regularly, and anything you were told to avoid. Allergies belong on the same list." },
  { title: "The reason you booked", body: "Pain, a chip, a check-up, or a question about whitening. One sentence is enough. We start there." },
  { title: "About 45 minutes", body: "A first visit is an examination and a conversation. Treatment starts the same day only if you are in pain or you ask to proceed and there is time." },
  { title: "A written next step", body: "You leave with what was seen, whether anything needs to happen, and a fee range before a tooth is prepared." },
];

export const FAQS = [
  { q: "Do I need a referral?", a: "No. Book a check-up, a named treatment, or an emergency call. If another dentist has notes or radiographs, bring them. They can shorten the visit." },
  { q: "How are fees decided?", a: "Each treatment page shows a starting fee. Your own fee is written down after the examination, because teeth are not identical. You can decline or delay." },
  { q: "Which studio should I choose?", a: "Bayview holds longer restorative, implant, whitening, and emergency visits. Riverside is for orthodontics, children’s visits, and hygiene. Dr. Lin consults at both." },
  { q: "What if I am nervous?", a: "Say so when you book. The visit is paced around that. We explain the next instrument before it is used." },
  { q: "Can I move a time I already booked?", a: "Yes. The patient portal in this demonstration lets you ask for another time. Reception sees the request on the appointment. No real message is sent." },
  { q: "Is this a real clinic?", a: "No. This is a demonstration of a fictional studio. Anything you type stays in this browser. The clinical notes are general information and need a dentist’s review before they apply to you." },
];

export const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);
