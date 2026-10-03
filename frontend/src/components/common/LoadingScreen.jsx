const LoadingScreen = () => (
  <div className="flex min-h-[60vh] w-full items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-blush-200 border-t-rose-500" />
      <p className="font-display text-sm italic text-mauve-400">Just a moment...</p>
    </div>
  </div>
);

export default LoadingScreen;
