// Variables for modals
let addEmployeeModal = $('#addEmployeeModal');
let editEmployeeModal = $('#editEmployeeModal');
let deleteEmployeeModal = $('#deleteEmployeeModal');
let addDepartmentModal = $('#addDepartmentModal');
let editDepartmentModal = $('#editDepartmentModal');
let deleteDepartmentModal = $('#deleteDepartmentModal');
let addLocationModal = $('#addLocationModal');
let deleteLocationModal = $('#deleteLocationModal');
let filterModal = $('#filterModal');
let cannotDeleteDeptModal = $('#cannotDeleteDeptModal'); 
let cannotDeleteLocModal = $('#cannotDeleteLocModal');

// Helper function to capitalize first letters
function toTitleCase(text) {
  return text.replace(/\w\S*/g, word => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase());
}

// Helper function to reset modal forms
function resetModal(modal) {
  modal.on('hidden.bs.modal', function () {
    $(this).find('form').trigger('reset');
    console.log(`🧹 Modal form reset for modal ID: ${modal.attr('id')}`);
  });
}

//Alert
function showDemoAlert(message) {
    $('#demoAlertText').html(`<strong>⚠️</strong> ${message}`);
    $('#demoAlert').removeClass('d-none').addClass('show');
  
    // Automatyczne zamknięcie po 3 sekundach
    setTimeout(() => {
      $('#demoAlert').removeClass('show').addClass('d-none');
    }, 3000);
  }
  

// Preloader
//$(window).on('load', function () {
//  $('#preloader').delay(1000).fadeOut('slow');
//  showEmployees();
//  showDepartments();
//  showLocations();
//});

if (!window.debugMode) {
  console.log = function () {}; // Disable console.log
 console.warn = function () {}; // Disable warnings
  console.error = function () {}; // Disable errors
}

// Navigation button handlers

//Add employee
$('#btn-employees').on('click', function () {
  $(this).addClass('itsLive');
  console.log('👤 Employees button clicked!');
  $('#btn-departments').removeClass('itsLive');
  $('#btn-locations').removeClass('itsLive');
  $('#all-employees').removeClass('d-none');
  $('#all-locations').addClass('d-none'),
  $('#all-departments').addClass('d-none');
  showEmployees();
});

//Add department
$('#btn-departments').on('click', function () {
  $(this).addClass('itsLive');
  console.log('🏢 Departments button clicked!');
  $('#btn-employees').removeClass('itsLive');
  $('#btn-locations').removeClass('itsLive');
  $('#all-departments').removeClass('d-none');
  $('#all-employees').addClass('d-none');
  $('#all-locations').addClass('d-none');
  showDepartments();
  
});

//Add location
$('#btn-locations').on('click', function () {
  $(this).addClass('itsLive');
  console.log('📍 Locations button clicked!');
  $('#btn-employees').removeClass('itsLive');
  $('#btn-departments').removeClass('itsLive');
  $('#all-locations').removeClass('d-none');
  $('#all-employees').addClass('d-none');
  $('#all-departments').addClass('d-none');
  
});

// <!-- / EMPLOYEES / -->
function showEmployees() {
    console.log('📋 Loading mock employees...');
    let tbody = $('#employeeTbody');
    tbody.empty();
  
    mockPersonnel.forEach(employee => {
      const department = mockDepartments.find(dep => dep.id === employee.departmentID)?.name || 'N/A';
      const location = mockLocations.find(loc => loc.id === employee.locationID)?.name || 'N/A';
  
      tbody.append(`
        <tr role="button" data-id="${employee.id}">
          <td>${toTitleCase(employee.lastName)}, ${toTitleCase(employee.firstName)}</td>
          <td>${department}</td>
          <td>${location}</td>
        </tr>
      `);
    });
  
    updateEmployeeCount();
  }
  
  
//Add emploee
$('#add-employee').on('click', function () {
    addEmployeeModal.modal('show');
  });

// Refresh Employees
$('#refreshBtn-employees').on('click', function () {
    showDemoAlert("This is a demo version – adding employees is disabled.");
});

//Search
$('#search-input').on('keyup', function () {
    showDemoAlert("This is a demo version – adding employees is disabled.");
});


//Update Employee Count
function updateEmployeeCount() {
  let count = $('#employeeTbody tr:visible').length;
  $('#employee-count-text').text(`${count} employees`);
}

// Filter Modal

// Variables for storing selected filters
let selectedDepartmentId = '';
let selectedLocationId = '';

