# Story Creation Workflow Rules

## Core Principle: Just-In-Time Story Creation

### The One Epic Ahead Rule

**CRITICAL RULE:** Draft one epic ahead, no more.

This rule ensures stories remain fresh, relevant, and informed by actual implementation experience.

## Story Creation Timing Guidelines

### When to Create Next Epic's Stories

Create the next epic's stories when the current epic reaches **~75% completion**, specifically:

1. **Completion Indicators:**
   - At least 3 of 4 stories in current epic have status "Done" 
   - OR the epic's core functionality is operational
   - OR Dev Agent Records show stable implementation patterns

2. **Prerequisites Before Creating Next Epic:**
   - Review all Dev Agent Records from current epic
   - Extract "Completion Notes" and "Debug Log References" 
   - Identify technical decisions that affect next epic
   - Document any architecture deviations discovered

3. **Information to Carry Forward:**
   - Actual file paths created (may differ from planned)
   - Dependency versions that actually worked
   - Patterns that emerged during implementation
   - Performance considerations discovered
   - Security measures implemented

## Implementation Status Tracking

### Current Project Status
- **Epic 1:** Foundation & Authentication Infrastructure
  - Stories Created: 4/4 (100%)
  - Stories Implemented: 0/4 (0%)
  - Status: READY FOR IMPLEMENTATION

### Next Epic Queue
- **Epic 2:** Core Form Flow & Data Capture
  - Stories Created: 0/8 (0%)
  - Trigger: Create when Epic 1 reaches 75% complete
  
- **Epic 3:** File Handling & Form Submission  
  - Stories Created: 0/X
  - Trigger: Create when Epic 2 reaches 75% complete

- **Epic 4:** Administrative Dashboard
  - Stories Created: 0/X
  - Trigger: Create when Epic 3 reaches 75% complete

## Workflow Automation Rules

### For Scrum Master Agent (sm)

When executing `create-next-story` task:

1. **FIRST** check this file for current epic completion status
2. **IF** current epic < 75% complete:
   - Only create stories within current epic
   - Alert user if trying to jump to next epic prematurely
   
3. **IF** current epic >= 75% complete:
   - Allow creation of next epic's first story
   - Remind to review Dev Agent Records first
   - Update this file with new epic progress

### For Product Owner Agent

When reviewing story readiness:
- Verify previous epic is substantially complete
- Ensure Dev Agent Records have been reviewed
- Confirm technical learnings are incorporated

## Anti-Patterns to Avoid

❌ **DO NOT:**
- Create all stories upfront (they become stale)
- Skip Dev Agent Record review (loses learning)
- Jump epics without completing current one
- Create stories without implementation context

✅ **DO:**
- Create stories just-in-time
- Review implementation artifacts before next epic
- Let technical discoveries inform story details
- Maintain momentum between planning and doing

## Exception Scenarios

### When to Override the Rule

Only override the "one epic ahead" rule when:
1. Critical dependency discovered requiring different epic order
2. Stakeholder explicitly requests different prioritization
3. Technical blocker requires pivoting to different epic

### Override Process
1. Document reason in this file
2. Update epic queue order
3. Note which Dev Agent Records to review later

---

## Monitoring Instructions

**For All BMAD Agents:** 
- Check this file before creating any story
- Update completion percentages after each story status change
- Alert if someone attempts to violate the one-epic-ahead rule

**Update Frequency:**
- After each story moves to "Done"
- When starting new story creation
- During epic planning sessions

---

*Last Updated: 2025-08-11*
*Rule Author: Bob (Scrum Master)*
*Approval: Pending implementation of Epic 1*