# 🧩 AlgoPuzzleBoard
### Interactive Algorithm Visualization Platform in ASP.NET MVC

![.NET](https://img.shields.io/badge/.NET-5C2D91?style=for-the-badge&logo=.net&logoColor=white)
![C#](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=c-sharp&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

**AlgoPuzzleBoard** is a comprehensive educational platform designed to visualize complex algorithms in real-time. Built with a robust **ASP.NET Core MVC** backend and a responsive frontend, it helps students and developers understand data structures and algorithms through interactive demonstrations.

---

## ✨ Features

### 🔐 Secure Authentication
*   User Registration & Login
*   **PostgreSQL** Database Integration (Neon Tech)
*   Secure Password Management

### 🎨 Algorithm Visualizations
We support a wide range of algorithms, fully implemented in C# with interactive frontend visualizations:

#### 📉 Sorting Algorithms
*   **Bubble Sort** - classic step-by-step visualization
*   **Quick Sort** - divide and conquer visualization
*   **Merge Sort** - recursive sorting
*   **Heap Sort** & **Radix Sort**

#### 🔍 Search Algorithms
*   **Linear Search**
*   **Binary Search**
*   **Interpolation Search**

#### 🕸️ Graph Algorithms
*   **BFS & DFS** (Graph & Grid variants)
*   **Dijkstra's Algorithm** - Shortest path finding
*   **Prim's & Kruskal's** - Minimum Spanning Trees (MST)
*   **Graph Coloring** - Greedy approach
*   **TSP (Traveling Salesperson)** - Nearest Neighbor + 2-Opt

#### ♟️ Puzzles & Backtracking
*   **N-Queens** - Visualized backtracking solution
*   **Knight's Tour** - Warnsdorff's heuristic

#### 🌳 Tree Data Structures
*   **Binary Search Tree (BST)**
*   **Min Heap & Max Heap**
*   **Huffman Coding** - Tree construction & encoding

---

## 🛠️ Technology Stack

*   **Backend:** ASP.NET Core MVC 9.0 (C#)
*   **Database:** PostgreSQL (via Neon Tech)
*   **ORM:** Entity Framework Core
*   **Frontend:** HTML5, CSS3 (Glassmorphism), JavaScript, Bootstrap 5
*   **Visualization:** Custom JS Canvas rendering with C# logic processing

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
*   [.NET 9.0 SDK](https://dotnet.microsoft.com/download)
*   [PostgreSQL Database](https://console.neon.tech/) (or any Postgres instance)

### 1. Clone the Repository
```bash
git clone https://github.com/shafaq-samad/AlgoPuzzleBoard.git
cd AlgoPuzzleBoard/AlgoPuzzleBoard.MVC
```

### 2. Configure Database
1.  Create a `appsettings.json` file in the project root (use `appsettings.Example.json` as a template).
2.  Add your PostgreSQL connection string:
    ```json
    "ConnectionStrings": {
      "DefaultConnection": "postgres://user:password@host/database?sslmode=require"
    }
    ```

### 3. Run the Application
The application handles database migrations automatically on startup!
```bash
dotnet restore
dotnet run
```
Open your browser to: `http://localhost:5024`

---

## ☁️ Deployment

This project is tailored for deployment on **Railway** or **Render**.

### Rapid Deployment (Railway)
1.  Connect your GitHub repo to Railway.
2.  Add the Environment Variable:
    *   `ConnectionStrings__DefaultConnection`: Your Postgres Connection URL
3.  Railway will automatically detect the `.NET` Dockerfile configuration and build it.

*See `RAILWAY_DEPLOY_GUIDE.md` for detailed instructions.*

---

## 📂 Project Structure
```text
AlgoPuzzleBoard.MVC/
├── Controllers/       # Handles HTTP requests & API endpoints
├── Models/            # Database entities & ViewModels
├── Services/          # Core Algorithm Logic (C# implementations)
├── Views/             # Razor pages for UI
├── wwwroot/           # Static assets (CSS, JS, Images)
└── Program.cs         # App entry point & Service configuration
```

---

## 🤝 Contributing

Contributions are welcome!
1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/NewAlgorithm`)
3.  Commit your changes
4.  Push to the branch
5.  Open a Pull Request

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Created by [Shafaq Samad](https://github.com/shafaq-samad)*
