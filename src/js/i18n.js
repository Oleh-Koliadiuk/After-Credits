window.AnimeTracker = window.AnimeTracker || {};

(() => {
  const STORAGE_KEY = "aftercredits.language.v1";
  const languages = ["en", "uk", "ru"];
  const messages = {
    en: {
      pageTitle: "Anime Tracker — Your collection",
      metaDescription:
        "A quiet place to keep track of the anime you've watched.",
      archiveLabel: "YOUR PERSONAL ARCHIVE",
      languageLabel: "Interface language",
      brandHome: "Anime Tracker home",
      mainNavigation: "Main navigation",
      breadcrumb: "Breadcrumb",
      collectionStats: "Collection statistics",
      "auth.welcome": "Welcome back",
      "auth.create": "Create your account",
      "auth.signInDescription": "Sign in to open your anime collection.",
      "auth.createDescription":
        "Choose a username and password to create your account.",
      "auth.username": "USERNAME",
      "auth.password": "PASSWORD",
      "auth.signIn": "Sign in",
      "auth.createAccount": "Create account",
      "auth.newHere": "New here?",
      "auth.alreadyAccount": "Already have an account?",
      "auth.createLocal": "Create an account",
      "auth.err.username":
        "Use 3–30 Latin letters, numbers, dots, dashes, or underscores for your username.",
      "auth.err.passwordLength": "Use a password with at least 8 characters.",
      "auth.err.exists": "That username already has an account.",
      "auth.err.missing": "No account found with that username.",
      "auth.err.password": "The password doesn’t match this account.",
      "auth.err.storage": "Could not access local account storage.",
      library: "LIBRARY",
      collection: "My collection",
      collectionUpper: "MY COLLECTION",
      signOut: "Sign out",
      collectionSubtitle: "Track watched, watching, and planned anime.",
      addAnime: "Add anime",
      completed: "COMPLETED",
      titles: "titles",
      averageRating: "AVG. RATING",
      latestAddition: "LATEST ADDITION",
      watchedTitles: "Watched titles",
      collectionTitles: "All titles",
      "status.all": "All",
      "status.watching": "Watching",
      "status.watched": "Watched",
      "status.planned": "Planned",
      "status.label": "STATUS",
      statusForTitle: "Viewing status for {title}",
      filterByStatus: "Filter collection by status",
      statusSection: "COLLECTION STATUS",
      emptyFilter: "No titles match this search.",
      emptyStatusDescription: "Add an anime or choose another status.",
      "emptyStatus.watched": "Nothing watched here yet.",
      "emptyStatus.watching": "Nothing in progress yet.",
      "emptyStatus.planned": "Your watch plan is empty.",
      noteKicker: "YOUR NOTES",
      notesFor: "Notes for",
      noteLabel: "COMMENT",
      notesPlaceholder: "Write a note about this anime...",
      cancel: "Cancel",
      saveNote: "Save note",
      addNote: "Add comment",
      editNote: "Edit comment",
      closeNotes: "Close notes",
      faq: "FAQ",
      help: "HELP",
      faqTitle: "Frequently asked questions",
      closeFaq: "Close FAQ",
      "faq.addQuestion": "How do I add an anime?",
      "faq.addAnswer": "Search by title, choose a result, then set its status.",
      "faq.statusQuestion": "What do the statuses mean?",
      "faq.statusAnswer":
        "Watched is complete, Watching is in progress, and Planned is for your watchlist.",
      "faq.commentQuestion": "How do I add a comment?",
      "faq.commentAnswer":
        "Use Add comment on an anime card. You can edit it later.",
      "faq.searchQuestion": "Can I search in other languages?",
      "faq.searchAnswer":
        "Yes. Search using an anime title in the language you know.",
      chooseDate: "Choose a date",
      closeCalendar: "Close calendar",
      previousMonth: "Previous month",
      nextMonth: "Next month",
      clearDate: "Clear date",
      filterPlaceholder: "Filter your collection",
      filterLabel: "Filter your collection",
      newChapter: "COLLECTION",
      emptyTitle: "No anime yet.",
      emptyDescription: "Add an anime to your list.",
      addFirstTitle: "Add your first title",
      addToArchive: "ADD TO YOUR ARCHIVE",
      closeSearch: "Close search",
      findNext: "FIND YOUR NEXT ENTRY",
      findAnime: "Find an anime",
      searchDescription:
        "Search by title, then choose the matching poster for your collection.",
      searchPlaceholder: "Search anime titles...",
      clearSearch: "Clear search",
      searchStart: "Start typing to explore matching titles.",
      manualTitle: "Add the typed title without a poster",
      selectedTitle: "SELECTED TITLE",
      yourRating: "YOUR RATING",
      optional: "OPTIONAL",
      dateFinished: "DATE FINISHED",
      addToCollection: "Add to collection",
      dateNotSet: "DATE NOT SET",
      remove: "Remove",
      removeTitle: "Remove {title} from your collection",
      posterFor: "Poster for {title}",
      searchSelected: "Selected “{title}”.",
      searchSearching: "Searching titles…",
      searchMatches: "{count} matching titles.",
      searchMatchesOne: "1 matching title.",
      searchNone: "No matching titles found. Try another spelling.",
      searchShort: "Type at least 2 characters to search.",
      searchUnavailable:
        "Suggestions are unavailable. You can still add this title manually.",
      searchSlow: "Search took too long. Check your connection and try again.",
      searchBusy: "Search is busy. Try again in a moment.",
      searchError: "Couldn’t load titles. Check your connection and try again.",
      chooseAnime: "Choose an anime from the results first.",
      ratingError: "Enter a rating from 1 to 10 in 0.5 steps.",
      enterTitle: "Enter an anime title.",
      duplicate: "That title is already in your collection.",
      "format.TV": "TV",
      "format.TV_SHORT": "Short TV",
      "format.MOVIE": "Movie",
      "format.SPECIAL": "Special",
      "format.OVA": "OVA",
      "format.ONA": "ONA",
      "format.MUSIC": "Music",
      episodes: "{count} eps",
      titleCount: "{count} titles",
      titleCountOne: "1 title",
      loadingAccount: "Please wait…",
    },
    uk: {
      pageTitle: "Anime Tracker — Твоя колекція",
      metaDescription: "Зручне місце для обліку переглянутого аніме.",
      archiveLabel: "ТВОЯ ОСОБИСТА КОЛЕКЦІЯ",
      languageLabel: "Мова інтерфейсу",
      brandHome: "На головну Anime Tracker",
      mainNavigation: "Головна навігація",
      breadcrumb: "Навігаційний шлях",
      collectionStats: "Статистика колекції",
      "auth.welcome": "З поверненням",
      "auth.create": "Створи акаунт",
      "auth.signInDescription": "Увійди, щоб відкрити свою колекцію аніме.",
      "auth.createDescription": "Обери ім’я користувача та пароль для акаунта.",
      "auth.username": "ІМ’Я КОРИСТУВАЧА",
      "auth.password": "ПАРОЛЬ",
      "auth.signIn": "Увійти",
      "auth.createAccount": "Створити акаунт",
      "auth.newHere": "Ще не маєш акаунта?",
      "auth.alreadyAccount": "Вже маєш акаунт?",
      "auth.createLocal": "Створити акаунт",
      "auth.err.username":
        "Ім’я має містити 3–30 латинських літер, цифр, крапок, дефісів або підкреслень.",
      "auth.err.passwordLength": "Пароль має містити щонайменше 8 символів.",
      "auth.err.exists": "Акаунт із таким ім’ям уже існує.",
      "auth.err.missing": "Акаунт із таким ім’ям не знайдено.",
      "auth.err.password": "Пароль не збігається з цим акаунтом.",
      "auth.err.storage":
        "Не вдалося отримати доступ до локального сховища акаунтів.",
      library: "БІБЛІОТЕКА",
      collection: "Моя колекція",
      collectionUpper: "МОЯ КОЛЕКЦІЯ",
      signOut: "Вийти",
      collectionSubtitle:
        "Список переглянутого, поточного й запланованого аніме.",
      addAnime: "Додати аніме",
      completed: "ПЕРЕГЛЯНУТО",
      titles: "назв",
      averageRating: "СЕРЕДНЯ ОЦІНКА",
      latestAddition: "ОСТАННЄ ДОДАНО",
      watchedTitles: "Переглянуті аніме",
      collectionTitles: "Усі аніме",
      "status.all": "Усі",
      "status.watching": "Дивлюся",
      "status.watched": "Переглянуто",
      "status.planned": "Заплановано",
      "status.label": "СТАТУС",
      statusForTitle: "Статус перегляду: {title}",
      filterByStatus: "Фільтрувати колекцію за статусом",
      statusSection: "СТАТУС КОЛЕКЦІЇ",
      emptyFilter: "За цим запитом нічого не знайдено.",
      emptyStatusDescription: "Додай аніме або обери інший статус.",
      "emptyStatus.watched": "Переглянутих аніме поки немає.",
      "emptyStatus.watching": "Зараз нічого не дивишся.",
      "emptyStatus.planned": "Список запланованого поки порожній.",
      noteKicker: "ТВОЇ НОТАТКИ",
      notesFor: "Нотатка до",
      noteLabel: "КОМЕНТАР",
      notesPlaceholder: "Залиши нотатку про це аніме...",
      cancel: "Скасувати",
      saveNote: "Зберегти нотатку",
      addNote: "Додати коментар",
      editNote: "Редагувати коментар",
      closeNotes: "Закрити нотатки",
      faq: "FAQ",
      help: "ДОВІДКА",
      faqTitle: "Поширені запитання",
      closeFaq: "Закрити FAQ",
      "faq.addQuestion": "Як додати аніме?",
      "faq.addAnswer":
        "Знайди аніме за назвою, вибери результат і вкажи статус.",
      "faq.statusQuestion": "Що означають статуси?",
      "faq.statusAnswer":
        "Переглянуто — завершено, Дивлюся — у процесі, Заплановано — до перегляду.",
      "faq.commentQuestion": "Як додати коментар?",
      "faq.commentAnswer":
        "Натисни «Додати коментар» на картці аніме. Його можна відредагувати пізніше.",
      "faq.searchQuestion": "Чи можна шукати іншими мовами?",
      "faq.searchAnswer": "Так. Введи назву аніме будь-якою мовою.",
      chooseDate: "Обрати дату",
      closeCalendar: "Закрити календар",
      previousMonth: "Попередній місяць",
      nextMonth: "Наступний місяць",
      clearDate: "Очистити дату",
      filterPlaceholder: "Фільтр колекції",
      filterLabel: "Фільтр колекції",
      newChapter: "КОЛЕКЦІЯ",
      emptyTitle: "Аніме ще немає.",
      emptyDescription: "Додай аніме до свого списку.",
      addFirstTitle: "Додати перше аніме",
      addToArchive: "ДОДАТИ ДО КОЛЕКЦІЇ",
      closeSearch: "Закрити пошук",
      findNext: "ЗНАЙДИ НАСТУПНЕ АНІМЕ",
      findAnime: "Знайти аніме",
      searchDescription:
        "Знайди назву й обери відповідну обкладинку для колекції.",
      searchPlaceholder: "Пошук за назвою аніме...",
      clearSearch: "Очистити пошук",
      searchStart: "Почни вводити назву, щоб знайти аніме.",
      manualTitle: "Додати введену назву без постера",
      selectedTitle: "ОБРАНЕ АНІМЕ",
      yourRating: "ТВОЯ ОЦІНКА",
      optional: "НЕОБОВ’ЯЗКОВО",
      dateFinished: "ДАТА ПЕРЕГЛЯДУ",
      addToCollection: "Додати до колекції",
      dateNotSet: "ДАТУ НЕ ВКАЗАНО",
      remove: "Видалити",
      removeTitle: "Видалити «{title}» з колекції",
      posterFor: "Постер: {title}",
      searchSelected: "Обрано «{title}». ",
      searchSearching: "Шукаю назви…",
      searchMatches: "Знайдено варіантів: {count}.",
      searchMatchesOne: "Знайдено 1 варіант.",
      searchNone: "Збігів не знайдено. Спробуй інше написання.",
      searchShort: "Введи щонайменше 2 символи для пошуку.",
      searchUnavailable:
        "Не вдалося завантажити підказки. Можна додати назву вручну.",
      searchSlow:
        "Пошук триває надто довго. Перевір з’єднання й спробуй ще раз.",
      searchBusy: "Забагато запитів. Спробуй за мить.",
      searchError:
        "Не вдалося завантажити аніме. Перевір з’єднання й спробуй ще раз.",
      chooseAnime: "Спершу обери аніме серед результатів.",
      ratingError: "Оцінка має бути від 1 до 10 з кроком 0,5.",
      enterTitle: "Введи назву аніме.",
      duplicate: "Ця назва вже є у твоїй колекції.",
      "format.TV": "Серіал",
      "format.TV_SHORT": "Короткий серіал",
      "format.MOVIE": "Фільм",
      "format.SPECIAL": "Спецвипуск",
      "format.OVA": "OVA",
      "format.ONA": "ONA",
      "format.MUSIC": "Кліп",
      episodes: "{count} сер.",
      titleCount: "{count} назв",
      titleCountOne: "1 назва",
      loadingAccount: "Зачекай…",
    },
    ru: {
      pageTitle: "Anime Tracker — Твоя коллекция",
      metaDescription: "Удобное место для учёта просмотренного аниме.",
      archiveLabel: "ТВОЯ ЛИЧНАЯ КОЛЛЕКЦИЯ",
      languageLabel: "Язык интерфейса",
      brandHome: "На главную Anime Tracker",
      mainNavigation: "Главная навигация",
      breadcrumb: "Навигационная цепочка",
      collectionStats: "Статистика коллекции",
      "auth.welcome": "С возвращением",
      "auth.create": "Создай аккаунт",
      "auth.signInDescription": "Войди, чтобы открыть свою коллекцию аниме.",
      "auth.createDescription":
        "Выбери имя пользователя и пароль для аккаунта.",
      "auth.username": "ИМЯ ПОЛЬЗОВАТЕЛЯ",
      "auth.password": "ПАРОЛЬ",
      "auth.signIn": "Войти",
      "auth.createAccount": "Создать аккаунт",
      "auth.newHere": "Ещё нет аккаунта?",
      "auth.alreadyAccount": "Уже есть аккаунт?",
      "auth.createLocal": "Создать аккаунт",
      "auth.err.username":
        "Имя должно содержать 3–30 латинских букв, цифр, точек, дефисов или подчёркиваний.",
      "auth.err.passwordLength": "Пароль должен содержать не менее 8 символов.",
      "auth.err.exists": "Аккаунт с таким именем уже существует.",
      "auth.err.missing": "Аккаунт с таким именем не найден.",
      "auth.err.password": "Пароль не совпадает с этим аккаунтом.",
      "auth.err.storage":
        "Не удалось получить доступ к локальному хранилищу аккаунтов.",
      library: "БИБЛИОТЕКА",
      collection: "Моя коллекция",
      collectionUpper: "МОЯ КОЛЛЕКЦИЯ",
      signOut: "Выйти",
      collectionSubtitle:
        "Список просмотренного, текущего и запланированного аниме.",
      addAnime: "Добавить аниме",
      completed: "ПРОСМОТРЕНО",
      titles: "названий",
      averageRating: "СРЕДНЯЯ ОЦЕНКА",
      latestAddition: "ПОСЛЕДНЕЕ ДОБАВЛЕНО",
      watchedTitles: "Просмотренные аниме",
      collectionTitles: "Все аниме",
      "status.all": "Все",
      "status.watching": "Смотрю",
      "status.watched": "Просмотрено",
      "status.planned": "Запланировано",
      "status.label": "СТАТУС",
      statusForTitle: "Статус просмотра: {title}",
      filterByStatus: "Фильтровать коллекцию по статусу",
      statusSection: "СТАТУС КОЛЛЕКЦИИ",
      emptyFilter: "По этому запросу ничего не найдено.",
      emptyStatusDescription: "Добавь аниме или выбери другой статус.",
      "emptyStatus.watched": "Просмотренных аниме пока нет.",
      "emptyStatus.watching": "Сейчас ты ничего не смотришь.",
      "emptyStatus.planned": "Список запланированного пока пуст.",
      noteKicker: "ТВОИ ЗАМЕТКИ",
      notesFor: "Заметка к",
      noteLabel: "КОММЕНТАРИЙ",
      notesPlaceholder: "Оставь заметку об этом аниме...",
      cancel: "Отмена",
      saveNote: "Сохранить заметку",
      addNote: "Добавить комментарий",
      editNote: "Изменить комментарий",
      closeNotes: "Закрыть заметки",
      faq: "FAQ",
      help: "СПРАВКА",
      faqTitle: "Частые вопросы",
      closeFaq: "Закрыть FAQ",
      "faq.addQuestion": "Как добавить аниме?",
      "faq.addAnswer":
        "Найди аниме по названию, выбери результат и укажи статус.",
      "faq.statusQuestion": "Что означают статусы?",
      "faq.statusAnswer":
        "Просмотрено — завершено, Смотрю — в процессе, Запланировано — в списке на просмотр.",
      "faq.commentQuestion": "Как добавить комментарий?",
      "faq.commentAnswer":
        "Нажми «Добавить комментарий» на карточке аниме. Его можно изменить позже.",
      "faq.searchQuestion": "Можно искать на других языках?",
      "faq.searchAnswer": "Да. Введи название аниме на любом языке.",
      chooseDate: "Выбрать дату",
      closeCalendar: "Закрыть календарь",
      previousMonth: "Предыдущий месяц",
      nextMonth: "Следующий месяц",
      clearDate: "Очистить дату",
      filterPlaceholder: "Фильтр коллекции",
      filterLabel: "Фильтр коллекции",
      newChapter: "КОЛЛЕКЦИЯ",
      emptyTitle: "Аниме пока нет.",
      emptyDescription: "Добавь аниме в свой список.",
      addFirstTitle: "Добавить первое аниме",
      addToArchive: "ДОБАВИТЬ В КОЛЛЕКЦИЮ",
      closeSearch: "Закрыть поиск",
      findNext: "НАЙДИ СЛЕДУЮЩЕЕ АНИМЕ",
      findAnime: "Найти аниме",
      searchDescription:
        "Найди название и выбери подходящий постер для коллекции.",
      searchPlaceholder: "Поиск по названию аниме...",
      clearSearch: "Очистить поиск",
      searchStart: "Начни вводить название, чтобы найти аниме.",
      manualTitle: "Добавить название без постера",
      selectedTitle: "ВЫБРАННОЕ АНИМЕ",
      yourRating: "ТВОЯ ОЦЕНКА",
      optional: "НЕОБЯЗАТЕЛЬНО",
      dateFinished: "ДАТА ПРОСМОТРА",
      addToCollection: "Добавить в коллекцию",
      dateNotSet: "ДАТА НЕ УКАЗАНА",
      remove: "Удалить",
      removeTitle: "Удалить «{title}» из коллекции",
      posterFor: "Постер: {title}",
      searchSelected: "Выбрано «{title}». ",
      searchSearching: "Ищу названия…",
      searchMatches: "Найдено вариантов: {count}.",
      searchMatchesOne: "Найден 1 вариант.",
      searchNone: "Совпадений не найдено. Попробуй другое написание.",
      searchShort: "Введи не менее 2 символов для поиска.",
      searchUnavailable:
        "Не удалось загрузить подсказки. Можно добавить название вручную.",
      searchSlow:
        "Поиск занимает слишком много времени. Проверь соединение и попробуй ещё раз.",
      searchBusy: "Слишком много запросов. Попробуй через минуту.",
      searchError:
        "Не удалось загрузить аниме. Проверь соединение и попробуй ещё раз.",
      chooseAnime: "Сначала выбери аниме среди результатов.",
      ratingError: "Оценка должна быть от 1 до 10 с шагом 0,5.",
      enterTitle: "Введи название аниме.",
      duplicate: "Это название уже есть в твоей коллекции.",
      "format.TV": "Сериал",
      "format.TV_SHORT": "Короткий сериал",
      "format.MOVIE": "Фильм",
      "format.SPECIAL": "Спецвыпуск",
      "format.OVA": "OVA",
      "format.ONA": "ONA",
      "format.MUSIC": "Клип",
      episodes: "{count} сер.",
      titleCount: "{count} названий",
      titleCountOne: "1 название",
      loadingAccount: "Подожди…",
    },
  };

  function storedLanguage() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return languages.includes(value) ? value : "en";
    } catch {
      return "en";
    }
  }

  let language = storedLanguage();

  function t(key, variables = {}) {
    let message = messages[language][key] ?? messages.en[key] ?? key;
    for (const [name, value] of Object.entries(variables)) {
      message = message.replaceAll(`{${name}}`, String(value));
    }
    return message;
  }

  function formatCount(count) {
    return `${count} ${titleUnit(count)}`;
  }

  function titleUnit(count) {
    if (language === "en") return count === 1 ? "title" : "titles";
    if (language === "uk") {
      const mod10 = count % 10;
      const mod100 = count % 100;
      return mod10 === 1 && mod100 !== 11
        ? "назва"
        : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
          ? "назви"
          : "назв";
    }
    const mod10 = count % 10;
    const mod100 = count % 100;
    return mod10 === 1 && mod100 !== 11
      ? "название"
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? "названия"
        : "названий";
  }

  function apply() {
    document.documentElement.lang = language;
    document.title = t("pageTitle");
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      node.placeholder = t(node.dataset.i18nPlaceholder);
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
      node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel));
    });
    document.querySelectorAll("[data-i18n-title]").forEach((node) => {
      node.setAttribute("title", t(node.dataset.i18nTitle));
    });
    document.querySelectorAll("[data-i18n-content]").forEach((node) => {
      node.setAttribute("content", t(node.dataset.i18nContent));
    });
    document.querySelectorAll(".language-select").forEach((select) => {
      select.value = language;
    });
  }

  function setLanguage(value) {
    if (!languages.includes(value) || value === language) return;
    language = value;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // The interface still changes if browser storage is unavailable.
    }
    apply();
    document.dispatchEvent(
      new CustomEvent("languagechange", { detail: { language } }),
    );
  }

  document.querySelectorAll(".language-select").forEach((select) => {
    select.addEventListener("change", () => setLanguage(select.value));
  });
  apply();

  window.AnimeTracker.i18n = {
    t,
    formatCount,
    titleUnit,
    setLanguage,
    get language() {
      return language;
    },
  };
})();