// When the modal opens, set the previously selected values
$('#filterModal').on('show.bs.modal', function (event) {
    let button = $(event.relatedTarget);
    let filterType = button.data('filter-type');
    let modalTitle = filterType === 'department' ? 'Filter by Department' : 'Filter by Location';
    $('#filterModalLabel').text(modalTitle);
  
    // Wypełnianie selectów z mock data
    let deptSelect = $('#filterDepartmentSelect');
    deptSelect.empty().append('<option value="">All Departments</option>');
    mockDepartments.forEach(dept => {
      deptSelect.append(`<option value="${dept.id}">${dept.name}</option>`);
    });
  
    let locSelect = $('#filterLocationSelect');
    locSelect.empty().append('<option value="">All Locations</option>');
    mockLocations.forEach(loc => {
      locSelect.append(`<option value="${loc.id}">${loc.name}</option>`);
    });
  });


// Safe after click "Apply"
$('#applyFilterBtn').on('click', function () {
    let selectedDepartmentId = $('#filterDepartmentSelect').val();
    let selectedLocationId = $('#filterLocationSelect').val();
  
    let filtered = mockPersonnel.filter(emp => {
      return (!selectedDepartmentId || emp.departmentID == selectedDepartmentId)
          && (!selectedLocationId || emp.locationID == selectedLocationId);
    });
  
    let tbody = $('#employeeTbody');
    tbody.empty();
  
    if (filtered.length === 0) {
      tbody.append(`<tr><td colspan="3" class="text-center">No employees found</td></tr>`);
    } else {
      filtered.forEach(emp => {
        const department = mockDepartments.find(dep => dep.id === emp.departmentID)?.name || 'N/A';
        const location = mockLocations.find(loc => loc.id === emp.locationID)?.name || 'N/A';
        tbody.append(`
          <tr role="button">
            <td>${emp.lastName}, ${emp.firstName}</td>
            <td>${department}</td>
            <td>${location}</td>
          </tr>
        `);
      });
    }
  
    updateEmployeeCount();
    $('#filterModal').modal('hide');
  });
  
// Filter reset
$('#resetFilterBtn').on('click', function () {
    showEmployees();
  });

// <!-- / DEPARTMENTS / -->
// Demo version using mock data
function showDepartments() {
    console.log("🏢 Loading mock departments...");
    let cards = $('#departments-cards');
    let addSelect = $('#addEmployeeDepartmentSelect');
    let editSelect = $('#editEmployeeDepartmentSelect');
    
    cards.empty();
    addSelect.empty().append('<option selected disabled value="0">Select Department</option>');
    editSelect.empty().append('<option selected disabled value="0">Select Department</option>');
  
    mockDepartments.forEach(dept => {
      const location = mockLocations.find(loc => loc.id === dept.locationID)?.name || 'N/A';
      
      cards.append(`
        <div class="details-card">
          <div class="card-body">
            <h6 class="department-name text-center mb-3"><strong>${dept.name}</strong></h6>
            <table class="table">
              <tbody>
                <tr><td class="text-center">${location}</td></tr>
              </tbody>
            </table>
            <div class="d-flex justify-content-center">
              <button class="btn btn-yellow w-50 updateDepartment" 
                      data-id="${dept.id}" 
                      data-name="${dept.name}" 
                      data-location="${location}" 
                      data-locationid="${dept.locationID}">Edit</button>
              <button class="btn btn-danger w-50 deleteDepartment" 
                      data-id="${dept.id}" 
                      data-name="${dept.name}">Delete</button>
            </div>
          </div>
        </div>
      `);
      
      addSelect.append(`<option value="${dept.locationID}" data-departmentid="${dept.id}">${dept.name}</option>`);
      editSelect.append(`<option value="${dept.locationID}" data-departmentid="${dept.id}">${dept.name}</option>`);
    });
  }
  
  

//Add department
$('#add-department').on('click', function () {
    $('#addDepartmentModal').modal('show');
  });
  

// Refresh Departments
$('#refreshBtn-departments').on('click', function () {
    showDemoAlert("This is a demo version – adding employees is disabled.");
});
//Search
$('#search-input-department').on('keyup', function () {
    showDemoAlert("This is a demo version – adding employees is disabled.");
});

