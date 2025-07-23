const SkeletonPost = () => {
  return (
    <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800">
      {/* Mimics the main text line */}
      <div className="h-5 bg-slate-700 rounded w-3/4 animate-pulse mb-3"></div>
      <div className="h-5 bg-slate-700 rounded w-1/2 animate-pulse"></div>

      {/* Mimics the voting section */}
      <div className="mt-6 pt-4 border-t border-slate-800">
         <div className="h-8 bg-slate-700 rounded w-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default SkeletonPost;