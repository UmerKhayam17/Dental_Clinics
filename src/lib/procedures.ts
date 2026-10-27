import general from "@/assets/visit-general.jpg";
import whitening from "@/assets/visit-whitening.jpg";
import implant from "@/assets/visit-implant.jpg";
import ortho from "@/assets/visit-ortho.jpg";
import root from "@/assets/visit-root.jpg";
import cosmetic from "@/assets/visit-cosmetic.jpg";
import pediatric from "@/assets/visit-pediatric.jpg";
import crown from "@/assets/visit-crown.jpg";
import cleaning from "@/assets/visit-cleaning.jpg";
import emergency from "@/assets/visit-emergency.jpg";

export type ProcedurePhoto = {
  slug: string;
  src: string;
  alt: string;
  caption: string;
};

export const PROCEDURES: ProcedurePhoto[] = [
  { slug: "general-dentistry", src: general, alt: "A dentist examining a patient’s teeth with a mirror", caption: "Dr. Carter during a check-up, looking at the teeth before anything is planned." },
  { slug: "teeth-whitening", src: whitening, alt: "A dentist comparing a shade guide with a patient’s smile", caption: "The shade is chosen with you in the chair, before any gel is used." },
  { slug: "dental-implants", src: implant, alt: "A dentist examining a patient’s smile, with an implant model on the tray", caption: "Dr. Mehta examines the space first. The implant model stays on the tray until you decide." },
  { slug: "orthodontics", src: ortho, alt: "An orthodontist fitting a clear aligner for a teenage patient", caption: "Dr. Lin tries an aligner with the patient at Riverside." },
  { slug: "root-canal-treatment", src: root, alt: "A dentist treating a reclined patient under the operating light", caption: "Dr. Mehta works under the light. The tooth is numbed, and the visit is explained before it starts." },
  { slug: "cosmetic-dentistry", src: cosmetic, alt: "A dentist showing a patient their smile in a hand mirror", caption: "You see the direction in a mirror before a tooth is prepared." },
  { slug: "pediatric-dentistry", src: pediatric, alt: "A dentist showing a child a mirror during a check-up, with a parent nearby", caption: "A first children’s visit at Riverside: the mirror, a count of the teeth, and a parent in the room." },
  { slug: "crowns-and-bridges", src: crown, alt: "A dentist trying a ceramic crown beside a patient’s smile", caption: "The crown is checked against the bite before it is fitted." },
  { slug: "teeth-cleaning", src: cleaning, alt: "A clinician polishing a patient’s teeth", caption: "A cleaning in the chair, with the spots brushing misses." },
  { slug: "emergency-dental-care", src: emergency, alt: "A dentist examining a patient who is holding a sore cheek", caption: "Dr. Mehta sees a same-day toothache and decides what can be settled today." },
];

export const procedureFor = (slug: string) => PROCEDURES.find((p) => p.slug === slug) ?? PROCEDURES[0];
