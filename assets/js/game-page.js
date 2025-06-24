// Enhanced Game page functionality with SEO and full description support
let currentGame = null;
let gamesDataReady = false;

document.addEventListener("DOMContentLoaded", () => {
  // Initialize mobile menu
  initializeMobileMenu();
  
  // Wait for games data to be loaded
  waitForGamesData().then(() => {
    gamesDataReady = true;
    loadGamePage();
  }).catch(() => {
    showError("Unable to load games data. Please try again later.");
  });
});

function initializeMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navLinks = document.querySelector(".nav-links");

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }
}

async function waitForGamesData() {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 50;
    
    const checkData = () => {
      attempts++;
      
      if (window.gamesData && window.gamesData.length > 0) {
        console.log("Games data loaded successfully:", window.gamesData.length, "games");
        resolve();
      } else if (attempts >= maxAttempts) {
        console.error("Failed to load games data after", maxAttempts, "attempts");
        reject(new Error("Games data not available"));
      } else {
        setTimeout(checkData, 100);
      }
    };
    
    checkData();
  });
}

function loadGamePage() {
  // Get game ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get("id");

  if (!gameId) {
    console.error("No game ID provided");
    redirectToHome("No game ID provided");
    return;
  }

  // Find the game
  currentGame = getGameById(gameId);

  if (!currentGame) {
    console.error("Game not found:", gameId);
    redirectToHome("Game not found");
    return;
  }

  console.log("Loading game:", currentGame.title);

  // Populate all game information
  populateGameInfo(currentGame);
  updateSEOTags(currentGame);
  setupBreadcrumb(currentGame);
  setupDescriptionHandling(currentGame);
  loadGame(currentGame);
  loadRelatedGames(currentGame);
  generateStructuredData(currentGame);
}

function populateGameInfo(game) {
  try {
    // Update page title and meta
    const gameTitle = `${game.title} - Play Free Online | Unblocked Games`;
    document.title = gameTitle;
    document.getElementById("gameTitle").textContent = gameTitle;

    // Update game header info
    document.getElementById("gamePageTitle").textContent = game.title;
    document.getElementById("gameCategory").textContent = game.category || "Game";
    
    // Add platform badge
    const platformBadge = document.getElementById("gamePlatform");
    const platform = getGamePlatform(game);
    platformBadge.textContent = getPlatformLabel(platform);
    platformBadge.className = `platform-badge platform-${platform}`;
    
    // Update tags
    const tags = game.tags && typeof game.tags === 'string' 
      ? game.tags.split(", ").slice(0, 5).join(", ")
      : "Free Online Game";
    document.getElementById("gameTags").textContent = tags;

    // Update game stats
    updateGameStats(game);

  } catch (error) {
    console.error("Error populating game info:", error);
  }
}

function updateSEOTags(game) {
  try {
    const gameTitle = `${game.title} - Play Free Online | Unblocked Games`;
    const gameDescription = game.description 
      ? `Play ${game.title} free online. ${game.description.substring(0, 150)}...`
      : `Play ${game.title} free online on Unblocked Games. No downloads required!`;
    const gameUrl = `https://unb-games.github.io/game.html?id=${game.id}`;
    const gameImage = game.thumb || "https://unb-games.github.io/icon.png";
    const gameKeywords = `${game.title}, ${game.category}, free online games, unblocked games, HTML5 games, ${game.tags || ''}`;

    // Update meta tags
    updateMetaTag("description", gameDescription);
    updateMetaTag("keywords", gameKeywords);
    updateMetaTag("canonical", gameUrl);

    // Update Open Graph tags
    updateMetaProperty("og:title", gameTitle);
    updateMetaProperty("og:description", gameDescription);
    updateMetaProperty("og:url", gameUrl);
    updateMetaProperty("og:image", gameImage);

    // Update Twitter tags
    updateMetaProperty("twitter:title", gameTitle);
    updateMetaProperty("twitter:description", gameDescription);
    updateMetaProperty("twitter:url", gameUrl);
    updateMetaProperty("twitter:image", gameImage);

  } catch (error) {
    console.error("Error updating SEO tags:", error);
  }
}

