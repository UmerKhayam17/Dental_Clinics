import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteLayout, seo } from "@/components/site/SiteLayout";
import { POSTS } from "@/lib/data";
import { sceneForPost } from "@/lib/scenes";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = POSTS.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) => loaderData
    ? seo(`${loaderData.title} | Lumière Dental Studio`, loaderData.excerpt, `/blog/${loaderData.slug}`)
    : { meta: [{ title: "Article not found" }] },
  component: Article,
});

function Article() {
  const post = Route.useLoaderData();
  const scene = sceneForPost(post.slug);
  return (
    <SiteLayout>
      <img src={scene.src} alt={scene.alt} width={1600} height={900} className="aspect-[21/8] w-full object-cover" />
      <article className="mx-auto max-w-3xl px-5 py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link to="/">Home</Link> / <Link to="/blog">Journal</Link> / <span className="text-foreground">{post.title}</span>
        </nav>
        <p className="mt-8 text-xs uppercase tracking-[0.2em] text-gold">{post.date}</p>
        <h1 className="mt-3 font-serif text-4xl text-primary md:text-5xl">{post.title}</h1>
        <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted-foreground">
          {post.paragraphs.map((p) => <p key={p}>{p}</p>)}
        </div>
        <Button asChild className="mt-10"><Link to="/book">Book a visit</Link></Button>
      </article>
    </SiteLayout>
  );
}
