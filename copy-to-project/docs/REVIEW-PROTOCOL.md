# Code Review Protocol
> How to review code effectively and efficiently

---

## 🎯 Purpose

Code reviews ensure quality, share knowledge, and catch issues before production. This protocol ensures reviews are:
- **Thorough** - Nothing important missed
- **Efficient** - Not wasting anyone's time
- **Constructive** - Helping team improve
- **Consistent** - Same standards for everyone

---

## 👥 Roles & Responsibilities

### Code Author
**Your responsibilities:**
- Submit complete, working code
- Pass all quality gates before requesting review
- Provide context in PR description
- Address feedback professionally
- Update PR based on feedback

### Reviewer
**Your responsibilities:**
- Review within 24 hours
- Check thoroughly but pragmatically
- Provide constructive feedback
- Approve when ready, block when not
- Explain reasoning for feedback

---

## 📝 Before Requesting Review

### Author's Self-Review Checklist

#### 1. Quality Gates
- [ ] All quality gates passed (see QUALITY-GATES.md)
- [ ] Build successful
- [ ] Tests passing
- [ ] Linting clean
- [ ] Type check passed

#### 2. Code Review
- [ ] Read your own code line-by-line
- [ ] Remove debug code (console.logs, etc.)
- [ ] Remove commented code
- [ ] Check for typos
- [ ] Verify naming makes sense

#### 3. Documentation
- [ ] PR description complete (see template below)
- [ ] Code comments added where needed
- [ ] README updated if needed
- [ ] SESSION-CONTEXT.md updated

#### 4. Testing Evidence
- [ ] Screenshots/videos for UI changes
- [ ] API testing evidence (Postman, curl)
- [ ] Test coverage report if relevant

---

## 📋 Pull Request Template

```markdown
## Description
Brief description of what this PR does and why.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Related Issues
Closes #123
Relates to #456

## Changes Made
- Added user authentication
- Implemented JWT tokens
- Updated user model

## Testing
### Manual Testing
- [ ] Tested login flow
- [ ] Tested logout
- [ ] Tested token refresh
- [ ] Tested error cases

### Automated Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] All tests passing

## Screenshots/Videos
(For UI changes)

## Database Changes
- [ ] Migration script included
- [ ] Rollback tested
- [ ] Staging database updated

## Security Checklist
- [ ] SECURITY-CHECKLIST.md reviewed
- [ ] Input validation added
- [ ] Authorization checked
- [ ] No hardcoded secrets

## Performance Impact
- [ ] No N+1 queries
- [ ] Database indexes added if needed
- [ ] Bundle size impact: +X KB / -Y KB
- [ ] Performance tested

## Documentation
- [ ] Code comments added
- [ ] API docs updated
- [ ] README updated
- [ ] SESSION-CONTEXT updated

## Deployment Notes
Any special instructions for deployment?

## Reviewer Notes
Anything specific reviewers should focus on?
```

---

## 🔍 Review Process

### Step 1: Context Review (2-5 minutes)
- [ ] Read PR description
- [ ] Understand the problem being solved
- [ ] Check related issues/tickets
- [ ] Review deployment notes

### Step 2: High-Level Review (5-10 minutes)
- [ ] **Architecture** - Does approach make sense?
- [ ] **Scope** - PR focused on one thing?
- [ ] **Breaking changes** - Any API changes?
- [ ] **Performance** - Any obvious bottlenecks?
- [ ] **Security** - Any red flags?

**If high-level issues found:** Stop and request changes

### Step 3: Detailed Code Review (15-30 minutes)

#### Code Quality
- [ ] Follows CODING-STANDARDS.md
- [ ] Proper naming conventions
- [ ] Functions are small and focused
- [ ] No code duplication
- [ ] Error handling present
- [ ] Edge cases handled

#### Security
- [ ] SECURITY-CHECKLIST.md items checked
- [ ] Input validation present
- [ ] No SQL injection risks
- [ ] No XSS vulnerabilities
- [ ] Authentication/authorization correct
- [ ] No hardcoded secrets

