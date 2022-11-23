
(function () {
    'use strict';

    angular
        .module('EventsApp')
        .controller('RequirementOverviewController', RequirementOverviewController);

    RequirementOverviewController.$inject = ['$scope', '$uibModalInstance', 'SmartRegisterService', 'project', 'version', ];
    function RequirementOverviewController($scope, $uibModalInstance, SmartRegisterService, project, version) {

        (function () {
            debugger;
            $scope.project = project;
            $scope.version = version;
            $scope.gridOptions = {
                enableSorting: true,
                enableColumnMenus: false,
                data: [],
                columnDefs: [
                    { name: 'divisionCode', displayName: 'Division' },
                    { name: 'divisionName', displayName: 'Division Name' }
                ],
                expandableRowTemplate: '<div ui-grid="row.entity.subGridOptions" style="height:140px;"></div>',
                expandableRowHeight: 150,
                expandableRowScope: {
                    subGridVariable: 'subGridScopeVariable'
                }
            };

            SmartRegisterService.GetRequirementsMatrixData(project.projectId, version.versionId, function (response) {
                var data = response.data;
                $scope.data = data;
                for (var i = 0; i < data.length; i++) {
                    var subdata = [];

                    for (var j = 0; j < data[i].specSectionDetails.length; j++) {
                        var obj = {
                            "specCode": data[i].specSectionDetails[j].specCode,
                            "specName": data[i].specSectionDetails[j].specName
                        };
                        var columnDefs = [{ name: "specCode", displayName: "Specification Section", width: '*' }, { name: "specName", displayName: " Specification Name", width: '*' }];
                        for (var key in data[i].specSectionDetails[j].submittalGroupDetails) {
                            obj[key] = data[i].specSectionDetails[j].submittalGroupDetails[key];
                            columnDefs.push({ name: key, width: '*', displayName:key.replace(/\b\w/g, function(l){ return l.toUpperCase() }) });
                        }
                        subdata.push(obj);
                    }
                    data[i].subGridOptions = {
                        columnDefs: columnDefs,
                        enableColumnMenus: false,
                        enableColumnResizing: true,
                        data: subdata//data[i].specSectionDetails
                    }
                }
                $scope.gridOptions.data = data;
            });
        })();

        $scope.Confirm = function () {
            $uibModalInstance.close(/*keep some data here*/);
        };

        $scope.Cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.gridOptions.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
        };
    };
})();
