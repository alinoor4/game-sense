import { useState } from 'react';
import { useApi } from '../../hooks/useApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { api } from '../../lib/api.js';
import AdminNav from '../../components/AdminNav.jsx';

export default function AdminUsersPage() {
  usePageTitle('Admin: users');
  const { data, error, reload } = useApi('/admin/users');
  const { user: me } = useAuth();
  const [actionError, setActionError] = useState(null);

  async function run(method, user, body) {
    setActionError(null);
    try {
      await api(method, `/admin/users/${user.id}`, body);
      reload();
    } catch (err) {
      setActionError(err);
    }
  }

  function remove(user) {
    if (window.confirm(`Delete "${user.name}"? This cannot be undone.`)) run('DELETE', user);
  }

  if (error) {
    return (
      <div className="container">
        <p className="alert alert-error" role="alert">
          {error.message}
        </p>
      </div>
    );
  }
  if (!data) return <p className="container muted">Loading…</p>;

  return (
    <div className="container stack">
      <AdminNav />
      <h1>Users</h1>
      {actionError && (
        <p className="alert alert-error" role="alert">
          {actionError.message}
        </p>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((user) => {
              const isMe = user.id === me.id;
              return (
                <tr key={user.id}>
                  <td>
                    {user.name} {isMe && <span className="badge">You</span>}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      className="input"
                      aria-label={`Role of ${user.name}`}
                      value={user.role}
                      disabled={isMe}
                      onChange={(e) => run('PATCH', user, { role: e.target.value })}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button type="button" className="btn btn-small btn-danger" disabled={isMe} onClick={() => remove(user)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
