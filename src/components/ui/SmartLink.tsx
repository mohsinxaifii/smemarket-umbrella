import Link from "next/link";
import { linkProps } from "@/lib/site";

type Props = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

/** Next.js Link for pages on this site; a plain anchor for the app, Growth Studio and other sites. */
export default function SmartLink({ href, children, ...rest }: Props) {
  if (href.startsWith("/"))
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  return (
    <a href={href} {...linkProps(href)} {...rest}>
      {children}
    </a>
  );
}
