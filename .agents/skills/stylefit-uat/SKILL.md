---
name: stylefit-uat
description: Prepare or execute StyleFit AI user acceptance tests and PO handoffs for a build or milestone, including feature-to-scenario mapping and actual evidence. Use for testing, completion checks, or release review, not to expand the feature scope.
---

# StyleFit acceptance testing

Read `TESTING.md` and the relevant milestone in `ROADMAP.md`. Confirm which features actually exist on the build before choosing scenarios.

- Map changed features to user scenarios and PO criteria. Preserve the distinction between technical checks, observed usability, and owner acceptance.
- Identify the build or commit, environment, enabled scope, and test data. Use a participant code rather than personal photos or measurements in the report.
- Give tasks that express a user goal without explaining the buttons. Record assistance, unexpected results, and reasons an outfit is rejected.
- Capture actual outcomes and evidence. Use Belum diuji, Lulus, Gagal, Terblokir, or Belum tersedia accurately. Automated passing does not fill in manual results.
- For landing work, verify changes in preview and the CTA handoff rather than only opening the homepage. Check keyboard and reduced motion separately.
- For data or AI workflows, include relevant failure, ownership, pricing, correction, and deletion cases from TESTING.

Finish with what changed, which checks ran, reproducible steps for the owner, unresolved findings, and the corresponding release recommendation. Leave owner approval pending until given; do not invent evidence or mark roadmap acceptance complete on the basis of a proposed test plan.
