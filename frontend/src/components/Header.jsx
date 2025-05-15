import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

function Header() {
  return (
    <header className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3">
            <FaSearch className="text-2xl" />
            <span className="font-bold text-xl">DocSearch</span>
          </Link>
          
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link to="/" className="hover:text-gray-300">
                  Home
                </Link>
              </li>
              <li>
                <a href="/api-docs" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="hover:text-gray-300">
                  API Docs
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;