# 📚 Content Recommendation API
A personalized content recommendation system using **NestJS**, **TypeORM**, **SQLite**, and **Redis**. It features real-time scoring, caching, and tag-based recommendations based on user interactions.

---

## 🚀 Features

- ✅ Track user **interactions**: `like`, `comment`, `share`, `rate (1-5 stars)`
- ✅ Tag-weighted **content-based recommendation engine**
- ✅ Real-time scoring with **freshness decay**
- ✅ **Redis-powered caching** for blazing fast responses
- ✅ Swagger (OpenAPI) documentation
- ✅ Modular architecture and testing support

---

## 🧠 Recommendation Engine Logic

1. **User Preferences**  
  Each user has preferred tags (e.g., `"TECH"`, `"FOOD"`), which are weighted higher.

2. **Interaction Profile**  
  Interactions are scored with different weights to reflect real-world user intent:  
  - `like`: 1 (Light positive signal - easy to perform but shows preference)  
  - `comment`: 3 (High intent - requires time/effort, indicates strong interest)  
  - `share`: 5 (Very high value - user endorses content publicly, viral potential)  
  - `rate`: 2 + rating value (Explicit evaluation - combines base weight with user's 1-5 star score)  

  These weights are designed to prioritize user preferences, providing the most reliable signal of relevance for personalized recommendations.

These weights can be fine-tuned further using A/B testing or analytics in a production environment.

3. **Tag Profile**  
  Tags from content a user interacted with are aggregated into a **weighted tag profile**.

4. **Freshness Score**  
  Recent content gets a boost:
  ```ts
  freshnessBoost = 1 / (1 + daysSinceCreated)
  finalScore = tagScore + (freshnessBoost * 10)
  ```

### 🗂️ Filter Unseen Content  
Only show content the user hasn’t seen, created in the last 30 days.

---

## 🏗️ System Architecture

The system is built with a modular, scalable design to ensure high performance, maintainability, and ease of extension:

### 1. **Backend**  
The backend, developed with **NestJS**, serves as the core of the system. It handles API requests, processes user interactions, and computes personalized recommendations.

### 2. **Database**  
For local development, the system uses **SQLite**. In production, it supports other relational databases, ensuring flexibility and scalability.

### 3. **Caching Layer**  
**Redis** is utilized as a high-performance caching layer to store user-specific recommendations. This reduces database load and ensures lightning-fast response times.

### 4. **Recommendation Engine**  
The recommendation engine dynamically computes scores based on user interactions, tag preferences, and content freshness, delivering highly personalized results.

### 5. **API Documentation**  
The system integrates **Swagger (OpenAPI)** for seamless exploration, testing, and understanding of API endpoints.

### 6. **Testing**  
Comprehensive **unit** and **integration tests** are implemented to guarantee system reliability and robustness.

---

### 🔄 System Workflow

```
Users     Contents
  |           |
  v           v
[Interactions] (like, comment, rate)
    |
    v
+---------------------------+
| Recommendation Engine     |
+---------------------------+
    |
    v
+------------------------+
| Redis Cache (per user) |
+------------------------+
    |
    v
GET /recommendations/:userId
```

This workflow ensures that user interactions are processed efficiently, recommendations are computed in real-time, and cached results are served for optimal performance.

---

## ⚙️ Tech Stack

- **NestJS** (REST API framework)
- **TypeORM** (SQLite + Redis)
- **Redis** (Cache for recommendations)
- **Swagger** (API documentation)
- **Faker** (Seed data generator)
- **Jest** (Testing framework)

## 🧪 Running Locally

1. **Clone the Repository**  
  ```bash
  git clone https://github.com/yossefezzat/Content-recommendations-api.git
  cd content-recommendation-api
  ```

2. **Install Dependencies**  
  ```bash
  npm install
  ```

3. **Seed the Database**  
  ```bash
  npx ts-node src/database/seed.ts
  ```

4. **Start the Development Server**  
  ```bash
  npm run start:dev
  ```

---

🐳 **Docker Setup**

1. **Build & Run with Docker Compose**  
  ```bash
  docker-compose up --build
  ```
  This will run:
  - NestJS app
  - Redis cache
  - SQLite database (file-based)

2. **Access Swagger Docs**  
  [http://localhost:8000/api/docs](http://localhost:8000/api/docs)



## 🧪 Running Tests

Run unit tests with Jest for services and core logic:

```bash
npm run test
```

---

## 📁 Folder Structure

```markdown
## 📁 Folder Structure

```plaintext
src/
├── app.controller.spec.ts
├── app.controller.ts
├── app.module.ts
├── app.service.ts

├── cache-store/
│   └── cache-store.module.ts

├── contents/
│   ├── constants/
│   ├── dto/
│   ├── entities/
│   ├── repositories/
│   ├── contents.controller.ts
│   ├── contents.controller.spec.ts
│   ├── contents.module.ts
│   ├── contents.service.ts
│   └── contents.service.spec.ts

├── database/
│   └── seed.ts

├── interactions/
│   ├── constants/
│   ├── dto/
│   ├── entities/
│   ├── repositories/
│   ├── interactions.controller.ts
│   ├── interactions.controller.spec.ts
│   ├── interactions.module.ts
│   └── interactions.service.ts

├── recommendations/
│   ├── dtos/
│   ├── recommendations.controller.ts
│   ├── recommendations.controller.spec.ts
│   ├── recommendations.module.ts
│   ├── recommendations.service.ts
│   └── recommendations.service.spec.ts

├── shared/

└── users/
```
```

---
## 📦 Environment Variables

| Variable                   | Description                                   | Default Value   |
|----------------------------|-----------------------------------------------|-----------------|
| `PORT`                     | Server port                                  | `8000`          |
| `API_KEY`                  | API key for authentication                   | `contentkey`    |
| `DEFAULT_PAGE_SIZE`        | Default number of items per page             | `10`            |
| `REDIS_HOST`               | Redis host                                   | `localhost`     |
| `REDIS_PORT`               | Redis port                                   | `6379`          |
| `REDIS_PASSWORD`           | Password for Redis authentication            | `your_password` |
| `REDIS_USERNAME`           | Username for Redis authentication            | `redis`         |
| `RECOMMENDATIONS_CACHE_TTL`| Time-to-live for cached recommendations (s)  | `3600`          |

You can configure these in a `.env` file.
