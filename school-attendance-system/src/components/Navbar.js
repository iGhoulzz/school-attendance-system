import React from 'react';
import { Link } from 'react-router-dom';  // Added import for Link

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">[School Logo Placeholder]</div>
      <ul>
        <li><Link to="/login">Login</Link></li>  {/* Changed from <a> to <Link> */}
      </ul>
    </nav>
  );
}

export default Navbar;

