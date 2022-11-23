(function() {
  function SmartRegisterColumnsController($scope, $timeout, FlashService, $uibModalInstance, smartColumns) {
    var colTypes = [{ id: "STRING", text: "String" }, { id: "DATE", text: "Date" }, { id: "NUMBER", text: "Number" }];
    $scope.maxId = 0;
    if (smartColumns) {
      $scope.smartColumnsRows = angular.copy(smartColumns).map(function(c) {
        c.recid = $scope.maxId++;
        c.saved = true;
        return c;
      });
    } else {
      $scope.smartColumnsRows = [];
    }

    $scope.gridColumns = [
      {
        field: "type",
        caption: "Type",
        sortable: true,
        size: "15%",
        tooltip: "Type",
        resizable: true,
        editable: false, // { type: "select", showAll: true, items: colTypes },
        render: function(record, index) {
          var text = colTypes[0].text;
          for (var i = 0; i < colTypes.length; i++) {
            if (record.type === colTypes[i].id) {
              text = colTypes[i].text;
              break;
            }
          }
          return text;
        }
      },
      {
        field: "label",
        caption: "Label",
        sortable: true,
        tooltip: "Label",
        size: "30%",
        resizable: true,
        editable: { type: "text" }
      },
      {
        field: "description",
        caption: "Description",
        sortable: true,
        size: "55%",
        resizable: true,
        tooltip: "Description",
        editable: { type: "text" }
      }
    ];

    $scope.toolbarItems = [
      { type: "break" },
      {
        type: "menu",
        id: "add",
        caption: "Add",
        img: "fa fa-plus",
        items: colTypes
      },
      { type: "button", id: "delete", caption: "Delete", img: "fa fa-trash-o" }
    ];

    $scope.beforeChange = function(event, grid, record) {
      var col = grid.columns[event.column];
      var val = event.value_new;
      var valid = true;
      switch (col.field) {
        case "label":
          valid = validateLabel(val);
          break;
        case "description":
          valid = validateDescription(val);
          break;
        default:
          break;
      }
      return valid;
    };

    $scope.afterChange = function(event, grid, record) {
      console.log("TODO: add validations, after change", event, record, grid);
    };

    function validateLabel(label) {
      return label && label.length > 1 && label.length <= 25;
    }

    function validateDescription(desc) {
      return !desc || (desc.length > 1 && desc.length <= 100);
    }

    function validateColumns() {
      for (var i = 0; i < $scope.smartColumnsRows.length; i++) {
        var row = $scope.smartColumnsRows[i];
        if (!validateLabel(row.label)) {
          FlashService.Error("Please enter a Label");
          return false;
        }
        if (!validateDescription(row.description)) {
          FlashService.Error("Please enter a Description");
          return false;
        }
      }
      return true;
    }

    $scope.toolbarClicked = function(target, data, grid) {
      if (target.startsWith("add:")) {
        if ($scope.smartColumnsRows.length <= 10) {
          $scope.smartColumnsRows.splice(0, 0, {
            recid: $scope.maxId++,
            type: data.subItem.id,
            fieldName: "",
            label: "",
            description: "",
            style: "background-color: #CCFFCC"
          });
        } else {
          FlashService.Error("Only 10 smart columns can be added.");
        }

        $scope.gridReload($scope.smartColumnsRows, $scope.gridColumns);
      } else if (target === "delete") {
        var sel = grid.getSelection(true);
        for (var i = 0; i < sel.length; i++) {
          $scope.smartColumnsRows.splice(sel[i], 1);
        }
        $scope.gridReload($scope.smartColumnsRows, $scope.gridColumns);
      }
    };

    $scope.gridEvent = function(event) {
      $scope.gridReload = event;
    };

    function generateFieldName() {
      $scope.smartColumnsRows.forEach(function(row) {
        if (!row.saved) {
          // TODO: fieldName to be unique
          row.fieldName = "_" + row.type.toLowerCase() + row.label.replace(/[^a-zA-Z]/g, "").substring(0, 10);
        }
        console.log("gen", row.fieldName);
      });
    }

    $scope.submit = function() {
      if (!validateColumns()) {
        return;
      }
      generateFieldName();
      // $scope.smartColumnsRows has 'changes' property attached by the grid
      // develop and build the onchange event to update the actual object ?
      $uibModalInstance.close({
        smartColumnsRows: $scope.smartColumnsRows,
        saveAtProject: $scope.saveAtProject,
        saveAtCompany: $scope.saveAtCompany
      });
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss("cancel");
    };

    (function initController() {
      $timeout(function() {
        $scope.gridReload($scope.smartColumnsRows, $scope.gridColumns);
      }, 300);
    })();
  }
  angular.module("EventsApp").controller("SmartRegisterColumnsController", SmartRegisterColumnsController);
  SmartRegisterColumnsController.$inject = ["$scope", "$timeout", "FlashService", "$uibModalInstance", "smartColumns"];
})();