function updateMetaTag(name, content) {
  const element = document.querySelector(`meta[name="${name}"]`) || 
                 document.querySelector(`link[rel="${name}"]`) ||
                 document.getElementById(`game${name.charAt(0).toUpperCase() + name.slice(1)}`);
  if (element) {
    if (element.tagName === 'LINK') {
      element.href = content;
    } else {
      element.content = content;
    }
  }
}

function updateMetaProperty(property, content) {
  const element = document.querySelector(`meta[property="${property}"]`) ||
                 document.getElementById(`game${property.replace(':', '').replace(/\b\w/g, l => l.toUpperCase())}`);
  if (element) {
    element.content = content;
  }
}

function setupBreadcrumb(game) {
  try {
    const breadcrumb = document.getElementById("gameBreadcrumb");
    const categoryBreadcrumb = document.getElementById("categoryBreadcrumb");
    const gameBreadcrumbTitle = document.getElementById("gameBreadcrumbTitle");

    if (breadcrumb && categoryBreadcrumb && gameBreadcrumbTitle) {
      const categorySlug = game.category ? game.category.toLowerCase().replace(/\s+/g, '') : 'games';
      
      categoryBreadcrumb.innerHTML = `<a href="categories/${categorySlug}.html">${game.category || 'Games'}</a>`;
      gameBreadcrumbTitle.textContent = game.title;
      breadcrumb.style.display = "block";
    }
  } catch (error) {
    console.error("Error setting up breadcrumb:", error);
  }
}

function setupDescriptionHandling(game) {
  try {
    const descriptionContent = document.getElementById("gameDescriptionContent");
    const instructionsContent = document.getElementById("gameInstructionsContent");
    const showMoreBtn = document.getElementById("showMoreBtn");

    // Handle description
    const description = game.description || "This is an amazing free online game. Play now and enjoy!";
    const instructions = game.instructions || "Use your mouse and keyboard to play. Follow the on-screen instructions for specific controls.";

    // Show full description (no truncation)
    descriptionContent.innerHTML = `<p>${formatGameText(description)}</p>`;
    instructionsContent.innerHTML = `<p>${formatGameText(instructions)}</p>`;

    // Add "Show More" functionality for very long descriptions
    if (description.length > 500) {
      const shortDescription = description.substring(0, 500) + "...";
      const fullDescription = description;
      let isExpanded = false;

      descriptionContent.innerHTML = `<p>${formatGameText(shortDescription)}</p>`;
      showMoreBtn.style.display = "inline-block";

      showMoreBtn.addEventListener("click", () => {
        if (isExpanded) {
          descriptionContent.innerHTML = `<p>${formatGameText(shortDescription)}</p>`;
          showMoreBtn.textContent = "Show More";
          isExpanded = false;
        } else {
          descriptionContent.innerHTML = `<p>${formatGameText(fullDescription)}</p>`;
          showMoreBtn.textContent = "Show Less";
          isExpanded = true;
        }
      });
    }

  } catch (error) {
    console.error("Error setting up description:", error);
  }
}

