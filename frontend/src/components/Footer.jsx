import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4">
        <div>
          <h3 className="text-lg font-semibold">COSRX</h3>
          <p className="mt-2 text-gray-400">
            Your beauty, our passion. Discover the best in skincare.
          </p>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.56c-.89.39-1.84.65-2.84.77a4.92 4.92 0 002.16-2.72c-.95.56-2 .97-3.12 1.19a4.9 4.9 0 00-8.35 4.47A13.92 13.92 0 011.67 3.15a4.9 4.9 0 001.52 6.54c-.79-.02-1.54-.24-2.19-.61v.06a4.9 4.9 0 003.94 4.8c-.41.11-.84.17-1.28.17-.31 0-.61-.03-.91-.09a4.9 4.9 0 004.58 3.4A9.85 9.85 0 010 19.54a13.9 13.9 0 007.55 2.21c9.06 0 14.01-7.51 14.01-14.01 0-.21 0-.42-.02-.63A10 10 0 0024 4.56z" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.04c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm-5.5 15.5v-5.5h-2v-2h2v-2c0-2.21 1.79-4 4-4h2v2h-2c-1.1 0-2 .9-2 2v2h2l-1 2h-1v5.5h-2z" />
              </svg>
            </a>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Menu</h3>
          <ul className="mt-2 space-y-2">
            <li>
              <a href="#" className="text-gray-400 hover:text-white">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-white">
                About
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-white">
                Products
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-white">
                Contact
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Help</h3>
          <ul className="mt-2 space-y-2">
            <li>
              <a href="#" className="text-gray-400 hover:text-white">
                FAQ
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-white">
                Shipping & Returns
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-white">
                Terms & Conditions
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-400 hover:text-white">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Contact Us</h3>
          <ul className="mt-2 space-y-2">
            <li className="text-gray-400">123 Beauty Lane, Skincare City</li>
            <li className="text-gray-400">support@cosrx.com</li>
            <li className="text-gray-400">+1 (123) 456-7890</li>
          </ul>
        </div>
      </div>
      <div className="mt-8 text-center text-gray-400">
        <p>© 2025 COSRX. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