#### Testing
- [ ] Tests cover new code
- [ ] Tests are meaningful (not just for coverage)
- [ ] Edge cases tested
- [ ] Mocks used appropriately
- [ ] Test names clear

#### Performance
- [ ] No N+1 queries
- [ ] Proper database indexing
- [ ] No unnecessary computations
- [ ] Efficient algorithms
- [ ] Caching where appropriate

#### Maintainability
- [ ] Code is readable
- [ ] Comments explain "why" not "what"
- [ ] No magic numbers
- [ ] Proper abstraction level
- [ ] Documentation adequate

### Step 4: Functional Review (10-20 minutes)
- [ ] Pull branch locally
- [ ] Run application
- [ ] Test happy path
- [ ] Test edge cases
- [ ] Test error handling
- [ ] Check UI/UX (if applicable)

### Step 5: Final Checks (5 minutes)
- [ ] All review comments addressed
- [ ] No new quality gate failures
- [ ] Commit history clean
- [ ] Ready for merge

---

## 💬 Providing Feedback

### Feedback Types

#### 1. **MUST FIX** (Blocking)
Use when:
- Security vulnerability
- Breaking change without discussion
- Violates coding standards
- Missing critical test

```markdown
🚨 **MUST FIX:** This endpoint doesn't validate user input,
which could lead to SQL injection. Please add validation
using class-validator.
```

#### 2. **SHOULD FIX** (Strong suggestion)
Use when:
- Code smell
- Performance concern
- Better approach exists
- Missing test coverage

```markdown
💡 **SHOULD FIX:** This function is getting long (80 lines).
Consider breaking it into smaller functions for readability.
```

#### 3. **CONSIDER** (Optional improvement)
Use when:
- Minor optimization
- Alternative approach
- Future enhancement
- Personal preference

```markdown
🤔 **CONSIDER:** We could use a Map here instead of an array
for O(1) lookups, though it's not critical for this use case.
```

#### 4. **QUESTION** (Need clarification)
Use when:
- Don't understand intent
- Missing context
- Unusual approach

```markdown
❓ **QUESTION:** Why are we using setTimeout here?
Is there a race condition we're working around?
```

#### 5. **PRAISE** (Positive feedback)
Use when:
- Elegant solution
- Good test coverage
- Clear documentation
- Learning opportunity

```markdown
✨ **PRAISE:** Nice use of TypeScript generics here!
This makes the function very reusable.
```

### Feedback Best Practices

**DO:**
- ✅ Be specific - Point to exact lines
- ✅ Explain why - Help others learn
- ✅ Suggest solutions - Don't just point out problems
- ✅ Ask questions - Foster discussion
- ✅ Praise good work - Positive reinforcement

**DON'T:**
- ❌ Be vague - "This doesn't look right"
- ❌ Be personal - Attack the person, not the code
- ❌ Nitpick excessively - Pick your battles
- ❌ Block on style - Use auto-formatters
- ❌ Be sarcastic - Tone is hard in text

---

## ✅ Approval Criteria

### When to APPROVE ✅
- All "MUST FIX" items resolved
- Most "SHOULD FIX" items addressed or justified
- Quality gates passing
- Code is maintainable
- Security checklist complete
- Tests adequate

### When to REQUEST CHANGES 🔄
- Critical security issues
- Broken functionality
- Quality gates failing
- Missing tests for core logic
- Major architectural concerns
- Breaking changes without discussion

### When to COMMENT 💬
- Minor suggestions
- Questions for clarity
- Educational feedback
- Non-blocking concerns

---

## ⏱️ Review Time Guidelines

### PR Size Limits
- **Small:** < 100 lines → 15-30 minutes
- **Medium:** 100-300 lines → 30-60 minutes
- **Large:** 300-500 lines → 1-2 hours
- **Too Large:** > 500 lines → **Break it up**

**Rule:** If PR is > 500 lines, ask author to split it

### Response Times
- **Author Response:** Within 4 hours of feedback
- **Reviewer Response:** Within 24 hours of PR submission
- **Urgent PRs:** Within 2 hours (mark as urgent in title)

---

## 🔄 Review Workflow