function formatGameText(text) {
  if (!text) return "";
  
  // Convert line breaks and clean up text
  return text
    .replace(/\n/g, '<br>')
    .replace(/\r/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function updateGameStats(game) {
  try {
    const gameStats = document.getElementById("gameStats");
    const statCategory = document.getElementById("statCategory");
    const statPlatform = document.getElementById("statPlatform");
    const statSize = document.getElementById("statSize");

    if (gameStats && statCategory && statPlatform && statSize) {
      statCategory.textContent = game.category || "Game";
      statPlatform.textContent = getPlatformLabel(getGamePlatform(game));
      
      const width = parseInt(game.width) || 800;
      const height = parseInt(game.height) || 600;
      statSize.textContent = `${width} × ${height}`;
      
      gameStats.style.display = "block";
    }
  } catch (error) {
    console.error("Error updating game stats:", error);
  }
}

function loadGame(game) {
  const gameFrame = document.getElementById("gameFrame");
  const gameLoading = document.getElementById("gameLoading");

  if (!gameFrame || !gameLoading) {
    console.error("Game frame elements not found");
    return;
  }

  try {
    // Set up iframe with proper attributes
    gameFrame.src = game.url;
    gameFrame.width = game.width || "800";
    gameFrame.height = game.height || "600";
    gameFrame.title = `Play ${game.title}`;

    // Show loading initially
    gameLoading.style.display = "flex";

    // Hide loading when iframe loads
    gameFrame.onload = () => {
      setTimeout(() => {
        gameLoading.style.display = "none";
        console.log("Game loaded successfully");
      }, 1000);
    };

    // Handle iframe load errors
    gameFrame.onerror = () => {
      console.error("Game failed to load");
      showGameError();
    };

    // Fallback timeout for loading
    setTimeout(() => {
      if (gameLoading.style.display !== "none") {
        console.warn("Game taking longer than expected to load");
        gameLoading.innerHTML = `
          <div class="loading-spinner"></div>
          <p>Game is taking longer than usual to load...</p>
          <button onclick="location.reload()" class="retry-btn">Retry</button>
        `;
      }
    }, 10000);

  } catch (error) {
    console.error("Error loading game:", error);
    showGameError();
  }
}

function showGameError() {
  const gameLoading = document.getElementById("gameLoading");
  if (gameLoading) {
    gameLoading.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <h3>😔 Unable to Load Game</h3>
        <p>This game might be temporarily unavailable.</p>
        <div style="margin-top: 1rem;">
          <button onclick="location.reload()" class="retry-btn" style="background: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; margin-right: 0.5rem;">Try Again</button>
          <button onclick="history.back()" class="back-btn" style="background: #6b7280; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">Go Back</button>
        </div>
      </div>
    `;
  }
}

function loadRelatedGames(currentGame) {
  const relatedGamesContainer = document.getElementById("relatedGames");
  const debugContainer = document.getElementById("relatedGamesDebug");

  if (!relatedGamesContainer || !gamesDataReady) {
    console.warn("Related games container not found or data not ready");
    return;
  }

  try {
    console.log("Loading related games for:", currentGame.title);
    
    // Get games from the same category, excluding current game
    let relatedGames = getGamesByCategory(currentGame.category)
      .filter(game => game.id !== currentGame.id);
    
    console.log("Found games in same category:", relatedGames.length);

    // If not enough games in same category, add random games
    if (relatedGames.length < 12) {
      const additionalGames = getRandomGames(12 - relatedGames.length, currentGame.id);
      console.log("Adding additional random games:", additionalGames.length);
      relatedGames = [...relatedGames, ...additionalGames];
    }

    // Limit to 12 games
    relatedGames = relatedGames.slice(0, 12);
    console.log("Final number of related games:", relatedGames.length);

    // Show debug info
    if (debugContainer) {
      debugContainer.style.display = "block";
      debugContainer.innerHTML = `
        <div style="background: #f0f9ff; padding: 10px; margin-bottom: 10px; border-radius: 4px; font-size: 12px;">
          <p>Related games count: ${relatedGames.length}</p>
          <p>Game titles: ${relatedGames.map(g => g.title).join(', ')}</p>
        </div>
      `;
    }

    // Create related games HTML with improved error handling
    relatedGamesContainer.innerHTML = relatedGames
      .map(game => createRelatedGameCard(game))
      .join("");
    
    // Re-append the debug container if it was removed
    if (debugContainer) {
      relatedGamesContainer.appendChild(debugContainer);
    }
    
    console.log("Related games HTML created with", relatedGamesContainer.children.length, "elements");

  } catch (error) {
    console.error("Error loading related games:", error);
    relatedGamesContainer.innerHTML = `
      <p style="text-align: center; color: #64748b;">
        Unable to load related games at this time.
      </p>
    `;
  }
}

function createRelatedGameCard(game) {
  return `
    <div class="game-card" onclick="playGame('${game.id}')">
      <img src="${game.thumb || ''}" 
           alt="${game.title || 'Game'}" 
           class="game-thumbnail" 
           loading="lazy" 
           onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfjoYgTm8gSW1hZ2U8L3RleHQ+PC9zdmc+'">
      <div class="game-content">
        <h4 class="game-title">${game.title || 'Untitled Game'}</h4>
      </div>
    </div>
  `;
}

function generateStructuredData(game) {
  try {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Game",
      "name": game.title,
      "description": game.description || `Play ${game.title} free online`,
      "url": `https://unb-games.github.io/game.html?id=${game.id}`,
      "image": game.thumb || "https://unb-games.github.io/icon.png",
      "genre": game.category,
      "applicationCategory": "Game",
      "operatingSystem": "Any",
      "gamePlatform": getPlatformLabel(getGamePlatform(game)),
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Unblocked Games",
        "url": "https://unb-games.github.io/"
      }
    };

    const script = document.getElementById("gameStructuredData");
    if (script) {
      script.textContent = JSON.stringify(structuredData);
    }
  } catch (error) {
    console.error("Error generating structured data:", error);
  }
}

