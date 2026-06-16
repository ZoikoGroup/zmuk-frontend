import NewsArticle from "@/app/components/NewsArticle";


export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <NewsArticle slug={slug} />;
}
