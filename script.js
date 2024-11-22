// DOM Elements
const fontSelectorTrigger = document.querySelector(".font-selector-trigger");
const fontDropdown = document.querySelector(".font-dropdown");
const fontOptions = document.querySelectorAll(".font-option");
const fontName = document.getElementById("font-name");
const searchContainer = document.querySelector(".search-container");
const searchInput = document.getElementById("search-input");
const meaningsContainer = document.getElementById("meanings-container");
const dataContainer = document.querySelector(".data-container");
const errorMessageContainer = document.querySelector(".not-found-error");
const loading = document.querySelector(".loading");
const footer = document.querySelector("footer");
const searchForm = document.getElementById("search-form");
const themeSwitch = document.getElementById("theme-switch");
fontName.textContent = "Sans-Serif";

// Theme Switch Handler
themeSwitch.addEventListener("change", () => {
  document.body.classList.toggle("dark-theme", themeSwitch.checked);
});

// Font Selector Functionality
fontSelectorTrigger.addEventListener("click", () => {
  fontSelectorTrigger.classList.toggle("active");
  fontDropdown.style.display =
    fontDropdown.style.display === "flex" ? "none" : "flex";
});

fontOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const arrowIcon = fontSelectorTrigger.querySelector(".arrow-icon");
    fontSelectorTrigger.appendChild(arrowIcon);
    fontSelectorTrigger.classList.remove("active");
    fontDropdown.style.display = "none";

    // Apply selected font to body and update font name
    document.body.style.fontFamily = option.textContent;
    fontName.textContent = option.textContent;
  });
});

// Close Dropdown on Outside Click
window.addEventListener("click", (event) => {
  if (
    !fontSelectorTrigger.contains(event.target) &&
    !fontDropdown.contains(event.target)
  ) {
    fontSelectorTrigger.classList.remove("active");
    fontDropdown.style.display = "none";
  }
});

// Fetch Word Definition from API
async function fetchWordDefinition(word) {
  loading.classList.add("active");
  const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

  try {
    const response = await fetch(apiUrl);

    if (response.status === 404) {
      noWordFound(); 
      return;
    }

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    loading.classList.remove("active");
    updateData(data); 
  } catch (error) {
    console.error("Error fetching word definition:", error.message);
  }
}
fetchWordDefinition("keyboard");

// Update UI with Fetched Data
function updateData(data) {
  const wordElement = document.querySelector(".word");
  const phoneticContainer = document.querySelector(".phonetic");
  const playIconContainer = document.querySelector(".play-icon");

  // Clear previous data
  wordElement.textContent = "";
  phoneticContainer.textContent = "";
  playIconContainer.innerHTML = "";
  meaningsContainer.innerHTML = "";

  if (data && data.length > 0) {
    const wordData = data[0];
    wordElement.textContent = wordData.word || "N/A";
    phoneticContainer.textContent = wordData.phonetics[0]?.text || "";

    // Get the audio URL for the current word
    const audioUrl = data[0]?.phonetics.find(
      (phonetic) => phonetic.audio
    )?.audio;

    // Create the play button image
    const playButtonImg = document.createElement("img");
    playButtonImg.src = "./assets/images/icon-play.svg";
    playButtonImg.alt = "play button";
    playButtonImg.id = "play-button";

    // Append the play button to the play-icon container
    playIconContainer.appendChild(playButtonImg);

    // Add click event to play the audio
    playButtonImg.addEventListener("click", () => {
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
      } else {
        alert("No audio URL found!");
      }
    });

    // Render meanings and synonyms
    wordData.meanings.forEach(renderMeaning);

    // Add source link
    const sourceUrl =
      data[0]?.sourceUrls?.filter(
        (url) =>
          url === `https://en.wiktionary.org/wiki/${wordElement.textContent}`
      ) || "#";
    renderSourceLink(sourceUrl);
  }
}

// Render Individual Meaning Section
function renderMeaning(meaning) {
  const partContainer = document.createElement("div");
  partContainer.classList.add("speech-container");

  const partLabel = document.createElement("h2");
  partLabel.textContent = meaning.partOfSpeech;
  partContainer.appendChild(partLabel);

  const meaningContainer = document.createElement("div");
  meaningContainer.classList.add("meaning");
  const meaningTitle = document.createElement("h3");
  meaningTitle.textContent = "Meaning";
  meaningContainer.appendChild(meaningTitle);

  const ulElement = document.createElement("ul");
  ulElement.classList.add("list-container");
  meaning.definitions.forEach((def) => {
    const li = document.createElement("li");
    li.textContent = def.definition;

    if (def.example) {
      const example = document.createElement("blockquote");
      example.textContent = def.example;
      li.appendChild(example);
    }

    ulElement.appendChild(li);
  });
  meaningContainer.appendChild(ulElement);

  const synonymsContainer = document.createElement("div");
  synonymsContainer.classList.add("synonyms");
  const synonyms = document.createElement("p");
  const synonym = document.createElement("span");
  if (meaning.synonyms.length > 0) {
    synonyms.textContent = "Synonyms";
    synonym.textContent = `${meaning.synonyms.map((synonym) => " " + synonym)}`;
    synonyms.append(synonym);
    synonymsContainer.appendChild(synonyms);
    meaningContainer.appendChild(synonymsContainer);
  }

  partContainer.appendChild(meaningContainer);
  meaningsContainer.appendChild(partContainer);
}

// Render Source Link
function renderSourceLink(sourceUrl) {
  footer.innerHTML = "";
  const hrElement = document.createElement("hr");
  meaningsContainer.appendChild(hrElement);

  const sourceContainer = document.createElement("p");
  sourceContainer.classList.add("source-url");
  sourceContainer.textContent = "Source: ";

  const link = document.createElement("a");
  link.href = sourceUrl;
  link.target = "_blank";
  link.textContent = sourceUrl;

  const icon = document.createElement("img");
  icon.src = "./assets/images/icon-new-window.svg";
  icon.alt = "icon-new-window";
  link.appendChild(icon);

  sourceContainer.appendChild(link);
  footer.appendChild(sourceContainer);
}

// Handle Form Submission
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const word = searchInput.value.trim();

  if (word) {
    fetchWordDefinition(word);
    searchContainer.classList.remove("error");
  } else {
    showError("Whoops, can't be empty...");
  }
});

// Display No Word Found Message
function noWordFound() {
  dataContainer.textContent = "";
  footer.textContent = "";
  searchInput.value = "";

  errorMessageContainer.classList.add("active");
  dataContainer.appendChild(errorMessageContainer);
}

// Display field can't be empty message
function showError(message) {
  dataContainer.textContent = "";
  footer.textContent = "";
  searchInput.blur();

  const errorSpan = document.createElement("span");
  errorSpan.textContent = message;
  searchContainer.classList.add("error");
  dataContainer.appendChild(errorSpan);
}
