const scenarios = [
  ["Response", "Error"],
  ["Connection", "Online"],
  ["Permission", "Member"],
  ["Delay", "1,500 ms"],
] as const

export function StateWorkbench() {
  return (
    <figure className="workbench" aria-labelledby="workbench-title">
      <div className="workbench__topline">
        <p className="workbench__title" id="workbench-title">
          Scenario specimen
        </p>
        <span className="workbench__status">
          <span className="status-dot" aria-hidden="true" />
          request.failed
        </span>
      </div>
      <div className="workbench__body">
        <div className="workbench__preview">
          <div className="state-message" role="status">
            <p className="state-message__code">ERR_USERS_FETCH</p>
            <h2>The user list could not be loaded.</h2>
            <p>Your filters are preserved. Retry becomes available here.</p>
          </div>
        </div>
        <div
          className="workbench__inspector"
          aria-label="Scenario configuration"
        >
          {scenarios.map(([label, value]) => (
            <div className="workbench__scenario" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="workbench__events">
        <p className="workbench__events-title">Transition record</p>
        <div className="workbench__event">
          <time>00:00.000</time>
          <span>loading.initial</span>
        </div>
        <div className="workbench__event">
          <time>00:01.500</time>
          <span>request.failed → error.visible</span>
        </div>
      </div>
      <figcaption className="workbench__footer">
        <span>Static foundation specimen</span>
        <span>Interactive simulator arrives with component integration</span>
      </figcaption>
    </figure>
  )
}
