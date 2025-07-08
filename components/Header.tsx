export function Header() {
  return (
    <header className="text-center py-12">
      <h1 className="text-4xl font-bold text-white mb-4">
        EntropyPass
      </h1>
      <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
        Generate secure, high-entropy passwords using real-world randomness like drawing input, 
        device timing, and live weather data.
      </p>
      <p className="text-sm text-slate-400 mt-2">
        Smart Passwords from Real-World Entropy
      </p>
    </header>
  );
}