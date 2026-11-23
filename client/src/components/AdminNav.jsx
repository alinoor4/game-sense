import { NavLink } from 'react-router-dom';

export default function AdminNav() {
  return (
    <nav className="site-nav" aria-label="Admin">
      <NavLink to="/admin" end>Lessons</NavLink>
      <NavLink to="/admin/games">Games</NavLink>
      <NavLink to="/admin/maps">Maps</NavLink>
      <NavLink to="/admin/users">Users</NavLink>
    </nav>
  );
}
