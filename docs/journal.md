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


### 2026-11-22 - 
- add helmet to backend
- add pino logger for http and application error
- add cors
- standard api response
- add user and session model
- auth route


### 2026-11-23 - continueWithGoogle
- add google oauth
- when users will click login button -> request GET /api/auth/google and it will redirect user to google page with a state cookie token
- user conset on google page and gets redirected back to /api/auth/google/callback
- match the state token that google returned in the query param and one in the user's cookie that was set earlier
- get google tokens and verify them
- upsert the user in the db
- create a refresh token and put it in the db, deliver with cookie
- if its a new user redirect to onboarding page, old user to home page

### 2026-11-24 - still auth
- add refresh route to rotate tokens
- add me endpoint to get the user info

## future work identified now
- CI pipeline to do typecheck and linting and build
- multistage dockerfile
- handling db connection pooling
- shutting down db connections on shutdown of app
- rate limiting 
- frontend will need to handle login failed