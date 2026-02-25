## Packages
recharts | Dashboard charts for attendance/stats
date-fns | Date formatting and manipulation
react-day-picker | Calendar component for attendance date selection
clsx | Class name utility (often used with tailwind-merge)
tailwind-merge | Class name merging
framer-motion | Smooth animations for page transitions and components
@radix-ui/react-dialog | Modal dialogs for forms
@radix-ui/react-dropdown-menu | Dropdown menus
@radix-ui/react-select | Select inputs for forms
@radix-ui/react-label | Form labels
@radix-ui/react-slot | Component composition
@radix-ui/react-tabs | Tab interfaces
@radix-ui/react-avatar | User avatars
@radix-ui/react-popover | Popovers for date pickers etc
@radix-ui/react-radio-group | Radio buttons for attendance

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  body: ["var(--font-body)"],
}
Authentication uses Replit Auth (OpenID Connect).
API paths are defined in @shared/routes.
User roles are 'admin', 'teacher', 'student'.
