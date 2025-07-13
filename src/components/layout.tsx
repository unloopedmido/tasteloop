import type { ReactNode } from 'react';
import MetaTags, { type MetaTagsProps } from './metaTags';
import { cn } from '@/lib/utils';

type LayoutProps = {
  children: ReactNode;
  className?: string;
} & MetaTagsProps;

export default function Layout({ children, description, image, title, className }: LayoutProps) {
  return (
    <>
      <MetaTags description={description} title={title} image={image} />
      <div className={cn('h-[calc(100vh-100px)]', className)}>{children}</div>
    </>
  );
}
