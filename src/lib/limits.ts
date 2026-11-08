// Input limits shared by API validation and client-side form fields.
// Kept free of server imports so client components can use it.

/** Max lengths for user-entered text. */
export const LIMITS = {
  name: 100,
  email: 254,
  title: 120,
  description: 1000,
  feedbackText: 2000,
  chair: 100,
  id: 64,
} as const;

export const MINUTES = { min: 1, max: 120 } as const;
export const MAX_MINUTES = { min: 5, max: 240 } as const;
