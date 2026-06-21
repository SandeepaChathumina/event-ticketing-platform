export default function Footer() {
  return (
    <footer className="bg-neutral-950 border-t border-white/10 pt-16 pb-8 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-neutral-400">
        <div>
          <h3 className="text-white font-bold mb-4">Dons Plaza</h3>
          <p className="text-sm">Experience cinema in the heart of the city with our premium 3D and IMAX screens.</p>
        </div>
        <div id="contact">
          <h3 className="text-white font-bold mb-4">Support</h3>
          <ul className="text-sm space-y-2">
            <li>Contact: +94 11 234 5678</li>
            <li>Email: support@donsplaza.com</li>
            <li>Booking FAQ</li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-bold mb-4">Location</h3>
          <p className="text-sm">123 Cinema Road,<br />Colombo, Sri Lanka</p>
        </div>
      </div>
      <div className="text-center text-xs text-neutral-600 mt-16">© 2026 Dons Plaza Cinemas</div>
    </footer>
  );
}