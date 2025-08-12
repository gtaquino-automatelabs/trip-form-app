export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      {/* Fixed background - using gradient since image is missing/corrupted */}
      <div 
        className="fixed inset-0 z-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800"
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-black/20" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}