export default function LoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex justify-center items-center py-12 ${className}`}>
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#1e3a8a]/20 border-t-[#1e3a8a]" />
    </div>
  );
}
