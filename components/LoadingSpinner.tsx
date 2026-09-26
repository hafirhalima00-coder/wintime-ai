export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <div className="w-10 h-10 rounded-full border-2 border-gray-700 border-t-blue-500 animate-spin" />
      <p className="text-sm text-gray-400 tracking-wide">
        Bob is analyzing your code...
      </p>
    </div>
  );
}
