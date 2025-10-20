export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      {/* Fixed background - matching right panel colors */}
      <div 
        className="fixed inset-0 z-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800"
      >
        {/* Subtle pattern overlay with cyan accents */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/10 via-transparent to-cyan-800/10" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}