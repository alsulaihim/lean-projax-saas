# Port Allocation Guide
> Track ports across all your projects to avoid conflicts

## 🎯 Purpose

When running multiple projects simultaneously, each needs unique ports. This document helps you:
- Track port usage across all projects
- Avoid port conflicts
- Quickly identify available ports
- Document project-specific port assignments

---

## 📋 Port Allocation Template

**Copy this section for each new project:**

```markdown
### [PROJECT-NAME]
**Status:** Active/Inactive
**Started:** [DATE]

| Service      | Port  | Purpose                    |
|--------------|-------|----------------------------|
| Frontend     | XXXX  | Next.js dev server         |
| Backend      | XXXX  | NestJS API server          |
| Supabase     | N/A   | Cloud-hosted (or 54321 local) |
| Redis        | XXXX  | Cache/Sessions (optional)  |
| Other Service| XXXX  | Additional services        |

**Docker Compose Ports:**
- Frontend: `XXXX:3000`
- Backend: `XXXX:3000` (or internal port)
- Supabase (if local): `54321:54321`
```

---

## 🗂️ Port Registry

### Standard Port Ranges

```
Development Servers:   3000-3999
Staging Servers:       4000-4999
Microservices:         5000-5999
Supabase (local):      54321, 54322, 54323...
Redis:                 6379, 6380, 6381...
Testing:               8000-8999
```

---

## 📊 Current Projects

### Example Project 1
**Status:** Active
**Started:** 2024-01-15

| Service      | Port  | Purpose                    |
|--------------|-------|----------------------------|
| Frontend     | 3000  | Next.js dev server         |
| Backend      | 3001  | NestJS API server          |
| Supabase     | Cloud | Supabase hosted            |
| Redis        | 6379  | Sessions                   |

---

### Example Project 2
**Status:** Active
**Started:** 2024-02-01

| Service      | Port  | Purpose                    |
|--------------|-------|----------------------------|
| Frontend     | 3010  | Next.js dev server         |
| Backend      | 3011  | NestJS API server          |
| Supabase     | Cloud | Supabase hosted            |
| Redis        | 6380  | Sessions                   |

---

### [NEW PROJECT - ADD HERE]
**Status:**
**Started:**

| Service      | Port  | Purpose                    |
|--------------|-------|----------------------------|
| Frontend     |       |                            |
| Backend      |       |                            |
| Database     |       |                            |
| Redis        |       |                            |

---

## 🔍 Quick Port Finder

**To find available ports on your system:**

```bash
# Check if a port is in use (macOS/Linux)
lsof -i :3000

# Check all ports in use
lsof -i -P | grep LISTEN

# Check specific port range
lsof -i -P | grep LISTEN | grep :3[0-9][0-9][0-9]
```

**To kill a process using a port:**

```bash
# Find process ID
lsof -ti :3000

# Kill the process
kill -9 $(lsof -ti :3000)
```

---

## 💡 Port Allocation Strategy

### Option 1: Sequential by Project
- **Project 1:** 3000, 3001, 5432, 6379
- **Project 2:** 3010, 3011, 5433, 6380
- **Project 3:** 3020, 3021, 5434, 6381

### Option 2: By Hundreds
- **Project 1:** 3000, 3100, 3200
- **Project 2:** 3001, 3101, 3201
- **Project 3:** 3002, 3102, 3202

### Option 3: By Type
- **Development:** 3000-3099
- **Staging:** 4000-4099
- **Personal:** 5000-5099

**Choose the strategy that works best for you!**

---

## 🚨 Common Port Conflicts

### System Reserved Ports (Avoid)
- `80, 443` - HTTP/HTTPS
- `22` - SSH
- `3306` - Default MySQL
- `54321` - Supabase local (if not using)
- `6379` - Default Redis
- `8080` - Common alternative HTTP

### Commonly Used Ports (Check First)
- `3000` - Create React App, Next.js default
- `3001` - Common API server
- `4200` - Angular default
- `5000` - Flask default
- `8000` - Django default

---

## 📝 Best Practices

1. **Document Immediately** - Add port assignments as soon as you create a project
2. **Update Status** - Mark projects as inactive when not in use
3. **Check Before Start** - Always verify ports are available before starting services
4. **Use Docker** - Docker can handle port mapping automatically
5. **Environment Variables** - Store ports in `.env` files, never hardcode
6. **Team Coordination** - If working with a team, share this document

---

## 🔄 Maintenance

**Monthly:**
- Review and update project statuses
- Remove completed/archived projects
- Free up unused port assignments

**Before New Project:**
1. Check this document for available ports
2. Verify ports are actually free using `lsof`
3. Add new project entry immediately
4. Update TECH-STACK.md with assigned ports

---

## 📖 Related Documentation

- **TECH-STACK.md** - Port configuration in environment variables
- **SESSION-CONTEXT.md** - Current project ports
- **Docker docs** - Port mapping in compose files

---

**Last Updated:** [DATE]
**Maintained By:** [YOUR NAME]

[END OF PORT-ALLOCATION.md]
