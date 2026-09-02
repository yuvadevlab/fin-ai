export interface DefaultCategory {
  name: string;
  group: string;
  icon: string;
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  // Income
  { name: "Salary", group: "Income", icon: "💰" },
  { name: "Freelance & Consulting", group: "Income", icon: "💻" },
  { name: "Investments & Dividends", group: "Income", icon: "📈" },
  { name: "Other Income", group: "Income", icon: "💵" },

  // Fixed / Essentials
  { name: "Rent & Housing", group: "Fixed Expenses", icon: "🏠" },
  { name: "Groceries & Supermarket", group: "Fixed Expenses", icon: "🛒" },
  { name: "Electricity & Water", group: "Fixed Expenses", icon: "⚡" },
  { name: "Internet & Mobile", group: "Fixed Expenses", icon: "📱" },
  { name: "Insurance", group: "Fixed Expenses", icon: "🛡️" },

  // Variable / Daily
  { name: "Restaurants & Dining", group: "Variable Expenses", icon: "🍽️" },
  { name: "Food Delivery", group: "Variable Expenses", icon: "🛵" },
  { name: "Fuel & Petrol", group: "Variable Expenses", icon: "⛽" },
  { name: "Cab & Public Transport", group: "Variable Expenses", icon: "🚕" },
  { name: "Shopping & E-Commerce", group: "Variable Expenses", icon: "🛍️" },
  { name: "Personal Care & Grooming", group: "Variable Expenses", icon: "💇" },
  { name: "Healthcare & Pharmacy", group: "Variable Expenses", icon: "💊" },

  // Discretionary & Lifestyle
  { name: "Entertainment & Movies", group: "Discretionary", icon: "🎬" },
  { name: "Subscriptions & OTT", group: "Discretionary", icon: "📺" },
  { name: "Travel & Vacations", group: "Discretionary", icon: "✈️" },
  { name: "Hobbies & Sports", group: "Discretionary", icon: "⚽" },
  { name: "Gifts & Donations", group: "Discretionary", icon: "🎁" },

  // Savings & Debt
  { name: "Credit Card Bill", group: "Debt & Repayment", icon: "💳" },
  { name: "Loan EMI", group: "Debt & Repayment", icon: "🏦" },
  { name: "Savings & Investments", group: "Savings & Investments", icon: "🐖" },
];
