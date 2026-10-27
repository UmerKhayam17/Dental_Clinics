import hero from "@/assets/hero.jpg";
import reception from "@/assets/studio-reception.jpg";
import consult from "@/assets/studio-consult.jpg";
import hygiene from "@/assets/studio-hygiene.jpg";
import riverside from "@/assets/studio-riverside.jpg";
import imaging from "@/assets/studio-imaging.jpg";
import waiting from "@/assets/studio-waiting.jpg";

export type Scene = {
  id: string;
  src: string;
  alt: string;
  title: string;
  caption: string;
  place: "Bayview" | "Riverside";
};

export const SCENES: Scene[] = [
  {
    id: "bayview",
    src: hero,
    alt: "Bayview treatment room with a dental chair, teal cabinets, and a window",
    title: "Bayview treatment room",
    caption: "The longer visits happen here: restorations, implants, whitening, and same-day emergencies.",
    place: "Bayview",
  },
  {
    id: "reception",
    src: reception,
    alt: "Reception with a marble desk, linen chairs, and a round brass mirror",
    title: "Reception",
    caption: "You check in here. The medical questions are finished before you sit in the chair.",
    place: "Bayview",
  },
  {
    id: "waiting",
    src: waiting,
    alt: "Waiting lounge with ivory seating against deep teal walls",
    title: "The lounge",
    caption: "A quiet seat if you arrive early. There is no television.",
    place: "Bayview",
  },
  {
    id: "consult",
    src: consult,
    alt: "Consultation corner with two chairs, an oak table, and a brass lamp",
    title: "Consultation",
    caption: "Plans and fees are talked through at a table, before a tooth is prepared.",
    place: "Bayview",
  },
  {
    id: "imaging",
    src: imaging,
    alt: "A compact dental scanner in a teal treatment room",
    title: "Imaging",
    caption: "A scan is taken when it changes a decision, not as a routine extra.",
    place: "Bayview",
  },
  {
    id: "hygiene",
    src: hygiene,
    alt: "Hygiene room with a side view of the chair and a tray of instruments",
    title: "Hygiene room",
    caption: "Cleanings and reviews of the spots a brush misses.",
    place: "Bayview",
  },
  {
    id: "riverside",
    src: riverside,
    alt: "Sage-green treatment room looking out over a river quay",
    title: "Riverside studio",
    caption: "Orthodontics, children’s visits, and hygiene, in a smaller room on Willow Quay.",
    place: "Riverside",
  },
];

const byId = (id: string) => SCENES.find((s) => s.id === id) ?? SCENES[0];

const POST_SCENE: Record<string, string> = {
  "your-first-visit": "consult",
  "caring-for-a-crown": "bayview",
  "children-in-the-chair": "riverside",
};

export const sceneForPost = (slug: string) => byId(POST_SCENE[slug] ?? "waiting");
export const sceneForBranch = (id: string) => byId(id === "riverside" ? "riverside" : "bayview");
