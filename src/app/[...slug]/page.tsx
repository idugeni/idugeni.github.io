import { ignoredSlugs } from '@/config/ignoredSlugs';
import RedirectContent from '@/app/[...slug]/redirect-content';

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function DynamicRedirectPage(props: PageProps) {
  const params = await props.params;
  const slugArray = params?.slug ?? [];
  const path = slugArray.join('/');

  const isInvalidPath = !path || path.trim() === '';
  const isIgnoredSlug = ignoredSlugs.includes(path) || !path.includes('-');

  return (
    <RedirectContent path={path} isInvalidPath={isInvalidPath} isIgnoredSlug={isIgnoredSlug} />
  );
}
