// Category page specific functionality
document.addEventListener("DOMContentLoaded", () => {
  loadCategoryPage()
})

function loadCategoryPage() {
  // Get category from URL path
  const path = window.location.pathname
  const categoryFile = path.split("/").pop()
  const categoryName = categoryFile.replace(".html", "")

  // Map file names to actual category names
  const categoryMap = {
    sports: "Sports",
    arcade: "Arcade",
    puzzles: "Puzzles",
    action: "Action",
    hypercasual: "Hypercasual",
    adventure: "Adventure",
    racing: "Racing",
    shooting: "Shooting",
    girls: "Girls",
    fighting: "Fighting",
    boys: "Boys",
    multiplayer: "Multiplayer",
    clicker: "Clicker",
    "3d": "3D"
  }

  const actualCategory = categoryMap[categoryName]

  if (!actualCategory) {
    console.log("Category not found:", categoryName)
    // Redirect to categories page if invalid category
    window.location.href = "../categories.html"
    return
  }

  // Wait for games data to be available
  waitForGamesData(() => {
    // Filter games by category using actual games data
    const categoryGames = getGamesByCategory(actualCategory)
    console.log(`Found ${categoryGames.length} games for category: ${actualCategory}`)
    
    // Display games
    displayCategoryGames(categoryGames)
    
    // Setup search functionality
    setupSearch(categoryGames)
  })
}

function waitForGamesData(callback) {
  let attempts = 0
  const maxAttempts = 50
  
  function checkData() {
    if (window.gamesData && window.gamesData.length > 0) {
      callback()
    } else if (attempts < maxAttempts) {
      attempts++
      setTimeout(checkData, 100)
    } else {
      console.error("Games data not available after waiting")
      displayError()
    }
  }
  
  checkData()
}

function displayCategoryGames(games) {
  const gamesContainer = document.getElementById("gamesGrid") || document.getElementById("categoryGames")

  if (!gamesContainer) {
    console.error("Games container not found")
    return
  }

  if (games.length === 0) {
    gamesContainer.innerHTML = `
            <div class="no-results">
                <h3>No games found in this category</h3>
                <p>Check back later for new games!</p>
                <a href="../index.html" class="category-link">Browse All Games</a>
            </div>
        `
    return
  }

  gamesContainer.innerHTML = games.map((game) => createCategoryGameCard(game)).join("")
}

function createCategoryGameCard(game) {
  const truncatedDescription = game.description && game.description.length > 120 
    ? game.description.substring(0, 120) + "..." 
    : (game.description || "Play this exciting game now!")

  const tags = game.tags ? game.tags.split(", ").slice(0, 3).join(", ") : ""
  
  // Create fallback image with base64 encoded SVG
  const fallbackImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzMCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+OrgpQbGF5PC90ZXh0Pgo8dGV4dCB4PSIxMDAiIHk9IjkwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjczODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K"

  return `
        <div class="game-card">
            <img src="${game.thumb || fallbackImage}" 
                 alt="${game.title}" 
                 class="game-thumbnail" 
                 loading="lazy"
                 onerror="this.src='${fallbackImage}'">
            <div class="game-content">
                <h3 class="game-title">${game.title}</h3>
                <p class="game-description">${truncatedDescription}</p>
                <div class="game-meta">
                    <span class="game-category">${game.category}</span>
                    ${tags ? `<span class="game-tags">${tags}</span>` : ''}
                </div>
                <button class="play-btn" onclick="playGame('${game.id}')">Play Now</button>
            </div>
        </div>
    `
}

function playGame(gameId) {
  // Redirect to game page with game ID
  window.location.href = `../game.html?id=${gameId}`
}

// Use the actual games data from window.gamesData
function getGamesByCategory(category) {
  if (!window.gamesData) {
    console.error("Games data not available")
    return []
  }
  return window.gamesData.filter((game) => game.category === category)
}

function setupSearch(allGames) {
  const searchInput = document.getElementById("searchInput")
  const searchBtn = document.getElementById("searchBtn")
  const gamesContainer = document.getElementById("gamesGrid") || document.getElementById("categoryGames")
  const noResults = document.getElementById("noResults")
  
  if (!searchInput || !gamesContainer) return
  
  function performSearch() {
    const query = searchInput.value.toLowerCase().trim()
    
    if (query === "") {
      displayCategoryGames(allGames)
      if (noResults) noResults.style.display = "none"
      return
    }
    
    const filteredGames = allGames.filter(game => 
      game.title.toLowerCase().includes(query) ||
      (game.description && game.description.toLowerCase().includes(query)) ||
      (game.tags && game.tags.toLowerCase().includes(query))
    )
    
    if (filteredGames.length === 0) {
      gamesContainer.innerHTML = ""
      if (noResults) noResults.style.display = "block"
    } else {
      if (noResults) noResults.style.display = "none"
      gamesContainer.innerHTML = filteredGames.map(game => createCategoryGameCard(game)).join("")
    }
  }
  
  searchInput.addEventListener("input", performSearch)
  if (searchBtn) searchBtn.addEventListener("click", performSearch)
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") performSearch()
  })
}

function displayError() {
  const gamesContainer = document.getElementById("gamesGrid") || document.getElementById("categoryGames")
  if (gamesContainer) {
    gamesContainer.innerHTML = `
      <div class="no-results">
        <h3>Unable to load games</h3>
        <p>Please refresh the page or try again later.</p>
        <a href="../index.html" class="category-link">Go to Homepage</a>
      </div>
    `
  }
}
