export const severityRank = {
  blocker: 4,
  major: 3,
  'needs-design-decision': 3,
  minor: 2,
  debt: 1,
  info: 0,
};

export function makeFinding({
  severity = 'info',
  type = 'info',
  title,
  file,
  line,
  selector,
  evidence,
  observed,
  expected,
  impact,
  recommendation,
  verification,
  meta = {},
}) {
  return {
    severity,
    type,
    title: title || type,
    file,
    line,
    selector,
    evidence,
    observed,
    expected,
    impact,
    recommendation,
    verification,
    meta,
  };
}

export function sortFindings(findings) {
  return [...findings].sort((a, b) => {
    const rank = (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
    if (rank !== 0) return rank;
    return String(a.file || '').localeCompare(String(b.file || ''));
  });
}

export function countBySeverity(findings) {
  return findings.reduce((acc, finding) => {
    const key = finding.severity || 'info';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

export function verdictFromFindings(findings) {
  const counts = countBySeverity(findings);
  if ((counts.blocker || 0) > 0) return 'Fail';
  if ((counts.major || 0) > 0) return 'Fail';
  if ((counts['needs-design-decision'] || 0) > 0) return 'Inconclusive';
  if ((counts.minor || 0) > 0 || (counts.debt || 0) > 0) return 'Pass with warnings';
  return 'Pass';
}
