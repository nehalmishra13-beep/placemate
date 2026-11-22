# PlaceMate API

Base path: `/api`. Responses are `{ "success": true, "data": ... }` or `{ "success": false, "message": "..." }`. Lists add `"pagination": { total, page, limit, totalPages }`.

Every **POST / PUT / PATCH / DELETE** request must send `Content-Type: application/json` and the header `X-Requested-With: PlaceMate`, otherwise it gets `403`.
Login uses an HttpOnly session cookie (`placemate.sid`).

Status codes: `200` ok, `201` created, `400` validation error, `401` not logged in, `403` not allowed, `404` not found, `409` duplicate, `429` too many requests, `500` server error.

## Auth
| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | /auth/register | no | name, email, password | Password: 8+ chars, 1 uppercase, 1 number. `role` is ignored. 201, or 409 if the email exists |
| POST | /auth/login | no | email, password | 401 with a generic message on failure |
| POST | /auth/logout | no | | |
| GET | /auth/me | yes | | Current user `{ id, name, email, role }` |

## Public
| Method | Path | Notes |
|---|---|---|
| GET | /stats | Counts of companies, questions, reported vs practice questions, users |
| GET | /companies?search= | Company list with `questionCount` and `reportedCount` |
| GET | /companies/:slug | Profile: overview, roles, `hiringProcess`, `hiringSources`, topics, `dataNote`, `evidence` counts |
| GET | /questions | Query: `search`, `company` (slug or `general`), `category`, `difficulty`, `round`, `evidence`, `page`, `limit` (max 50). Logged-in users also get `userStatus` and `isBookmarked` |
| GET | /questions/filters | Values for the filter dropdowns |
| GET | /questions/:id | Detail with sources, explanation, tested code, related questions. Logged-in users also get `userStatus`, `isBookmarked`, `userNote` |

## Logged-in user (always limited to the session user's own data)
| Method | Path | Body |
|---|---|---|
| POST | /progress | `{ questionId, status: "attempted" \| "solved" }` (updates the existing record; increases `attemptCount`) |
| DELETE | /progress/:questionId | |
| GET | /bookmarks | |
| POST | /bookmarks | `{ questionId }` (idempotent) |
| DELETE | /bookmarks/:questionId | |
| GET | /notes/:questionId | Returns `null` data when there is no note |
| PUT | /notes/:questionId | `{ content }` (max 5000, empty deletes the note) |
| DELETE | /notes/:questionId | |
| POST | /reports | `{ targetType: "question" \| "company", targetId, reason, description? }` |
| GET | /dashboard | `stats` (attempted, solved, accuracy = solved / attempted, bookmarks), `topicProgress`, `companyProgress`, `weeklyActivity` (7 days), `recent` |

## Admin (role `admin`, otherwise 403)
| Method | Path | Body |
|---|---|---|
| GET | /admin/stats | users, companies, questions, hidden questions, pending reports |
| GET | /admin/reports?status=pending | |
| PATCH | /admin/reports/:id | `{ status: "resolved" \| "dismissed", adminNote? }` |
| PATCH | /admin/questions/:id | `{ isActive: true \| false }` (hide or restore) |
