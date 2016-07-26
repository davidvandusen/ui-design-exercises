(function ($, Handlebars) {
  const templates = {};

  function init() {
    configureHandlebars();
    loadUI();
  }

  function configureHandlebars() {
    Handlebars.registerHelper('ordinalSuffix', (function (ordinalSuffixes, number) {
      return ordinalSuffixes[number % 10];
    }).bind(null, ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th']));

    templates.building = Handlebars.compile($('#building-template').html());
  }

  function loadUI() {
    $.getJSON('data/building.json', function (building) {
      renderUI(building);
      initUI();
    });
  }

  function renderUI(building) {
    $('#building-container').html(templates.building({
      building: building
    }));
  }

  function initUI() {
    const viewModeSuffix = '-view';

    const activeClass = 'active';

    const stateHistory = [];

    const defaultView = ['building', null];

    const rootEl = document.body;

    const $rootEl = $(rootEl);

    function isView(mode) {
      return $rootEl.hasClass(viewClass(mode));
    }

    function isBuildingView() {
      return isView('building');
    }

    function isFloorView() {
      return isView('floor');
    }

    function getView() {
      for (let className of rootEl.classList) {
        if (className.indexOf(viewModeSuffix) !== -1) {
          return className;
        }
      }
    }

    function viewClass(mode) {
      return mode + viewModeSuffix;
    }

    function saveState(mode, el) {
      stateHistory.push([mode, el]);
    }

    function revertState() {
      // Remove latest state from history (there's no forward button)
      stateHistory.pop();
      // Go to either the last view or the default view
      const view = (stateHistory.length > 0) ? stateHistory[stateHistory.length - 1] : defaultView;
      changeView(...view);
    }

    function changeView(mode, el) {
      $rootEl.removeClass(getView());
      $rootEl.addClass(viewClass(mode));
      // Deactivate whatever was active
      $('.' + activeClass).removeClass(activeClass);
      // Activate whatever was switched to
      while (el) {
        $(el).addClass(activeClass);
        el = el.parentElement;
      }
    }

    function correspondingFloor(buildingFloor) {
      const floorElIndex = $(buildingFloor).parent().find('.building-floor').index(buildingFloor);
      return $('.floors .floor').eq(floorElIndex);
    }

    function correspondingBuildingFloor(floor) {
      const floorElIndex = $(floor).parent().find('.floor').index(floor);
      return $('.building-floors .building-floor').eq(floorElIndex);
    }

    $('.floor').on('click', function () {
      // Clicking on a floor only has behaviour in "building-view"
      if (!isBuildingView()) return;
      // Switch to floor view
      changeView('floor', this);
      // Make it so that we can go back to this state
      saveState('floor', this);
    }).hover(function () {
      $(correspondingBuildingFloor(this)).addClass('hover');
    }, function () {
      $(correspondingBuildingFloor(this)).removeClass('hover');
    });

    $('.building-floor').on('click', function () {
      var floorEl = correspondingFloor(this);
      changeView('floor', floorEl);
      saveState('floor', floorEl);
    }).hover(function () {
      $(correspondingFloor(this)).addClass('hover');
    }, function () {
      $(correspondingFloor(this)).removeClass('hover');
    });

    $('.unit').on('click', function () {
      // Clicking on a unit only has behaviour in "floor-view"
      if (!isFloorView()) return;
      // Switch to unit view
      changeView('unit', this);
      // Make it so that we can go back to this state
      saveState('unit', this);
    });

    $('.back-button').on('click', revertState);
  }

  $(init);
})(jQuery, Handlebars);
