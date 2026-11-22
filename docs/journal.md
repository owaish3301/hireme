# hireme — build journal

A job application tracker that reads my own Gmail and keeps my applications,
status changes and follow-ups in one place.

Raw notes at milestones — decisions, mistakes, what I'd do differently.
The polished version of this becomes the portfolio case study.

---

## 2026-11-20 — planning: spec first, code later

Wrote the full spec before touching code — 16 sections covering auth, the
Kanban board, the status timeline, Gmail sync, detection, the review queue,
reminders. And decided on the MVP.

### 2026-11-21 - Initialization of the project

- choose turborepo, because
    - i want only 1 repo in github for frontend, backend, workers, might be landing page later
    - sharing types between frotend and backend
    - sharing ui components between the application and the landing page
    - shared configs for liniting typescript

- using react for application - coz i dont want seo of the application itself, seo matters for landing page only for me so choosing react for application wont hurt me and would be easier to distribute as static files
- using express for backend - i am comfortable with express more than any other backend framework or library, did not choose golang because i want this project to be polished and i am in very early learning stage of golang


Docker call: for now need only postgres + redis(depends on mvp system design) for the backend. at deployment will see what to dockerise.
added modular monolithic architecture
added graceful shutdown


future work identified now
- CI pipeline to do typecheck and linting and build
- multistage dockerfile
- handling db connection pooling
- shutting down db connections on shutdown of app
- rate limiting 

### 2026-11-22 - 
- add helmet to backend
- add pino logger for http and application error
- add cors
- standard api response