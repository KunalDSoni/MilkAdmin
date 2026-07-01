# Product Scope — Moderns Fresh Platform: Path to Spec Parity
**PM:** scoping doc · **Date:** 2026-07-01 · **Status:** for review

## Context
The Admin web + API now cover the core operational spec (onboarding, role scoping,
sample orders, payments, order-summary export, order deadline, product rules, order
review metadata). Two things remain before we're spec-complete:
1. The **field experience** (Distributor + Sales Officer) doesn't yet surface any of it.
2. Two **foundational capabilities** (real auth, file uploads) are still stubbed.

**Key architecture decision:** there is **one client app** — the Expo/React Native
codebase renders on iOS, Android, *and* web from the same source. So the spec's
"Distributor responsive web portal" and "mobile app" are **the same deliverable**.
We build once; it ships everywhere.

---

## Goals & non-goals
**Goals**
- Field roles can do their whole job in the app: onboard, order, sample, get paid, settle.
- Every capability already in the backend is reachable by the role that needs it.
- Data captured in the field (proofs, licenses) is real, not placeholder text.

**Non-goals (this phase)**
- Reports & Analytics dashboards — *explicitly out of scope per the business doc (§7)*.
- A separate distributor web portal — covered by the one app on web.
- Payments/invoicing integration with external finance systems — future.

---

## Epics & priorities

### Epic 1 — Foundations (unblocks "real" usage)
*Why: onboarding and payments look done but aren't trustworthy until credentials and
proof images are real.*

| Story | Outcome | Pri |
|---|---|---|
| **Password auth + Change Password** | Users log in with credentials shared offline (per spec), not OTP; every portal has Change Password. | P0 |
| **File uploads (MinIO)** | Shop-license and payment-proof images actually upload and render, replacing the paste-a-key stopgap. | P0 |

**Acceptance:** a user set up by an onboarder can log in and change their password; an
uploaded license/proof image is viewable in Admin.

---

### Epic 2 — Field App (one RN app: mobile + web)
*Why: this is the largest user-facing gap. Everything built so far is invisible to
Distributors and Sales Officers until it's surfaced here.*

| Story | Outcome | Pri |
|---|---|---|
| **In-app onboarding** | SO onboards distributors/retailers with the full spec field set + PENDING→PROSPECTIVE→ONBOARDED→REJECTED lifecycle (today's `customers/new` is a thin subset). | P0 |
| **Self-orders** | Distributor places a hawker/self-order, tagged distinctly, through the same approval flow. | P0 |
| **Payment logging** | Distributor records a payment to their SO with a proof image; sees PAID/PENDING status. | P0 |
| **Sample orders / assign samples** | SO places and assigns samples to prospects in the field. | P1 |
| **Order deadline awareness** | App shows the cut-off and blocks submission after it. | P1 |
| **Reject reason visibility** | A rejected order shows who rejected it and why. | P1 |
| **Consolidated / default order check** | Confirm per-retailer default order + distributor consolidation match spec §2 (Distributor). | P1 |

**Acceptance:** a Sales Officer can, on a phone, onboard a retailer end-to-end and
assign a sample; a Distributor can place a self-order and log a payment with a photo —
all reflected in Admin.

---

### Epic 3 — Admin polish (close the long tail)
*Why: the modules work but have rough edges the spec calls out.*

| Story | Outcome | Pri |
|---|---|---|
| **Edit onboarded records** | Amend any onboarding field after creation (today: create + status only). | P1 |
| **Retailer default-order preset** (§2.1.4) | Pre-set per-product default quantities during retailer onboarding. | P1 |
| **Filters: Area / Route / Status** (§2.7) | Filter user tabs, not just search. | P2 |
| **Inactive ⇒ force logout + block** (§2.9) | Suspending a user revokes their session. | P2 |
| **Reconcile `/users` with `/distributors` + `/retailers`** | Remove duplication between new onboarding UI and older list pages. | P2 |
| **Order "View" area/retailer breakdown** (§4.3.4) | Group order detail by area/retailer. | P2 |
| **Brands / products as dropdowns** | Replace comma-text with proper pickers. | P2 |

---

## Sequencing (recommended)
```
Phase 1  Foundations      → Password auth · File uploads
Phase 2  Field App core   → In-app onboarding · Self-orders · Payment logging   (P0)
Phase 3  Field App +      → Samples · Deadline · Reject reason · Consolidation   (P1)
Phase 4  Admin polish     → Edit · Default-order · Filters · Reconcile · etc.
```
Rationale: uploads + auth make Epic 2 land as "real"; Field App is the biggest user
value; Admin polish is a fast cleanup cluster to finish on.

## Dependencies & risks
- **Auth is a hard dependency** for Change Password and for the field-app login story;
  sequence it before Epic 2's login-sensitive flows or accept OTP in the app short-term.
- **Uploads block** the "real proof/license" acceptance criteria in both epics.
- **One-app assumption** relies on Expo web parity — validate any native-only APIs
  (camera for proof capture) degrade gracefully on web.
- **Reject-reason / deadline** are already in the API, so Epic 2's P1 items are thin
  client work.

## Effort (t-shirt)
- Epic 1: **L** (auth) + **M** (uploads)
- Epic 2: **L** (comparable to the Admin build just completed)
- Epic 3: **M** (cluster of S/M)

---

## Already delivered (context — the baseline this scope builds on)
Admin web + API modules shipped on `feat/onboarding-and-scope`:
onboarding engine (4 roles + lifecycle), role scoping, sample orders, payment logs
(admin PAID toggle), area-wise order summary + Excel export, global order deadline,
product crate/unit + min/max + unique name, order approve/reject metadata, and
distributor self-order tagging.
