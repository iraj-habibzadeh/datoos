// Reusable theme classes to reduce duplication across components
export const theme = {
  bg: {
    primary: 'bg-white dark:bg-gray-800 green-mode:bg-green-50',
    secondary: 'bg-gray-50 dark:bg-gray-900 green-mode:bg-green-100',
    page: 'bg-gray-50 dark:bg-gray-900 green-mode:bg-green-50',
    hover: 'hover:bg-gray-50 dark:hover:bg-gray-700 green-mode:hover:bg-green-100',
  },
  text: {
    primary: 'text-gray-900 dark:text-white green-mode:text-green-900',
    secondary: 'text-gray-600 dark:text-gray-400 green-mode:text-green-700',
    muted: 'text-gray-500 dark:text-gray-500 green-mode:text-green-600',
    inverse: 'text-white dark:text-gray-900 green-mode:text-green-50',
  },
  border: {
    primary: 'border-gray-200 dark:border-gray-700 green-mode:border-green-200',
    secondary: 'border-gray-300 dark:border-gray-600 green-mode:border-green-300',
  },
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 green-mode:bg-green-600 green-mode:hover:bg-green-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 green-mode:bg-green-100 green-mode:hover:bg-green-200 text-gray-700 dark:text-gray-300 green-mode:text-green-800',
  },
  input: {
    base: 'bg-white dark:bg-gray-800 green-mode:bg-green-50 border-gray-300 dark:border-gray-600 green-mode:border-green-300 text-gray-900 dark:text-white green-mode:text-green-900',
  },
} as const;