// <!-- / LOCATIONS / -->
// Demo version using mock data
function showLocations() {
    console.log("🌍 Loading locations from mock data...");
    
    // Reference to DOM elements
    const cards = $('#locations-cards');
    const selects = [
      $('#addEmployeeLocationSelect'),
      $('#editEmployeeLocationSelect'),
      $('#addDepartmentLocationSelect'),
      $('#editDepartmentLocationSelect')
    ];
  
    // Clear existing content
    cards.empty();
    selects.forEach(select => {
      select.empty().append('<option selected disabled value="0">Select Location</option>');
    });
  
    // Process mock locations
    mockLocations.forEach(location => {
      // Add location card (identical to your original HTML structure)
      cards.append(`
        <div class="details-card">
          <div class="card-body">
            <h5 class="location-name text-center mb-3"><strong>${location.name}</strong></h5>
            <div class="text-center">
              <button class="btn btn-danger w-50 deleteLocation" 
                      data-id="${location.id}" 
                      data-name="${location.name}">Delete</button>
            </div>
          </div>
        </div>
      `);
  
      // Add to all select dropdowns
      selects.forEach(select => {
        select.append(`<option value="${location.id}">${location.name}</option>`);
      });
    });
  
    console.log(`✅ Loaded ${mockLocations.length} locations from mock data`);
  }

//Add Location
$('#add-location').on('click', function () {
    $('#addLocationModal').modal('show');
  });

// Refresh Locations
$('#refreshBtn-locations').on('click', function () {
    showDemoAlert("This is a demo version – adding employees is disabled.");
});

//Search
$('#search-input-location').on('keyup', function () {
    showDemoAlert("This is a demo version – adding employees is disabled.");
});

// <!-- / Add Employee Modal / -->
$('#addEmployeeModal').on('show.bs.modal', function () {
    $('#checkConfirmAddEmployee').prop('checked', false);
    $('#employeeConfirmAddBtn').prop('disabled', true);
  });
  
  

  $('#checkConfirmAddEmployee').on('change', function () {
    let isChecked = $(this).is(':checked');
    let isValid = $('#addEmployeeForm')[0].checkValidity();
    $('#employeeConfirmAddBtn').prop('disabled', !(isChecked && isValid));
  });
  
  

  $('#employeeConfirmAddBtn').on('click', function (e) {
    e.preventDefault();
    $('#addEmployeeModal').modal('hide');
    showDemoAlert("This is a demo version – adding employees is disabled.");
  });
  


// <!-- / View Details of Employee Modal / -->
$('#employeeTbody').on('click', 'tr', function () {
    const id = $(this).data('id');
    const employee = mockPersonnel.find(emp => emp.id === id);
    const department = mockDepartments.find(dep => dep.id === employee.departmentID)?.name || 'N/A';
    const location = mockLocations.find(loc => loc.id === employee.locationID)?.name || 'N/A';
  
    // Ustaw dane do modala
    $('#emp-firstName').text(employee.firstName);
    $('#emp-lastName').text(employee.lastName);
    $('#emp-jobTitle').text(employee.jobTitle || '—');
    $('#emp-email').text(employee.email);
    $('#emp-department').text(department);
    $('#emp-location').text(location);
  
    // Pokaż modal (tylko podgląd!)
    $('#viewEmployeeModal').modal('show');
  });
  

// <!-- / Update Employee Modal / -->
$(document).on('click', '.editEmployee', function () {
    showDemoAlert("This is a demo version – adding employees is disabled.");
});

$('#editEmployeeDepartmentSelect').on('change', function () {
    showDemoAlert("This is a demo version – adding employees is disabled.");
});

// Check box
$('#editEmployeeModal').on('show.bs.modal', function () {
    $('#checkConfirmEditEmployee').prop('checked', false);
    $('#updateEmployeeBtn').prop('disabled', true);
  });
  

  $('#checkConfirmEditEmployee').on('change', function () {
    let isChecked = $(this).is(':checked');
    let isValid = $('#editEmployeeForm')[0].checkValidity();
    $('#updateEmployeeBtn').prop('disabled', !(isChecked && isValid));
  });
  

// Update employee
$('#updateEmployeeBtn').on('click', function (e) {
    e.preventDefault();
    $('#editEmployeeModal').modal('hide');
    showDemoAlert("This is a demo version – updating employees is disabled.");
  });
  
// <!-- / Delete Employee Modal / -->
$(document).on('click', '.deleteEmployee', function () {
    showDemoAlert("This is a demo version – adding employees is disabled.");
});

$('#checkConfirmDeleteEmployee').on('click', function () {
  $('#deleteEmployeeBtn').prop('disabled', !$(this).is(':checked'));
  console.log(`✓ Delete confirmation checkbox ${isChecked ? 'checked' : 'unchecked'}`);
});

$('#deleteEmployeeBtn').on('click', function (e) {
    showDemoAlert("This is a demo version – adding employees is disabled.");
});

