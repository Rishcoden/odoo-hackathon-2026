# Traveloop AI ✈️

Traveloop AI is a modern, full-stack, enterprise-grade travel organization platform built to help users seamlessly plan, track, and share their journeys. From comprehensive itinerary building to granular budget tracking, packing checklists, and journaling, Traveloop provides a centralized, SaaS-styled command center for all your travel needs.

---

## 💻 Tech Stack

### Frontend
- **Framework:** React + Vite
- **Routing:** React Router DOM
- **Styling:** Tailwind CSS (Modern SaaS glassmorphism & gradients, highly responsive)
- **HTTP Client:** Axios (Interceptors for JWT management)

### Backend
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy (Async capable)
- **Data Validation:** Pydantic
- **Authentication:** JWT (JSON Web Tokens) with Passlib & Bcrypt

---

## ✨ Key Features & Functionalities

### 1. Robust Authentication & Security
- **JWT Authentication:** Secure stateless login flow with token persistence in local storage.
- **Split-Screen Auth UI:** Premium SaaS-style Login and Signup pages featuring modern aesthetics, loading spinners, and robust error handling.
- **Ownership Validation:** All API routes strictly enforce ownership validation—users can only view, edit, or delete entities belonging to their account.

### 2. Immersive Dashboard & Navigation
- **Global Layout Wrapper:** Consistent layout with a sticky global Navbar holding active-route highlighting.
- **Dynamic Hero Section:** Immersive gradient dashboards that greet the user and summarize global trip statistics (Total Trips, Upcoming Trips, Estimated Global Budget).
- **AI Recommendations:** (Mocked/Static for now) Built-in UI to suggest upcoming destination budgets.

### 3. Core Trip Management
- **My Trips:** A visually stunning grid of all your itineraries. Features image-based cards, absolute positioning for badges (e.g., "Public", "5 Stops"), and dynamic action buttons.
- **Trip Operations:** Create, View, Share, Delete, and navigate into deeper modules directly from the trip cards.

### 4. Modular Trip Sub-Systems
Every trip acts as an aggregate root for several modular sub-systems:
- **Itinerary Builder:** Plan stops across multiple cities with arrival/departure dates. Includes dynamic drag-and-drop-style reordering logic.
- **Activities & Events:** Assign specific activities to specific stops (e.g., "Eiffel Tower Visit").
- **Budgeting & Cost Tracking:** Track estimated budgets versus manual expenses. Automatically aggregates costs across activities and manual entries, showing dynamic Remaining Budget metrics.
- **Packing Checklist:** Interactive checklist with progress bars. Track packed vs. unpacked items by categories (e.g., "Documents", "Electronics").
- **Trip Journal (Notes):** A split-pane journaling interface. Link notes dynamically to specific cities in your itinerary or save them as general trip reflections.

### 5. Sharing & Analytics
- **Public Itinerary Sharing:** Generate a unique, cryptographically secure share token to grant read-only access to friends and family.
- **Analytics Overview:** High-performance SQL aggregations that generate platform-wide user statistics (e.g., Top Destinations, Global Budget spent, Packing Completion Rates).

---

## 🗄️ Database Schema

The database utilizes a highly normalized relational model on PostgreSQL. Here are the core models:

### 1. `users`
- `id` (UUID, PK)
- `name` (String)
- `email` (String, Unique)
- `password_hash` (String)

### 2. `trips`
- `id` (UUID, PK)
- `user_id` (FK -> users)
- `title`, `description`, `start_date`, `end_date`, `budget_limit`
- `is_public` (Boolean)
- `public_share_token` (String, Unique)

### 3. `trip_stops`
- `id` (UUID, PK)
- `trip_id` (FK -> trips)
- `city_id` (FK -> cities)
- `arrival_date`, `departure_date`, `stop_order`

### 4. `cities`
- `id` (UUID, PK)
- `city_name`, `country`, `latitude`, `longitude`

### 5. `activities` & `trip_activities`
- **activities:** Generic global catalog of things to do.
- **trip_activities:** Join table linking `trip_stops` and `activities` with specific `scheduled_time` and user-defined `cost`.

### 6. `expenses`
- `id` (UUID, PK)
- `trip_id` (FK -> trips)
- `title`, `category`, `amount`, `notes`

### 7. `packing_items`
- `id` (UUID, PK)
- `trip_id` (FK -> trips)
- `item_name`, `category`, `is_packed` (Boolean)

### 8. `trip_notes`
- `id` (UUID, PK)
- `trip_id` (FK -> trips)
- `trip_stop_id` (FK -> trip_stops, Nullable)
- `title`, `content`, `note_date`

*Note: The schema utilizes `cascade="all, delete-orphan"` extensively to ensure clean data removal when parent entities (like Trips or Users) are deleted.*

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js v16+
- PostgreSQL running locally

### Backend Setup
1. Navigate to the `backend` directory.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up your `.env` file with your PostgreSQL connection string:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/traveloop
   SECRET_KEY=your_super_secret_jwt_key
   ```
5. Run the server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. The application will be available at `http://localhost:5173`.