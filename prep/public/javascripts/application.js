(function ($, Handlebars, moment) {
  const templates = {};

  function init() {
    configureHandlebars();
    loadUI();
  }

  function configureHandlebars() {
    Handlebars.registerHelper('date', function (value) {
      return moment(value).format('LL');
    });

    Handlebars.registerHelper('ordinalSuffix', (function (ordinalSuffixes, number) {
      return ordinalSuffixes[number % 10];
    }).bind(null, ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th']));

    Handlebars.registerHelper('isRentDue', function (unit) {
      return moment().isAfter(unit.rentDue);
    });

    Handlebars.registerHelper('isLeaseExpiring', function (unit) {
      return moment().startOf('month').add(3, 'months').isAfter(unit.leaseExpires);
    });

    Handlebars.registerHelper('hasAlerts', function (unit) {
      return Handlebars.helpers.isRentDue(unit) || Handlebars.helpers.isLeaseExpiring(unit);
    });

    Handlebars.registerHelper('hasAlertsClass', function (units) {
      var hasAlerts;
      if (units instanceof Array) {
        hasAlerts = units.filter(Handlebars.helpers.hasAlerts).length;
      } else {
        hasAlerts = Handlebars.helpers.hasAlerts(this);
      }
      return hasAlerts ? 'alert' : '';
    });

    Handlebars.registerHelper('isLeaseExpiringClass', function () {
      return Handlebars.helpers.isLeaseExpiring(this) ? 'alert' : '';
    });

    Handlebars.registerHelper('isRentDueClass', function () {
      return Handlebars.helpers.isRentDue(this) ? 'alert' : '';
    });

    Handlebars.registerHelper('count', function (list, helper) {
      return list.filter(Handlebars.helpers[helper]).length;
    });

    templates.building = Handlebars.compile($('#building-template').html());
  }

  function loadUI() {
    $.getJSON('data/building.json', function (building) {
      renderUI(building);
      initUI();
    });
  }

  function renderUI(building) {
    $('#main-content').html(templates.building({
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

    function resetState() {
      while (stateHistory.pop()) {}
      changeView('building', null);
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

    function findCorresponding(selector, element) {
      return $(selector).eq($(element).index());
    }

    $('.floor').on('click', function () {
      // Clicking on a floor only has behaviour in "building-view"
      if (!isBuildingView()) return;
      // Switch to floor view
      changeView('floor', this);
      // Make it so that we can go back to this state
      saveState('floor', this);
    }).hover(function () {
      findCorresponding('.floors-overview-list-item', this).find('a').addClass('focus');
    }, function () {
      findCorresponding('.floors-overview-list-item', this).find('a').removeClass('focus');
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

    $('.floors-overview a').on('click', function () {
      findCorresponding('.floor', $(this).closest('.floors-overview-list-item')).trigger('click');
    }).on('mouseenter focus', function () {
      findCorresponding('.floor', $(this).closest('.floors-overview-list-item')).addClass('focus');
    }).on('mouseleave blur', function () {
      var $this = $(this);
      if ($this.is(':focus')) return;
      findCorresponding('.floor', $this.closest('.floors-overview-list-item')).removeClass('focus');
    });

    $(document).on('keyup', function (e) {
      switch (e.which) {
        // Escape
        case 27:
          resetState();
          break;
        // Backspace/Delete
        case 8:
        // Left arrow
        case 37:
          revertState();
          break;
      }
    })
  }

  $(init);
})(jQuery, Handlebars, moment);
