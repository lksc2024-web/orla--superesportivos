import { largest, srcSet } from "@/lib/site";

type Props = {
  name: string;
  alt: string;
  sizes: string;
  className?: string;
  eager?: boolean;
  width?: number;
  height?: number;
  parallax?: boolean;
};

/** Pre-sized webp set from /public/img; the browser picks the width. */
export default function Picture({ name, alt, sizes, className, eager, width, height, parallax }: Props) {
  return (
    <img
      src={largest(name)}
      srcSet={srcSet(name)}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
      width={width}
      height={height}
      data-parallax={parallax ? "" : undefined}
    />
  );
}
