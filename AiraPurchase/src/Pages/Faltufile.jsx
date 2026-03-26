<li>
  <h6 className="text-secondary fw-bold small mb-2">Location Master</h6>
  <button
    className="btn d-flex justify-content-between align-items-center w-100 text-start fw-semibold text-primary"
    onClick={() => toggleSection('locationMaster')}
    style={{ fontSize: '1rem' }}
  >
    <span className="d-flex align-items-center gap-2">
      <i className="bi bi-geo-alt-fill" />
      Location Master
    </span>
    <span>
      {expandedSection === 'locationMaster'
        ? <i className="bi bi-dash" />
        : <i className="bi bi-plus" />}
    </span>
  </button>

  <div
    className={`collapse ${expandedSection === 'locationMaster' ? 'show' : ''} ps-3 mt-2 rounded shadow-sm bg-white`}
  >
    <ul className="list-unstyled small">
      <li className="mb-2">
        <NavLink
          to="/dashboard/locationMaster/record"
          className={({ isActive }) =>
            "nav-link py-2 px-3 rounded d-block " +
            (isActive
              ? "bg-primary text-white border-start border-3 border-white"
              : "text-dark")
          }
        >
          Location Records
        </NavLink>
      </li>
      <li className="mb-2">
        <NavLink
          to="/dashboard/locationMaster/create"
          className={({ isActive }) =>
            "nav-link py-2 px-3 rounded d-block " +
            (isActive
              ? "bg-primary text-white border-start border-3 border-white"
              : "text-dark")
          }
        >
          Create Location
        </NavLink>
      </li>
    </ul>
  </div>
</li>
