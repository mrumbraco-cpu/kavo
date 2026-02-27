# Dashboard Audit Report & Optimization Plan

## 1. Vercel React Best Practices Audit

### A. Data Fetching & Waterfalls
- **Sequential Awaits**: [DashboardLayout](file:///c:/Users/mrtua/Downloads/spshare/app/dashboard/layout.tsx#6-42) and several pages (Listings, Coins, Profile) use sequential awaits for [requireAuth](file:///c:/Users/mrtua/Downloads/spshare/lib/auth/requireAuth.ts#5-28), profile fetching, and resource fetching, creating unnecessary waterfalls.
- **Redundant Fetches**: The user profile is fetched multiple times across the layout and pages. [requireAuth](file:///c:/Users/mrtua/Downloads/spshare/lib/auth/requireAuth.ts#5-28) also performs a profile fetch to check lock status.
- **Dynamic Optimization**: Some pages could benefit from `generateMetadata` optimizations and better use of Server Components.

### B. Component Architecture
- **Code Duplication**: [DashboardHeader](file:///c:/Users/mrtua/Downloads/spshare/components/dashboard/DashboardHeader.tsx#24-218) and [DashboardSidebar](file:///c:/Users/mrtua/Downloads/spshare/components/dashboard/DashboardSidebar.tsx#30-179) share ~90% of their logic (logout, active link detection, menu items).
- **Client/Server Split**: Generally good, but some components could be further decomposed to minimize the client-side bundle.

### C. State Management
- Form states in [ProfileContent](file:///c:/Users/mrtua/Downloads/spshare/components/dashboard/ProfileContent.tsx#13-313) and [ListingForm](file:///c:/Users/mrtua/Downloads/spshare/components/listings/ListingForm.tsx#68-1284) are manually managed. While fine for simple forms, they lack standardized validation patterns.

## 2. Web Interface Guidelines & UI/UX Audit

### A. Consistency & Branding
- **Typography**: Ellipsis usage (`...` instead of `…`) is inconsistent with the Public section.
- **Formatting**: Local [formatPrice](file:///c:/Users/mrtua/Downloads/spshare/lib/utils/format.ts#39-47) or `toLocaleString` implementations are scattered across [app/dashboard/listings/page.tsx](file:///c:/Users/mrtua/Downloads/spshare/app/dashboard/listings/page.tsx) and [app/dashboard/coins/page.tsx](file:///c:/Users/mrtua/Downloads/spshare/app/dashboard/coins/page.tsx) instead of using the centralized `@/lib/utils/format.ts`.
- **Date Standardization**: Dates are formatted locally using `toLocaleDateString` without a unified helper.

### B. Accessibility (A11y)
- **Decorative Icons**: Many Lucide icons in the dashboard lack `aria-hidden="true"`.
- **Button Types**: Several interactive elements lack explicit `type="button"` or `type="submit"`.
- **Focus States**: Dashboard inputs and buttons could use more premium focus-visible rings (`ring-premium-900/10`).

### C. Micro-interactions
- **Tactile Feedback**: Missing `active:scale-95` on dashboard navigation items and action buttons.
- **Skeleton States**: Some data-heavy sections could use better loading skeletons during transitions.

## 3. Implementation Plan

### Phase 1: Infrastructure & Data Fetching (High Priority)
1. **Refactor [requireAuth](file:///c:/Users/mrtua/Downloads/spshare/lib/auth/requireAuth.ts#5-28)**: Enhance it to return the full profile if needed, or parallelize its internal checks.
2. **Parallelize Layout Fetching**: Use `Promise.all` in `DashboardLayout.tsx`.
3. **Parallelize Page Fetching**: Update [app/dashboard/listings/page.tsx](file:///c:/Users/mrtua/Downloads/spshare/app/dashboard/listings/page.tsx) and [app/dashboard/coins/page.tsx](file:///c:/Users/mrtua/Downloads/spshare/app/dashboard/coins/page.tsx) to use parallel data fetching.

### Phase 2: UI Standardization (Medium Priority)
1. **Unify Formatting**: Replace all local price/currency/date formatting with `@/lib/utils/format.ts`.
2. **Standardize Typography**: Replace `...` with `…` in all dashboard text and placeholders.
3. **Refactor Shared Logic**: Create a `useDashboardNav` hook or shared utility for Header/Sidebar.

### Phase 3: A11y & Polish (Medium Priority)
1. **A11y Audit**: Add `aria-hidden="true"` to all decorative icons.
2. **Focus/Active States**: Apply standardized premium styling to all dashboard interactive elements.
3. **Standardize Badges**: Use central status badge components if possible to ensure contrast ratios.

---

## Next Steps:
1. Start with `DashboardLayout.tsx` parallelization.
2. Fix [app/dashboard/listings/page.tsx](file:///c:/Users/mrtua/Downloads/spshare/app/dashboard/listings/page.tsx) price formatting and data waterfall.
3. Standardize [DashboardSidebar](file:///c:/Users/mrtua/Downloads/spshare/components/dashboard/DashboardSidebar.tsx#30-179) and [DashboardHeader](file:///c:/Users/mrtua/Downloads/spshare/components/dashboard/DashboardHeader.tsx#24-218).
