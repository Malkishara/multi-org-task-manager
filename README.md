# TaskFlow

A multi-organization task management app. Users can belong to multiple organizations, each with its own members, projects, and tasks.

Within each organization, members have a role — Owner, Admin, or Member — that determines what they can do there: owners have full control over their organization, admins can manage projects and tasks, and members can work on tasks assigned to them. Projects track status and progress, and tasks can be assigned, searched, filtered by assignee, and moved through a status workflow from To Do through Done. A separate platform-level Super Admin role has unrestricted access across every organization in the system.

**Stack:** React + Redux (frontend), Spring Boot (backend), PostgreSQL,
Docker Compose.

## Setup

1. Clone the repo and `cd` into it.

2. Create a `.env` file in the project root:

   ```env
   POSTGRES_DB=taskflow
   DB_USERNAME=your_db_username
   DB_PASSWORD=your_db_password
   ```

3. Make sure Postgres is running locally and the database exists.

4. Start everything:

   ```bash
   docker compose up --build
   ```

5. Open the app:

   - Frontend: http://localhost
   - Backend API: http://localhost:8080

## Stop

```bash
docker compose down
```
