(() => {
  const { auth, storage, collection, view, animeApi, i18n } =
    window.AnimeTracker;
  const authScreen = document.querySelector("#auth-screen");
  const appShell = document.querySelector("#app-shell");
  const authForm = document.querySelector("#auth-form");
  const authError = document.querySelector("#auth-error");
  const authSubmit = document.querySelector("#auth-submit");
  const authSwitch = document.querySelector("#auth-switch");
  const authBannerImage = document.querySelector("#auth-banner-image");
  const authTitle = document.querySelector("#auth-title");
  const authDescription = document.querySelector("#auth-description");
  const authSwitchPrompt = document.querySelector("#auth-switch-prompt");
  const authPassword = document.querySelector("#auth-password");
  const authEmail = document.querySelector("#auth-email");
  const authPasswordConfirm = document.querySelector("#auth-password-confirm");
  const passwordToggle = document.querySelector("#password-toggle");
  const passwordConfirmToggle = document.querySelector(
    "#password-confirm-toggle",
  );
  const animeStatus = document.querySelector("#anime-status");
  const ratingField = document.querySelector("#rating-field");
  const watchedDateField = document.querySelector("#watched-date-field");
  let isRegistering = false;
  let activeUser = "";
  let profileData = null;
  let avatarDraft = null;
  let animeList = [];
  let selectedAnime = null;
  let statusFilter = "all";
  let editingNoteId = null;
  let calendarMonth = new Date();
  let searchTimer = 0;
  let searchController = null;
  let searchMessage = { key: "", values: {} };
  let collectionError = "";

  function loadAuthArtwork() {
    if (!authBannerImage || authBannerImage.dataset.loaded === "true") return;
    animeApi
      .featured()
      .then((titles) => {
        const background = titles.find((title) => title.imageUrl)?.imageUrl;
        if (!background) return;
        authBannerImage.addEventListener(
          "error",
          () => {
            authBannerImage.hidden = true;
          },
          { once: true },
        );
        authBannerImage.src = background;
        authBannerImage.hidden = false;
        authBannerImage.dataset.loaded = "true";
      })
      .catch(() => {});
  }

  function setSearchStatus(key, values = {}) {
    searchMessage = { key, values };
    view.setSearchStatus(key ? i18n.t(key, values) : "");
  }

  function updateCompletionFields() {
    const isWatched = animeStatus.value === "watched";
    ratingField.hidden = !isWatched;
    watchedDateField.hidden = !isWatched;
    document
      .querySelector("#selection-panel")
      .classList.toggle("without-completion-fields", !isWatched);
    if (!isWatched) document.querySelector("#form-error").textContent = "";
  }

  function updateAuthMode() {
    authTitle.querySelector("[data-i18n]").textContent = i18n.t(
      isRegistering ? "auth.create" : "auth.welcome",
    );
    authDescription.querySelector("[data-i18n]").textContent = i18n.t(
      isRegistering ? "auth.createDescription" : "auth.signInDescription",
    );
    authSubmit.querySelector("[data-i18n]").textContent = i18n.t(
      isRegistering ? "auth.createAccount" : "auth.signIn",
    );
    authSwitchPrompt.textContent = i18n.t(
      isRegistering ? "auth.alreadyAccount" : "auth.newHere",
    );
    authSwitch.querySelector("[data-i18n]").textContent = i18n.t(
      isRegistering ? "auth.signIn" : "auth.createLocal",
    );
    authPassword.autocomplete = isRegistering
      ? "new-password"
      : "current-password";
    document.querySelector("#auth-email-field").hidden = !isRegistering;
    document.querySelector("#auth-password-confirm-field").hidden =
      !isRegistering;
    authEmail.disabled = !isRegistering;
    authEmail.required = isRegistering;
    authPasswordConfirm.disabled = !isRegistering;
    authPasswordConfirm.required = isRegistering;
    updatePasswordToggleLabel();
  }

  function updatePasswordToggleLabel() {
    if (passwordToggle) {
      const visible = authPassword.type === "text";
      const key = visible ? "auth.hidePassword" : "auth.showPassword";
      passwordToggle.classList.toggle("is-visible", visible);
      passwordToggle.setAttribute("aria-pressed", String(visible));
      passwordToggle.setAttribute("aria-label", i18n.t(key));
      passwordToggle.title = i18n.t(key);
    }
    if (passwordConfirmToggle) {
      const visible = authPasswordConfirm.type === "text";
      const key = visible ? "auth.hidePassword" : "auth.showPassword";
      passwordConfirmToggle.classList.toggle("is-visible", visible);
      passwordConfirmToggle.setAttribute("aria-pressed", String(visible));
      passwordConfirmToggle.setAttribute("aria-label", i18n.t(key));
      passwordConfirmToggle.title = i18n.t(key);
    }
  }

  function showAuth() {
    appShell.hidden = true;
    authScreen.hidden = false;
    loadAuthArtwork();
  }

  async function startApplication(username) {
    activeUser = username;
    animeList = await storage.load();
    profileData = await auth.getProfile();
    avatarDraft = profileData.avatarData;
    collectionError = "";
    document.querySelector("#profile-name").textContent = activeUser;
    renderProfile({ syncFields: true });
    showSection("collection");
    authScreen.hidden = true;
    appShell.hidden = false;
    render();
  }

  function setAvatar(element, username, imageData) {
    const initial =
      Array.from((username || "?").trim())[0]?.toLocaleUpperCase() || "?";
    element.textContent = imageData ? "" : initial;
    element.style.backgroundImage = imageData ? `url("${imageData}")` : "";
    element.setAttribute("aria-label", username || "?");
  }

  function renderProfile({ syncFields = false } = {}) {
    if (!profileData) return;
    const username = profileData.username || activeUser;
    document.querySelector("#profile-name").textContent = username;
    document.querySelector("#profile-display-name").textContent = username;
    if (syncFields) {
      document.querySelector("#profile-username").value = username;
      document.querySelector("#profile-email").value = profileData.email || "";
    }
    document.querySelector("#profile-title-count").textContent = String(
      animeList.length,
    );
    const joined = profileData.joinedAt?.slice(0, 10);
    document.querySelector("#profile-joined").textContent = joined
      ? new Intl.DateTimeFormat(i18n.language, {
          dateStyle: "long",
          timeZone: "UTC",
        }).format(new Date(`${joined}T00:00:00Z`))
      : "—";
    setAvatar(
      document.querySelector("#profile-avatar"),
      username,
      profileData.avatarData,
    );
    setAvatar(
      document.querySelector("#topbar-avatar"),
      username,
      profileData.avatarData,
    );
    setAvatar(
      document.querySelector("#profile-large-avatar"),
      username,
      avatarDraft,
    );
    document.querySelector("#avatar-remove").hidden = !avatarDraft;
  }

  function showSection(section) {
    const isProfile = section === "profile";
    document.querySelector("#collection").hidden = isProfile;
    document.querySelector("#profile-section").hidden = !isProfile;
    document
      .querySelector("#collection-nav")
      .classList.toggle("active", !isProfile);
    document
      .querySelector("#profile-nav")
      .classList.toggle("active", isProfile);
    document
      .querySelector("#collection-nav")
      .toggleAttribute("aria-current", !isProfile);
    document
      .querySelector("#profile-nav")
      .toggleAttribute("aria-current", isProfile);
    const breadcrumb = document.querySelector("#breadcrumb-current");
    breadcrumb.textContent = i18n.t(
      isProfile ? "profile.title" : "collectionUpper",
    );
  }

  authSwitch.addEventListener("click", () => {
    isRegistering = !isRegistering;
    authError.textContent = "";
    authForm.reset();
    authPassword.type = "password";
    authPasswordConfirm.type = "password";
    updateAuthMode();
  });

  passwordToggle.addEventListener("click", () => {
    authPassword.type = authPassword.type === "password" ? "text" : "password";
    updatePasswordToggleLabel();
    authPassword.focus();
  });

  if (passwordConfirmToggle) {
    passwordConfirmToggle.addEventListener("click", () => {
      authPasswordConfirm.type =
        authPasswordConfirm.type === "password" ? "text" : "password";
      updatePasswordToggleLabel();
      authPasswordConfirm.focus();
    });
  }

  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    authError.textContent = "";
    authSubmit.disabled = true;
    const data = new FormData(authForm);
    const usernameInput = String(data.get("username") || "");
    const passwordInput = String(data.get("password") || "");
    const emailInput = String(data.get("email") || "").trim();
    if (isRegistering && !/^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(emailInput)) {
      authError.textContent = i18n.t("auth.err.gmail");
      authSubmit.disabled = false;
      return;
    }
    if (
      isRegistering &&
      passwordInput !== String(data.get("passwordConfirm") || "")
    ) {
      authError.textContent = i18n.t("auth.err.passwordMismatch");
      authSubmit.disabled = false;
      return;
    }
    try {
      const username = isRegistering
        ? await auth.register(usernameInput, passwordInput, emailInput)
        : await auth.login(usernameInput, passwordInput);
      await startApplication(username);
    } catch (error) {
      authError.textContent = error.message || i18n.t("auth.err.connection");
    } finally {
      authSubmit.disabled = false;
    }
  });

  function render() {
    const collectionErrorElement = document.querySelector("#collection-error");
    collectionErrorElement.textContent = collectionError;
    collectionErrorElement.hidden = !collectionError;
    view.render(
      animeList,
      document.querySelector("#filter-input").value,
      statusFilter,
      removeAnime,
      changeStatus,
      editNotes,
    );
  }

  async function removeAnime(id) {
    try {
      await storage.remove(id);
      animeList = collection.remove(animeList, id);
      collectionError = "";
    } catch (error) {
      collectionError = error.message;
    }
    render();
  }

  async function changeStatus(id, status) {
    try {
      await storage.update(id, { status });
      animeList = collection.updateStatus(animeList, id, status);
      collectionError = "";
    } catch (error) {
      collectionError = error.message;
    }
    render();
  }

  function editNotes(item) {
    editingNoteId = item.id;
    document.querySelector("#notes-anime-title").textContent = item.title;
    document.querySelector("#notes-input").value = item.notes || "";
    document.querySelector("#notes-error").textContent = "";
    document.querySelector("#notes-dialog").showModal();
    document.querySelector("#notes-input").focus();
  }

  function closeSuggestions() {
    view.renderSuggestions([], selectAnime);
  }

  function formatAnimeMeta(anime) {
    return [
      anime.year,
      anime.type ? i18n.t(`format.${anime.type}`) : "",
      anime.episodes ? i18n.t("episodes", { count: anime.episodes }) : "",
    ]
      .filter(Boolean)
      .join(" · ");
  }

  function selectAnime(anime) {
    window.clearTimeout(searchTimer);
    if (searchController) searchController.abort();
    searchController = null;
    closeSuggestions();
    selectedAnime = anime;
    document.querySelector("#form-error").textContent = "";
    document.querySelector("#manual-title-button").hidden = true;
    document.querySelector("#search-start").hidden = true;
    document.querySelector("#anime-title").value = anime.title;
    document.querySelector("#selected-title").textContent = anime.title;
    document.querySelector("#selected-meta").textContent =
      formatAnimeMeta(anime);
    const poster = document.querySelector("#selected-poster");
    poster.hidden = !anime.imageUrl;
    poster.src = anime.imageUrl || "";
    document.querySelector("#selection-panel").hidden = false;
    setSearchStatus("searchSelected", { title: anime.title });
  }

  function searchTitle(query) {
    if (searchController) searchController.abort();
    searchController = null;
    if (query.trim().length < 2) {
      closeSuggestions();
      document.querySelector("#manual-title-button").hidden = true;
      document.querySelector("#selection-panel").hidden = true;
      document.querySelector("#search-start").hidden = query.length > 0;
      document.querySelector("#clear-search").hidden = query.length === 0;
      setSearchStatus(query.length ? "searchShort" : "");
      return;
    }
    searchController = new AbortController();
    const controller = searchController;
    view.renderSuggestions([], selectAnime);
    document.querySelector("#manual-title-button").hidden = true;
    document.querySelector("#search-start").hidden = true;
    document.querySelector("#clear-search").hidden = false;
    setSearchStatus("searchSearching");
    animeApi
      .search(query.trim(), controller.signal)
      .then((results) => {
        if (controller.signal.aborted) return;
        view.renderSuggestions(results, selectAnime);
        document.querySelector("#manual-title-button").hidden =
          results.length > 0;
        setSearchStatus(
          results.length
            ? results.length === 1
              ? "searchMatchesOne"
              : "searchMatches"
            : "searchNone",
          { count: results.length },
        );
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        view.renderSuggestions([], selectAnime);
        document.querySelector("#manual-title-button").hidden = false;
        const errorKey =
          error.code === "SEARCH_TIMEOUT"
            ? "searchSlow"
            : error.code === "SEARCH_BUSY"
              ? "searchBusy"
              : "searchError";
        setSearchStatus(errorKey);
      });
  }

  function openDialog() {
    document.querySelector("#anime-form").reset();
    updateCompletionFields();
    updateDateDisplay();
    document.querySelector("#form-error").textContent = "";
    setSearchStatus("");
    document.querySelector("#search-start").hidden = false;
    document.querySelector("#clear-search").hidden = true;
    document.querySelector("#selection-panel").hidden = true;
    document.querySelector("#manual-title-button").hidden = true;
    view.renderSuggestions([], selectAnime);
    selectedAnime = null;
    if (searchController) searchController.abort();
    closeSuggestions();
    document.querySelector("#anime-dialog").showModal();
    document.querySelector("#anime-title").focus();
  }

  document.querySelector("#logout-button").addEventListener("click", () => {
    auth.logout().finally(() => {
      activeUser = "";
      animeList = [];
      profileData = null;
      avatarDraft = null;
      showAuth();
      document.querySelector("#auth-form").reset();
      document.querySelector("#auth-error").textContent = "";
    });
  });

  function openProfile(event) {
    event?.preventDefault();
    if (!profileData) return;
    renderProfile({ syncFields: true });
    showSection("profile");
    document.querySelector("#profile-message").textContent = "";
    document.querySelector("#profile-message").classList.remove("error");
  }
  document.querySelector("#profile-nav").addEventListener("click", openProfile);
  document
    .querySelector("#profile-trigger")
    .addEventListener("click", openProfile);
  document
    .querySelector("#topbar-avatar")
    .addEventListener("click", openProfile);
  document
    .querySelector("#collection-nav")
    .addEventListener("click", (event) => {
      event.preventDefault();
      showSection("collection");
    });
  document
    .querySelector("#profile-back")
    .addEventListener("click", () => showSection("collection"));

  document.querySelector("#avatar-choose").addEventListener("click", () => {
    document.querySelector("#avatar-file").click();
  });
  document
    .querySelector("#avatar-file")
    .addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const message = document.querySelector("#profile-message");
      if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
        message.textContent = i18n.t("profile.imageError");
        message.classList.add("error");
        event.target.value = "";
        return;
      }
      try {
        const image = await createImageBitmap(file);
        const scale = Math.min(1, 320 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas
          .getContext("2d")
          .drawImage(image, 0, 0, canvas.width, canvas.height);
        image.close();
        avatarDraft = canvas.toDataURL("image/jpeg", 0.8);
        renderProfile();
        message.textContent = "";
        message.classList.remove("error");
      } catch {
        message.textContent = i18n.t("profile.imageError");
        message.classList.add("error");
      }
      event.target.value = "";
    });
  document.querySelector("#avatar-remove").addEventListener("click", () => {
    avatarDraft = null;
    renderProfile();
  });
  document
    .querySelector("#profile-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = document.querySelector("#profile-message");
      const submit = event.currentTarget.querySelector('[type="submit"]');
      submit.disabled = true;
      message.classList.remove("error");
      message.textContent = i18n.t("profile.saving");
      try {
        profileData = await auth.updateProfile({
          username: document.querySelector("#profile-username").value.trim(),
          email: document.querySelector("#profile-email").value.trim() || null,
          avatarData: avatarDraft,
        });
        avatarDraft = profileData.avatarData;
        renderProfile({ syncFields: true });
        message.textContent = i18n.t("profile.saved");
      } catch (error) {
        message.textContent =
          error.code === "USERNAME_TAKEN"
            ? i18n.t("profile.usernameTaken")
            : error.code === "RATE_LIMITED"
              ? i18n.t("profile.rateLimited")
              : error.code === "INVALID_INPUT"
                ? i18n.t("profile.usernameHint")
                : i18n.t("profile.error");
        message.classList.add("error");
      } finally {
        submit.disabled = false;
      }
    });

  document.querySelector("#open-form").addEventListener("click", openDialog);
  document.querySelector("#empty-add").addEventListener("click", openDialog);
  animeStatus.addEventListener("change", updateCompletionFields);
  document.querySelectorAll("#faq-open, #faq-open-mobile").forEach((button) => {
    button.addEventListener("click", () =>
      document.querySelector("#faq-dialog").showModal(),
    );
  });
  document
    .querySelector("#faq-close")
    .addEventListener("click", () =>
      document.querySelector("#faq-dialog").close(),
    );
  document
    .querySelector("#close-form")
    .addEventListener("click", () =>
      document.querySelector("#anime-dialog").close(),
    );
  document.querySelector("#anime-dialog").addEventListener("close", () => {
    if (searchController) searchController.abort();
    searchController = null;
  });
  document.querySelector("#filter-input").addEventListener("input", render);
  document.querySelectorAll("[data-status-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      statusFilter = button.dataset.statusFilter;
      render();
    });
  });

  document
    .querySelector("#notes-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const notes = document.querySelector("#notes-input").value;
      try {
        await storage.update(editingNoteId, { notes });
        animeList = collection.updateNotes(animeList, editingNoteId, notes);
        collectionError = "";
        document.querySelector("#notes-dialog").close();
        editingNoteId = null;
        render();
      } catch (error) {
        document.querySelector("#notes-error").textContent = error.message;
      }
    });
  document
    .querySelector("#close-notes")
    .addEventListener("click", () =>
      document.querySelector("#notes-dialog").close(),
    );
  document
    .querySelector("#cancel-notes")
    .addEventListener("click", () =>
      document.querySelector("#notes-dialog").close(),
    );
  document.querySelector("#notes-dialog").addEventListener("close", () => {
    editingNoteId = null;
  });

  document.addEventListener("languagechange", () => {
    updateAuthMode();
    authError.textContent = "";
    formError.textContent = "";
    updateDateDisplay();
    if (calendarDialog.open) renderCalendar();
    render();
    if (profileData) {
      renderProfile();
      showSection(
        document.querySelector("#profile-section").hidden
          ? "collection"
          : "profile",
      );
    }
    if (searchMessage.key)
      view.setSearchStatus(i18n.t(searchMessage.key, searchMessage.values));
    if (selectedAnime) {
      document.querySelector("#selected-meta").textContent =
        formatAnimeMeta(selectedAnime);
    }
  });

  const animeTitle = document.querySelector("#anime-title");
  const ratingInput = document.querySelector('[name="rating"]');
  const formError = document.querySelector("#form-error");
  const dateInput = document.querySelector('[name="watchedAt"]');
  const dateDisplay = document.querySelector("#date-display");
  const calendarDialog = document.querySelector("#calendar-dialog");

  function updateDateDisplay() {
    if (!dateInput.value) {
      dateDisplay.textContent = "—";
      return;
    }
    dateDisplay.textContent = new Intl.DateTimeFormat(i18n.language, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${dateInput.value}T00:00:00Z`));
  }

  function renderCalendar() {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    document.querySelector("#calendar-month").textContent =
      new Intl.DateTimeFormat(i18n.language, {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(Date.UTC(year, month, 1)));

    const weekdayFormatter = new Intl.DateTimeFormat(i18n.language, {
      weekday: "short",
      timeZone: "UTC",
    });
    const weekdays = document.querySelector("#calendar-weekdays");
    weekdays.replaceChildren(
      ...Array.from({ length: 7 }, (_, index) => {
        const day = document.createElement("span");
        day.textContent = weekdayFormatter.format(
          new Date(Date.UTC(2024, 0, index + 1)),
        );
        return day;
      }),
    );

    const days = document.querySelector("#calendar-days");
    const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const offset = (firstWeekday + 6) % 7;
    const monthLength = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const selected = dateInput.value;
    const today = new Date();
    const todayIso = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");
    const cells = Array.from({ length: offset }, () => {
      const blank = document.createElement("span");
      blank.className = "calendar-day-empty";
      blank.setAttribute("aria-hidden", "true");
      return blank;
    });

    for (let dayNumber = 1; dayNumber <= monthLength; dayNumber += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "calendar-day";
      button.textContent = String(dayNumber);
      const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
      button.classList.toggle("selected", iso === selected);
      button.classList.toggle("today", iso === todayIso);
      button.setAttribute(
        "aria-label",
        new Intl.DateTimeFormat(i18n.language, {
          dateStyle: "full",
          timeZone: "UTC",
        }).format(new Date(`${iso}T00:00:00Z`)),
      );
      button.setAttribute("aria-pressed", String(iso === selected));
      button.addEventListener("click", () => {
        dateInput.value = iso;
        updateDateDisplay();
        calendarDialog.close();
      });
      cells.push(button);
    }
    days.replaceChildren(...cells);
  }

  document.querySelector("#calendar-open").addEventListener("click", () => {
    if (dateInput.value) {
      const [year, month] = dateInput.value.split("-").map(Number);
      calendarMonth = new Date(year, month - 1, 1);
    } else {
      const now = new Date();
      calendarMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    renderCalendar();
    calendarDialog.showModal();
  });
  document.querySelector("#calendar-previous").addEventListener("click", () => {
    calendarMonth = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth() - 1,
      1,
    );
    renderCalendar();
  });
  document.querySelector("#calendar-next").addEventListener("click", () => {
    calendarMonth = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth() + 1,
      1,
    );
    renderCalendar();
  });
  document.querySelector("#calendar-clear").addEventListener("click", () => {
    dateInput.value = "";
    updateDateDisplay();
    calendarDialog.close();
  });
  ["#calendar-close", "#calendar-cancel"].forEach((selector) => {
    document
      .querySelector(selector)
      .addEventListener("click", () => calendarDialog.close());
  });

  function validateRating() {
    const value = ratingInput.value.trim();
    if (!value) {
      formError.textContent = "";
      return true;
    }
    const rating = Number(value);
    const valid =
      Number.isFinite(rating) &&
      rating >= 1 &&
      rating <= 10 &&
      Number.isInteger(rating * 2);
    formError.textContent = valid ? "" : i18n.t("ratingError");
    return valid;
  }

  ratingInput.addEventListener("input", validateRating);
  ratingInput.addEventListener("invalid", (event) => {
    event.preventDefault();
    validateRating();
  });
  animeTitle.addEventListener("input", () => {
    const query = animeTitle.value;
    if (searchController) searchController.abort();
    searchController = null;
    if (!selectedAnime || query.trim() !== selectedAnime.title)
      selectedAnime = null;
    if (!selectedAnime) {
      formError.textContent = "";
      document.querySelector("#selection-panel").hidden = true;
      view.renderSuggestions([], selectAnime);
      document.querySelector("#manual-title-button").hidden = true;
    }
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => searchTitle(query), 500);
  });
  document.querySelector("#clear-search").addEventListener("click", () => {
    animeTitle.value = "";
    animeTitle.dispatchEvent(new Event("input", { bubbles: true }));
    animeTitle.focus();
  });
  document
    .querySelector("#manual-title-button")
    .addEventListener("click", () => {
      const title = animeTitle.value.trim();
      if (!title) return;
      selectAnime({
        title,
        id: null,
        imageUrl: "",
        year: "",
        type: "",
        episodes: null,
      });
    });

  document
    .querySelector("#anime-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      try {
        if (!selectedAnime) throw new Error(i18n.t("chooseAnime"));
        const status = String(data.get("status") || "watched");
        if (status === "watched" && !validateRating())
          throw new Error(i18n.t("ratingError"));
        const [entry] = collection.add(animeList, {
          title: selectedAnime.title,
          rating:
            status === "watched" ? String(data.get("rating") || "").trim() : "",
          watchedAt:
            status === "watched" ? String(data.get("watchedAt") || "") : "",
          malId: selectedAnime?.id,
          imageUrl: selectedAnime?.imageUrl,
          status,
        });
        const savedEntry = await storage.add(entry);
        animeList = [savedEntry, ...animeList];
        collectionError = "";
        document.querySelector("#filter-input").value = "";
        statusFilter = "all";
        render();
        document.querySelector("#anime-dialog").close();
      } catch (error) {
        document.querySelector("#form-error").textContent = error.message;
      }
    });

  updateAuthMode();
  auth
    .currentUser()
    .then((existingUser) => {
      if (existingUser) return startApplication(existingUser);
      document.querySelector("#auth-username").value = auth.suggestedUsername();
      showAuth();
    })
    .catch((error) => {
      authError.textContent = error.message || i18n.t("auth.err.connection");
      showAuth();
    });
})();
