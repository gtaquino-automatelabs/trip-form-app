# 📋 Story Creation Policy - BMAD Method

## The Golden Rule: One Epic Ahead

> **"Draft one epic ahead, no more."**

### Current Status
- **Epic 1 (Foundation):** 4/4 stories created ✅, 0/4 implemented 🔄
- **Epic 2 (Form Flow):** 0/8 stories created ⏸️ - **WAIT until Epic 1 is 75% done**
- **Epic 3 (File/Submit):** Not started ⏸️
- **Epic 4 (Admin):** Not started ⏸️

### When to Create Next Epic's Stories

Create Epic 2 stories when Epic 1 reaches **75% complete**:
- ✅ At least 3 of 4 stories marked "Done" in Dev Agent Record
- ✅ Review all implementation notes from Epic 1
- ✅ Core authentication is working

### Why This Rule Exists

1. **Stories stay fresh** - No stale documentation
2. **Learn from implementation** - Real insights inform next stories  
3. **Reduce waste** - Don't plan what might change
4. **Build momentum** - Focus on doing, not planning

### Quick Check for Agents

Before creating any story, check:
```
IF (current_epic_completion < 75%) {
  CREATE stories only in current epic
} ELSE {
  ALLOWED to create first story of next epic
  MUST review Dev Agent Records first
}
```

### Full Rules Location
Detailed workflow rules: `.bmad-core/workflows/story-creation-rules.md`

---
*This policy ensures maximum value from the BMAD Method's iterative approach.*