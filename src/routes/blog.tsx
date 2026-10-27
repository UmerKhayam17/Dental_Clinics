import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, SiteLayout, seo } from "@/components/site/SiteLayout";
import { POSTS } from "@/lib/data";
import { sceneForPost } from "@/lib/scenes";

export const Route = createFileRoute("/blog")({
  head: () => seo("Journal | Lumière Dental Studio", "Notes on first visits, crowns, and children’s appointments from a fictional dental studio.", "/blog"),
  component: () => (
    <SiteLayout>
      <PageHero eyebrow="Journal" title="Plain answers, written before you book." intro="Short notes from the studio. They are general information, not a diagnosis." />
      <section className="mx-auto grid max-w-5xl gap-6 px-5 py-20">
        {POSTS.map((post) => {
          const scene = sceneForPost(post.slug);
          return (
          <Link key={post.slug} to="/blog/$slug" params={{ slug: post.slug }} className="grid overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-soft md:grid-cols-[16rem_1fr]">
            <img src={scene.src} alt="" loading="lazy" width={800} height={600} className="h-48 w-full object-cover md:h-full" />
            <div className="p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-gold">{post.date}</p>
              <h2 className="mt-3 font-serif text-3xl text-primary">{post.title}</h2>
              <p className="mt-3 text-muted-foreground">{post.excerpt}</p>
            </div>
          </Link>
          );
        })}
      </section>
    </SiteLayout>
  ),
});