// Utility functions
function getGameById(id) {
  if (!window.gamesData) return null;
  return window.gamesData.find(game => game.id === id);
}

function getGamesByCategory(category) {
  if (!window.gamesData) return [];
  return window.gamesData.filter(game => game.category === category);
}

function getRandomGames(count = 12, excludeId = null) {
  if (!window.gamesData) return [];
  
  const availableGames = excludeId 
    ? window.gamesData.filter(game => game.id !== excludeId)
    : window.gamesData;
  
  const shuffled = [...availableGames].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getGamePlatform(game) {
  const mobile = isMobileOptimized(game);
  const desktop = isDesktopOptimized(game);
  
  if (mobile && desktop) return 'both';
  if (mobile) return 'mobile';
  if (desktop) return 'desktop';
  return 'both';
}

function isMobileOptimized(game) {
  if (!game) return false;
  
  const mobileKeywords = ['touch', 'tap', 'swipe', 'mobile', 'casual', 'simple', 'easy'];
  const title = (game.title || '').toLowerCase();
  const description = (game.description || '').toLowerCase();
  const tags = (game.tags || '').toLowerCase();
  
  const hasMobileKeywords = mobileKeywords.some(keyword => 
    title.includes(keyword) || description.includes(keyword) || tags.includes(keyword)
  );
  
  const width = parseInt(game.width) || 800;
  const height = parseInt(game.height) || 600;
  const isPortraitOrSquare = height >= width || Math.abs(width - height) < 100;
  
  const isMobileCategory = game.category === 'Hypercasual';
  
  return hasMobileKeywords || isPortraitOrSquare || isMobileCategory;
}

function isDesktopOptimized(game) {
  if (!game) return false;
  
  const desktopKeywords = ['keyboard', 'mouse', 'click', 'strategy', 'complex', 'wasd', 'arrow keys'];
  const title = (game.title || '').toLowerCase();
  const description = (game.description || '').toLowerCase();
  const tags = (game.tags || '').toLowerCase();
  
  const hasDesktopKeywords = desktopKeywords.some(keyword => 
    title.includes(keyword) || description.includes(keyword) || tags.includes(keyword)
  );
  
  const width = parseInt(game.width) || 800;
  const height = parseInt(game.height) || 600;
  const isWidescreen = width >= 800 && width > height * 1.3;
  
  const isDesktopCategory = ['Action', 'Sports', 'Strategy'].includes(game.category);
  
  return hasDesktopKeywords || isWidescreen || isDesktopCategory;
}

function getPlatformLabel(platform) {
  switch (platform) {
    case 'mobile':
      return '📱 Mobile';
    case 'desktop':
      return '💻 Desktop';
    case 'both':
      return '📱💻 All';
    default:
      return '🎮 Game';
  }
}

function playGame(gameId) {
  if (gameId) {
    // Use the gameIdToFilename mapping to get the filename
    if (window.gameIdToFilename && window.gameIdToFilename[gameId]) {
      window.location.href = `games/${window.gameIdToFilename[gameId]}`;
    } else {
      // Fallback to the old method if the mapping doesn't exist
      window.location.href = `game.html?id=${gameId}`;
    }
  }
}

function redirectToHome(reason) {
  console.log("Redirecting to home:", reason);
  setTimeout(() => {
    window.location.href = "index.html";
  }, 2000);
}

function showError(message) {
  const container = document.querySelector('.container');
  if (container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: #64748b;">
        <h2>😔 Oops!</h2>
        <p>${message}</p>
        <button onclick="location.reload()" style="background: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; margin-top: 1rem;">Try Again</button>
      </div>
    `;
  }
}