### 1. PR Created
```
Author creates PR → Fills out template → Assigns reviewers
```

### 2. Review In Progress
```
Reviewer starts review → Leaves feedback →
Marks as "Request Changes" or "Approve"
```

### 3. Changes Requested
```
Author addresses feedback → Responds to comments →
Requests re-review
```

### 4. Approved
```
PR approved by reviewer(s) → Author merges →
Updates SESSION-CONTEXT.md
```

---

## 👥 Reviewer Selection

### Who Should Review?
- **Required:** At least 1 reviewer
- **Recommended:** 2 reviewers for critical code
- **Include:** Someone familiar with the area
- **Include:** Someone NOT familiar (fresh eyes)

### Review Assignment
- **Frontend changes:** Frontend expert
- **Backend changes:** Backend expert
- **Full-stack changes:** One of each
- **Security-critical:** Security expert
- **Database changes:** Senior developer

---

## 🎯 Common Review Patterns

### API Endpoint Review
```markdown
- [ ] Request validation (DTO)
- [ ] Response type defined
- [ ] Error handling
- [ ] Authentication required
- [ ] Authorization checked
- [ ] Rate limiting configured
- [ ] OpenAPI docs updated
- [ ] Integration test included
```

### UI Component Review
```markdown
- [ ] Responsive design
- [ ] Accessibility (ARIA, keyboard nav)
- [ ] Dark mode support
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] shadcn/ui components used
- [ ] PropTypes or TypeScript types
```

### Database Migration Review
```markdown
- [ ] Migration script tested
- [ ] Rollback script ready
- [ ] Indexes added
- [ ] No data loss
- [ ] Performance impact assessed
- [ ] Tested on staging
- [ ] Backup plan documented
```

---

## 🚫 Common Review Mistakes

### Reviewer Mistakes
- ❌ Reviewing too fast (missed issues)
- ❌ Nitpicking minor style issues
- ❌ Blocking on personal preferences
- ❌ Not testing code locally
- ❌ Ignoring security concerns
- ❌ Taking too long to review

### Author Mistakes
- ❌ PR too large
- ❌ Missing context in description
- ❌ Quality gates not passing
- ❌ Defensive about feedback
- ❌ Not responding to feedback
- ❌ Rushing to merge

---

## 🔧 Tools & Automation

### GitHub PR Checks (Automated)
- ✅ CI/CD pipeline passes
- ✅ Test coverage maintained
- ✅ No merge conflicts
- ✅ Branch up to date
- ✅ All conversations resolved

### Code Review Tools
- **GitHub:** Built-in review system
- **SonarQube:** Code quality metrics
- **Snyk:** Security vulnerabilities
- **Lighthouse CI:** Performance (frontend)

---

## 📊 Review Metrics

### Track Monthly
- Average PR size: ___ lines
- Average review time: ___ hours
- PR merge rate: ___%
- Comments per PR: ___
- Iteration count: ___

### Quality Indicators
- **Good:** Small PRs, quick reviews, few iterations
- **Warning:** Large PRs, slow reviews, many iterations
- **Problem:** PRs sitting for days, rubber-stamp approvals

---

## 🎓 Review Culture

### Team Values
1. **Respectful** - Always be kind
2. **Educational** - Share knowledge
3. **Thorough** - Don't rush
4. **Pragmatic** - Perfect is the enemy of good
5. **Collaborative** - We're on the same team

### Growth Mindset
- **Learn from reviews** - Both giving and receiving
- **Ask questions** - There are no stupid questions
- **Share knowledge** - Explain your reasoning
- **Admit mistakes** - Everyone makes them
- **Improve continuously** - Update this protocol

---

## 📚 Resources

- [Google's Code Review Guide](https://google.github.io/eng-practices/review/)
- [GitHub's Code Review Guide](https://github.com/features/code-review/)
- [The Art of Code Review](https://www.alexandra-hill.com/2018/06/25/the-art-of-giving-and-receiving-code-reviews/)

---

**Remember:** Code review is about improving code quality AND team collaboration. Be thorough, be kind, be helpful.

---

[END OF REVIEW-PROTOCOL.md]
