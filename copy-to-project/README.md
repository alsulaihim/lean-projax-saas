# Copy This Folder to Each New Project

This folder contains the essential files you need to copy to every new project.

---

## 📋 Quick Start

### 1. Copy This Entire Folder

```bash
# From inside your new project root:
cp -r /path/to/copy-to-project/.ai .
cp -r /path/to/copy-to-project/docs .
cp /path/to/copy-to-project/AGENT-START-PROMPT.md .
```

### 2. Customize These Files (15-20 minutes)

**Must Customize:**

- [ ] `.ai/CLAUDE.md` - Fill in project name, stack versions, cloud provider
- [ ] `docs/PROJECT-BLUEPRINT.md` - Add your project details
- [ ] `docs/TECH-STACK.md` - Specify exact versions

**Initialize Empty:**

- [ ] `.ai/SESSION-CONTEXT.md` - Set initial state
- [ ] `.ai/DECISION-LOG.md` - Ready for first decisions
- [ ] `.ai/FEATURE-TRACKER.md` - Ready for scope tracking

### 3. Start Your First Session

Use the prompt from `AGENT-START-PROMPT.md`:

```
Please read .ai/CLAUDE.md carefully - it contains your complete configuration,
role definition, and behavior contract for this project.

After reading, please:
1. Confirm you understand your role and behavior expectations
2. Read .ai/SESSION-CONTEXT.md for the current project state
3. Summarize what we're working on and what the next steps are
```

---

## 📁 What's Included

### Core Configuration

- **AGENT-START-PROMPT.md** - Copy/paste this at every session start
- **.ai/CLAUDE.md** - Agent's "brain" and behavior contract
- **.ai/SESSION-CONTEXT.md** - Living document of current state
- **.ai/DECISION-LOG.md** - Track architectural decisions
- **.ai/FEATURE-TRACKER.md** - Track beyond-PRD features

### Documentation

- **docs/PROJECT-BLUEPRINT.md** - Architecture and locked decisions
- **docs/TECH-STACK.md** - Exact versions of all technologies

---

## 🎯 What About Other Documents?

The reference materials folder contains additional templates you can add when needed:

- **CODING-STANDARDS.md** - Add before writing significant code
- **SECURITY-CHECKLIST.md** - Add before building features
- **QUALITY-GATES.md** - Add before first commit
- **REVIEW-PROTOCOL.md** - Add for self-review process

**Don't add them all at once** - add them as they become relevant.

---

## ✅ Setup Checklist

- [ ] Copy entire folder to new project
- [ ] Customize .ai/CLAUDE.md
- [ ] Customize docs/PROJECT-BLUEPRINT.md
- [ ] Customize docs/TECH-STACK.md
- [ ] Initialize .ai/SESSION-CONTEXT.md with project phase
- [ ] Commit to git
- [ ] Test with first agent session using AGENT-START-PROMPT.md

---

## 💡 Tips

1. **Bookmark AGENT-START-PROMPT.md** - You'll use it every session
2. **Update SESSION-CONTEXT.md** at the end of every session
3. **Reference documents** in the reference-materials folder as needed
4. **Keep CLAUDE.md current** as your project evolves

---

## 🔗 Need More Details?

Check the reference-materials folder for:

- Complete documentation templates
- Detailed guides
- Security checklists
- Quality gate protocols
- And more!

---

**You're ready to start building! 🚀**
