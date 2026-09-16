export interface AdvisorGuideSection {
  title: string;
  badge: string;
  description: string;
  examples: string[];
  tips: string;
}

export const ADVISOR_GUIDE_SECTIONS: AdvisorGuideSection[] = [
  {
    title: "Everyday Expense & Income Logging",
    badge: "Smart Parsing",
    description:
      "Type transactions in natural shorthand just like texting. The AI automatically detects amount, payment account, date, category, and cleans up notes.",
    examples: [
      '"Swiggy biryani ₹420 paid with HDFC"',
      '"Petrol for bike 300 rs cash yesterday"',
      '"Auto fare from metro station 60"',
      '"Wifi recharge 999 from ICICI"',
      '"Salary 85000 credited today"',
      '"Moved 5000 from Savings to Emergency Fund"',
    ],
    tips: "No strict syntax needed. Casual phrases like 'chai 40' or 'metro 50 today' work seamlessly.",
  },
  {
    title: "Multi-Item Bulk Logging",
    badge: "Carousel Review",
    description:
      "List several transactions at once. FinAI organizes them into an interactive horizontal carousel so you can review each card before executing.",
    examples: [
      '"Log my day: 40 tea, 150 thali lunch, 50 metro, 350 groceries from Blinkit"',
      '"Weekend spends: ₹1400 dining at barbecue, ₹500 petrol, ₹400 movie tickets"',
      '"Add 3 expenses: ₹120 coffee, ₹800 medicines, ₹250 haircut"',
    ],
    tips: "Click 'Confirm All' in the header to save everything at once, or inspect individual cards across the carousel.",
  },
  {
    title: "Dynamic Category & Typo Intelligence",
    badge: "Semantic Matching",
    description:
      "Whether you use FinAI's default categories or created custom ones like 'Self Care', 'Daily Commute', or 'Wellness', colloquial terms and typos map automatically.",
    examples: [
      '"Haircut 250" → matches your "Self Care" or "Salon & Grooming"',
      '"Dr consultation 500" → matches "Healthcare & Pharmacy" or "Clinic"',
      '"Uber ride 180" → matches "Daily Commute" or "Cab & Public Transport"',
      '"Blinkit milk & bread" → matches "Groceries & Supermarket"',
    ],
    tips: "Typos in your prompt (e.g. 'petrl', 'groceris', 'dr consulttn') are automatically corrected into clean, professional transaction notes.",
  },
  {
    title: "Two-Phase Confirmation Guardrails",
    badge: "100% Safe",
    description:
      "The AI never mutates your financial data silently. Any write operation (new transaction, budget change, goal update) presents a confirmation card first.",
    examples: [
      "Review the exact account balance and category before recording",
      "Inspect before-and-after limits on budget updates",
      "Click Cancel anytime to reject or discard a proposal",
    ],
    tips: "Your accounts, budgets, and dashboards update immediately after you click Confirm.",
  },
  {
    title: "Live Financial Queries & Advice",
    badge: "Grounded Insights",
    description:
      "Ask questions about your real money, monthly budgets, or financial health. All answers are grounded in your actual accounts and spending history.",
    examples: [
      '"How much did I spend on food and delivery this month?"',
      '"What is my remaining budget for dining?"',
      '"Can I afford a ₹15,000 trip to Goa next weekend?"',
      '"What is my savings rate compared to last month?"',
    ],
    tips: "Ask for actionable advice like 'Which budget category is at risk?' to stay on top of your limits.",
  },
];
