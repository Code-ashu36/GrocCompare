# 🛒 GrocCompare
> **The All-in-One Utility Manager: Groceries, Cabs & Subscriptions**

GrocCompare is a comprehensive Java-based utility assistant designed to save users money across three major pillars of daily spending: **Grocery Shopping, Travel, and Digital Subscriptions**.

By comparing real-time data across platforms like **Zepto, Uber, Ola, Netflix, and Hotstar**, GrocCompare ensures you never overpay for a ride, a vegetable, or a movie night again.

---

## 🚀 Key Features

### 🥦 1. Grocery Smart-Compare
* **Real-Time Basket Comparison:** Instantly compare your entire grocery list across **Zepto, Blinkit, and BigBasket**.
* **Split-Cart Savings:** Our algorithm calculates if it's cheaper to buy *Tomatoes* from Zepto and *Milk* from Blinkit, accounting for delivery fees.
* **Price History & Predictions:** Visualize price trends to decide the best time to buy staples.

### 🚖 2. Cab & Ride Aggregator 
* **Unified Price Check:** Compare fares instantly between **Uber, Ola, Rapido, and BluSmart**.
* **Surge Protection:** Identifies which service is currently surging and directs you to the cheaper alternative.
* **ETA Comparison:** Balances price vs. time—shows you the cheapest ride.

### 📺 3. Subscription Manager 
* **OTT Plan Optimizer:** Compare plans for **Disney+ Hotstar, Netflix, and YouTube Premium** to find the best value (Mobile vs. Premium vs. Family).

---

## 📊 Supported Platforms

| Category | Supported Services |
| :--- | :--- |
| **Groceries** | Zepto, Blinkit, BigBasket, Swiggy Instamart |
| **Cabs** | Uber, Ola, Rapido |
| **Subscriptions** | Netflix, YouTube Premium, Disney+ Hotstar, Amazon Prime|

---

## 🛠️ Tech Stack

* **Core Language:** Java (JDK 21)
* **Database:** MySQL (User data, price history logs)
* **Frontend:** [Java Swing / JavaFX / Web Framework]
* **APIs & Integrations:**
    * *Grocery:* Custom Scrapers / Public APIs
    * *Maps/Cabs:* Google Maps API, Uber RIDE Request API
    * *Payments:* Razorpay/Stripe (for subscription management simulation)

---

## 📸 Application Preview

*(Add screenshots here of the Dashboard showing the 3 main tabs: Grocery, Cabs, Subs)*

---

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/your-username/GrocCompare.git](https://github.com/your-username/GrocCompare.git)
    cd GrocCompare
    ```

2.  **Configure API Keys**
    * Create a `config.properties` file in the `src/resources` folder.
    * Add your keys:
      ```properties
      DB_URL=jdbc:mysql://localhost:3306/groccompare_db
      MAPS_API_KEY=your_google_maps_key
      ```

3.  **Run the Application**
    * Build with Maven/Gradle.
    * Run `Main.java`.

---

## 👥 Meet the Team

| Name | Role | ID |
| :--- | :--- | :--- |
| **Himanshu (Himu)** | Developer (Backend & API Integration) | Student 1 |
| **Tarun** | Developer (Database & Algorithms) | Student 2 |
| **Pratham** | Front End Developer (UI/UX) | Student 3 |

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and create a pull request for any feature updates or bug fixes.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
