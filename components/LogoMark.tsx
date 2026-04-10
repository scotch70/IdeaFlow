/**
 * IdeaFlow logo mark — uses the brand image from /public/logo.png.
 * `size` controls the rendered height/width in px (default 32).
 */
export default function LogoMark({ size = 32 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="IdeaFlow"
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        borderRadius: '0.375rem',
        display: 'block',
        // Grey image background becomes invisible against the white header
        mixBlendMode: 'multiply',
      }}
    />
  )
}
