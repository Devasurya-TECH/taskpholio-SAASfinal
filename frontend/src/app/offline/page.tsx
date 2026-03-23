"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-secondary/20 backdrop-blur-3xl flex items-center justify-center p-4">
      <div className="text-center glass p-12 rounded-[3rem] border border-white/5 max-w-md w-full">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-primary/20 rounded-3xl flex items-center justify-center border border-primary/30 shadow-2xl">
            <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-foreground mb-4 tracking-tighter">Comms Interrupted</h1>
        <p className="text-muted-foreground mb-8 font-medium">
          Strategic downlink offline. Please verify your tactical network connection and re-establish intelligence feed.
        </p>
        
        <button
          onClick={() => window.location.reload()}
          className="w-full px-8 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all"
        >
          Re-establish Connection
        </button>
      </div>
    </div>
  );
}
