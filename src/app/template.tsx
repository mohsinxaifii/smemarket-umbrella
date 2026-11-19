/** Re-mounts on every navigation, so each page eases in. "backwards" fill: once done it leaves no transform behind, which would break pinned (position: fixed) sections. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-[pageIn_.6s_cubic-bezier(.16,1,.3,1)_backwards]">{children}</div>;
}
