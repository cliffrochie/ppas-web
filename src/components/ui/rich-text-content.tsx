import DOMPurify from 'dompurify';
import { cn } from '@/utils';

interface RichTextContentProps {
  html: string;
  className?: string;
}

/**
 * Renders HTML produced by `RichTextEditor` (e.g. a purchase request item's
 * `specifications` field) — sanitized with DOMPurify since it's rendered via
 * `dangerouslySetInnerHTML`.
 */
export const RichTextContent = ({ html, className }: RichTextContentProps) => (
  <div
    className={cn('text-sm [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5', className)}
    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
  />
);