// <!-- / Add Department Modal / -->
$('#addDepartmentModal').on('show.bs.modal', function () {
    $('#checkConfirmAddDepartment').prop('checked', false);  // odznacz checkbox
    $('#addDepartmentBtn').prop('disabled', true);           // wyłącz guzik
  });
  
  $('#checkConfirmAddDepartment').on('change', function () {
    let isChecked = $(this).is(':checked');
    let isValid = $('#addDepartmentForm')[0].checkValidity(); // zakładam że tak się nazywa
    $('#addDepartmentBtn').prop('disabled', !(isChecked && isValid));
  });
  

  $('#addDepartmentBtn').on('click', function (e) {
    e.preventDefault();
    $('#addDepartmentModal').modal('hide');
    showDemoAlert("This is a demo version – adding departments is disabled.");
  });
      
      

// <!-- / Update Department Modal / -->
$(document).on('click', '.updateDepartment', function () {
    const deptName = $(this).data('name');
    const deptID = $(this).data('id');
    const locationID = $(this).data('locationid');
  
    $('#editDepartmentNameInput').val(deptName);
    $('#editDepartmentLocationSelect').val(locationID);
    $('#editDepartmentModal').modal('show');
  });

$('#checkConfirmEditDepartment').on('click', function () {
  let isValid = $('#editDepartmentForm').valid();
  $('#updateDepartmentBtn').prop('disabled', !($(this).is(':checked') && isValid));
});

$('#updateDepartmentBtn').on('click', function (e) {
    e.preventDefault();
    $('#editDepartmentModal').modal('hide'); // zamyka modal
    showDemoAlert("This is a demo version – updating departments is disabled.");
  });
      


// <!-- / Delete Department Modal / -->
$(document).on('click', '.deleteDepartment', function () {
    const deptName = $(this).data('name');
    const deptID = $(this).data('id');
  
    $('#deleteDepartmentName').text(deptName);
    $('#deleteDepartmentModal').modal('show');
  });
  
        

// Check box
$('#deleteDepartmentModal').on('show.bs.modal', function () {
  $('#checkConfirmDeleteDepartment').prop('checked', false);
  $('#deleteDepartmentBtn').prop('disabled', true);
});

$('#checkConfirmDeleteDepartment').on('change', function () {
  $('#deleteDepartmentBtn').prop('disabled', !$(this).is(':checked'));
});

$('#deleteDepartmentBtn').on('click', function (e) {
    e.preventDefault();
    $('#deleteDepartmentModal').modal('hide'); // zamknij modal
    showDemoAlert("This is a demo version – deleting departments is disabled.");
  });
  
      



// <!-- / Add Location Modal / -->
$('#addLocationModal').on('show.bs.modal', function () {
    $('#checkConfirmAddLocation').prop('checked', false);
    $('#addLocationBtn').prop('disabled', true);
  });
  
  $('#checkConfirmAddLocation').on('change', function () {
    let isChecked = $(this).is(':checked');
    let isValid = $('#addLocationForm')[0].checkValidity();
    $('#addLocationBtn').prop('disabled', !(isChecked && isValid));
  });
  

  $('#addLocationBtn').on('click', function (e) {
    e.preventDefault();
    $('#addLocationModal').modal('hide');
    showDemoAlert("This is a demo version – adding locations is disabled.");
  });
  
      


// <!-- / Delete Location Modal / -->
$(document).on('click', '.deleteLocation', function () {
    const locName = $(this).data('name');
    const locID = $(this).data('id');
  
    $('#deleteLocationName').text(locName);
    $('#deleteLocationModal').modal('show');
  });
  
// Confirmation checkbox
$('#checkConfirmDeleteLocation').on('change', function () {
    $('#deleteLocationBtn').prop('disabled', !$(this).is(':checked'));
  });
  
  
// Final deletion 
$('#deleteLocationBtn').on('click', function (e) {
    e.preventDefault();
    $('#deleteLocationModal').modal('hide');
    showDemoAlert("This is a demo version – deleting locations is disabled.");
  });
  

// EDIT button in Employee Details Modal
$('#editEmployeeBtn').on('click', function () {
    $('#viewEmployeeModal').modal('hide');        
    $('#editEmployeeModal').modal('show');       
  });
  
  // DELETE button in Employee Details Modal
  $('#viewDeleteEmployeeBtn').on('click', function () {
    $('#viewEmployeeModal').modal('hide');      
  });
  
  
$(document).ready(function () {
    showEmployees();
    showDepartments();
    showLocations();
  });
  

