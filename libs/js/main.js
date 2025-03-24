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

// Preloader
$(window).on('load', function () {
  $('#preloader').delay(1000).fadeOut('slow');
  showEmployees();
  showDepartments();
  showLocations();
});

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
  console.log('📋 Fetching employees...');
  $.ajax({
    url: 'libs/php/getAll.php',
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      console.log('✅ Employees fetched successfully:', response.status.name);
      if (response.status.name === 'ok') {
        let tbody = $('#employeeTbody');
        tbody.empty();
        response.data.forEach(employee => {
          tbody.append(`
            <tr role="button" data-id="${employee.id}">
              <td>${employee.lastName}, ${employee.firstName}</td>
              <td>${employee.department}</td>
              <td>${employee.location}</td>
            </tr>
          `);
        });
        updateEmployeeCount();
      }
    }
  });
}
//Add emploee
$('#add-employee').on('click', function () {
  addEmployeeModal.modal('show');
  console.log('➕ Add Employee button clicked, opening modal...');
  resetModal(addEmployeeModal);
  $('#employeeConfirmAddBtn').prop('disabled', true);
});

// Refresh Employees
$('#refreshBtn-employees').on('click', function () {
  console.log("🔄 Refresh Employees clicked!");
  showAllEmployees(); // Reload employees
});

//Search
$('#search-input').on('keyup', function () {
  let searchText = $(this).val().toLowerCase().trim();
  console.log("🔍 Searching for:", searchText);
  $('#employeeTbody tr').each(function () {
    let rowText = $(this).text().toLowerCase();
    $(this).toggle(rowText.includes(searchText));
  });
  updateEmployeeCount();
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

  // Download the list of departments
  $.ajax({
    url: 'libs/php/getAllDepartments.php',
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      console.log("⬇️ AJAX Response received:", response);
      if (response.status.name === 'ok') {
        let deptSelect = $('#filterDepartmentSelect');
        deptSelect.empty();
        deptSelect.append('<option value="">All Departments</option>');
        response.data.forEach(dept => {
          deptSelect.append(`<option value="${dept.id}">${dept.name}</option>`);
        });
        // Set to previously selected value
        deptSelect.val(selectedDepartmentId);
      }
    }
  });

  // Get location list
  $.ajax({
    url: 'libs/php/getAllLocations.php',
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      console.log("🌍 AJAX Locations Response:", response);
      if (response.status.name === 'ok') {
        console.log(`✅ Success! Loaded ${response.data.length} locations.`);
        let locSelect = $('#filterLocationSelect');
        locSelect.empty();
        locSelect.append('<option value="">All Locations</option>');
        response.data.forEach(loc => {
          locSelect.append(`<option value="${loc.id}">${loc.name}</option>`);
        });
        // Set to previously selected value
        locSelect.val(selectedLocationId);
      }
    }
  });
});

// Safe after click "Apply"
$('#applyFilterBtn').on('click', function () {
  console.log("🔄 Apply Filters button clicked");
  selectedDepartmentId = $('#filterDepartmentSelect').val();
  selectedLocationId = $('#filterLocationSelect').val();

  $.ajax({
    url: 'libs/php/getAll.php',
    type: 'GET',
    dataType: 'json',
    data: {
      departmentId: selectedDepartmentId,
      locationId: selectedLocationId
    },
    success: function (response) {
      console.log("✅ AJAX Success Response:", response);
      if (response.status.name === 'ok') {
        let tbody = $('#employeeTbody');
        tbody.empty();
        if (response.data.length === 0) {
          console.log("❌ No employees found with current filters");
          tbody.append(`
            <tr>
              <td colspan="3" class="text-center">No employees found</td>
            </tr>
          `);
          $('#total-entries').html(`<h5>0 employees</h5>`);
        } else {
          let employees = response.data.filter(employee => employee.firstName && employee.lastName);
          employees.forEach(employee => {
            const department = employee.department || 'N/A';
            const location = employee.location || 'N/A';
            tbody.append(`
              <tr role="button" data-id="${employee.id}">
                <td>${employee.lastName}, ${employee.firstName}</td>
                <td>${department}</td>
                <td>${location}</td>
              </tr>
            `);
          });
          updateEmployeeCount();
        }
        filterModal.modal('hide');
      }
    }
  });
});

// Filter reset
$('#resetFilterBtn').on('click', function () {
  selectedDepartmentId = '';
  selectedLocationId = '';
  showEmployees();
});

// <!-- / DEPARTMENTS / -->
function showDepartments() {
  console.log("🏢 Starting showDepartments() function");
  $.ajax({
    url: 'libs/php/getAllDepartments.php',
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      console.log("✅ Received departments response:", response);
      if (response.status.name === 'ok') {
        let cards = $('#departments-cards');
        let addSelect = $('#addEmployeeDepartmentSelect');
        let editSelect = $('#editEmployeeDepartmentSelect');
        cards.empty();
        addSelect.empty().append('<option selected disabled value="0">Select Department</option>');
        editSelect.empty().append('<option selected disabled value="0">Select Department</option>');

        response.data.forEach(dept => {
          cards.append(`
            <div class="details-card">
              <div class="card-body">
                <h6 class="department-name text-center mb-3"><strong>${dept.name}</strong></h6>
                <table class="table">
                  <tbody>
                    <tr><td class="text-center">${dept.location}</td></tr>
                  </tbody>
                </table>
                <div class="d-flex justify-content-center">
                  <button class="btn btn-yellow w-50 updateDepartment" data-id="${dept.id}" data-name="${dept.name}" data-location="${dept.location}" data-locationid="${dept.locationID}">Edit</button>
                  <button class="btn btn-danger w-50 deleteDepartment" data-id="${dept.id}" data-name="${dept.name}">Delete</button>
                </div>
              </div>
            </div>
          `);
          addSelect.append(`<option value="${dept.locationID}" data-departmentid="${dept.id}">${dept.name}</option>`);
          editSelect.append(`<option value="${dept.locationID}" data-departmentid="${dept.id}">${dept.name}</option>`);
        });
      }
    }
  });
}

//Add department
$('#add-department').on('click', function () {
  console.log("➕ Add Department button clicked");
  addDepartmentModal.modal('show');
  resetModal(addDepartmentModal);
  $('#addDepartmentBtn').prop('disabled', true);
});

// Refresh Departments
$('#refreshBtn-departments').on('click', function () {
  console.log("🔄 Refresh Departments clicked!");
  showDepartments(); // Reload the department list
});
//Search
$('#search-input-department').on('keyup', function () {
  let searchText = $(this).val().toLowerCase().trim();
  $('.details-card').each(function () {
    let deptName = $(this).find('.department-name').text().toLowerCase();
    $(this).toggle(deptName.includes(searchText));
  });
});

// <!-- / LOCATIONS / -->
function showLocations() {
  $.ajax({
    url: 'libs/php/getAllLocations.php',
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      if (response.status.name === 'ok') {
        console.log("🌍 Successfully loaded locations. Count:", response.data.length);
        let cards = $('#locations-cards');
        let addEmpLocSelect = $('#addEmployeeLocationSelect');
        let editEmpLocSelect = $('#editEmployeeLocationSelect');
        let addDeptLocSelect = $('#addDepartmentLocationSelect');
        let editDeptLocSelect = $('#editDepartmentLocationSelect');
        cards.empty();
        addEmpLocSelect.empty().append('<option selected disabled value="0">Select Location</option>');
        editEmpLocSelect.empty().append('<option selected disabled value="0">Select Location</option>');
        addDeptLocSelect.empty().append('<option selected disabled value="0">Select Location</option>');
        editDeptLocSelect.empty().append('<option selected disabled value="0">Select Location</option>');

        response.data.forEach(loc => {
          cards.append(`
            <div class="details-card">
              <div class="card-body">
                <h5 class="location-name text-center mb-3"><strong>${loc.name}</strong></h5>
                <div class="text-center">
                  <button class="btn btn-danger w-50 deleteLocation" data-id="${loc.id}" data-name="${loc.name}">Delete</button>
                </div>
              </div>
            </div>
          `);
          addEmpLocSelect.append(`<option value="${loc.id}">${loc.name}</option>`);
          editEmpLocSelect.append(`<option value="${loc.id}">${loc.name}</option>`);
          addDeptLocSelect.append(`<option value="${loc.id}">${loc.name}</option>`);
          editDeptLocSelect.append(`<option value="${loc.id}">${loc.name}</option>`);
        });
      }
    }
  });
}

//Add Location
$('#add-location').on('click', function () {
  console.log("📍 Add Location button clicked");
  addLocationModal.modal('show');
  resetModal(addLocationModal);
  $('#addLocationBtn').prop('disabled', true);
});

// Refresh Locations
$('#refreshBtn-locations').on('click', function () {
  console.log("🔄 Refresh Locations clicked!");
  showLocations(); // Reload the location list
});

//Search
$('#search-input-location').on('keyup', function () {
  let searchText = $(this).val().toLowerCase().trim();
  $('.details-card').each(function () {
    let locName = $(this).find('.location-name').text().toLowerCase();
    $(this).toggle(locName.includes(searchText));
  });
});

// <!-- / Add Employee Modal / -->
$('#addEmployeeDepartmentSelect').on('change', function () {
  let selectedValue = $(this).val();
  $('#addEmployeeLocationSelect option').hide();
  $(`#addEmployeeLocationSelect option[value="${selectedValue}"]`).show().prop('selected', true);
});

$('#checkConfirmAddEmployee').on('click', function () {
  let isValid = $('#addEmployeeForm').valid();
  $('#employeeConfirmAddBtn').prop('disabled', !($(this).is(':checked') && isValid));
});

$('#employeeConfirmAddBtn').on('click', function (e) {
  e.preventDefault();
  console.log("🆕 Employee Add Confirmation clicked");
  $.ajax({
    url: 'libs/php/insertPersonnel.php',
    type: 'POST',
    dataType: 'json',
    data: {
      firstName: toTitleCase($('#firstNameInput').val()),
      lastName: toTitleCase($('#lastNameInput').val()),
      jobTitle: toTitleCase($('#jobTitleInput').val()),
      email: $('#emailInput').val().toLowerCase(),
      departmentID: $('#addEmployeeDepartmentSelect :selected').data('departmentid')
    },
    beforeSend: function () { $('#loader').removeClass('hidden'); },
    success: function (response) {
      if (response.status.name === 'ok') {
        addEmployeeModal.modal('hide');
        showEmployees();
      }
    },
    complete: function () { $('#loader').addClass('hidden'); }
  });
});


// <!-- / View Details of Employee Modal / -->
$('#employeeTbody').on('click', 'tr', function () {
  let id = $(this).data('id');
  $.ajax({
    url: 'libs/php/getPersonnel.php',
    type: 'POST',
    dataType: 'json',
    data: { id: id },
    success: function (response) {
      console.log("✅ Employee details response:", response);
      if (response.status.name === 'ok') {
        let emp = response.data[0];
        $('#emp-firstName').text(emp.firstName);
        $('#emp-lastName').text(emp.lastName);
        $('#emp-jobTitle').text(emp.jobTitle);
        $('#emp-email').text(emp.email);
        $('#emp-department').text(emp.department);
        $('#emp-location').text(emp.location);
        $('#editEmployeeBtn').data({
          id: emp.id,
          firstname: emp.firstName,
          lastname: emp.lastName,
          jobtitle: emp.jobTitle,
          email: emp.email,
          department: emp.department,
          departmentid: emp.departmentID,
          location: emp.location,
          locationid: emp.locationID
        });
        $('#viewDeleteEmployeeBtn').data({
          id: emp.id,
          name: `${emp.firstName} ${emp.lastName}`
        });
        $('#viewEmployeeModal').modal('show');
      }
    }
  });
});

// <!-- / Update Employee Modal / -->
$(document).on('click', '.editEmployee', function () {
  let id = $(this).data('id');
  $('#id_u').val(id);
  $('#firstName_u').val($(this).data('firstname'));
  $('#lastName_u').val($(this).data('lastname'));
  $('#jobTitle_u').val($(this).data('jobtitle'));
  $('#email_u').val($(this).data('email'));
  $('#editEmployeeDepartmentSelect option:first').replaceWith(`<option selected data-departmentid="${$(this).data('departmentid')}" value="${$(this).data('locationid')}">${$(this).data('department')}</option>`);
  $('#editEmployeeLocationSelect option:first').replaceWith(`<option selected value="${$(this).data('locationid')}">${$(this).data('location')}</option>`);
  editEmployeeModal.modal('show');
  $('#updateEmployeeBtn').prop('disabled', true);
});

$('#editEmployeeDepartmentSelect').on('change', function () {
  let selectedValue = $(this).val();
  $('#editEmployeeLocationSelect option').hide();
  $(`#editEmployeeLocationSelect option[value="${selectedValue}"]`).show().prop('selected', true);
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
  console.log("🔄 Update Employee button clicked");
  $.ajax({
    url: 'libs/php/updatePersonnel.php',
    type: 'POST',
    dataType: 'json',
    data: {
      id: $('#id_u').val(),
      firstName: toTitleCase($('#firstName_u').val()),
      lastName: toTitleCase($('#lastName_u').val()),
      jobTitle: toTitleCase($('#jobTitle_u').val()),
      email: $('#email_u').val().toLowerCase(),
      departmentID: $('#editEmployeeDepartmentSelect :selected').data('departmentid')
    },
    beforeSend: function () { $('#loader').removeClass('hidden'); },
    success: function (response) {
      console.log("✅ Update response received:", response);
      if (response.status.name === 'ok') {
        editEmployeeModal.modal('hide');
        $('#viewEmployeeModal').modal('hide');
        showEmployees();
      }
    },
    complete: function () { $('#loader').addClass('hidden'); }
  });
});

// <!-- / Delete Employee Modal / -->
$(document).on('click', '.deleteEmployee', function () {
  $('#id_d').val($(this).data('id'));
  $('.fullName').text($(this).data('name') + '?');
  deleteEmployeeModal.modal('show');
  $('#deleteEmployeeBtn').prop('disabled', true);
});

$('#checkConfirmDeleteEmployee').on('click', function () {
  $('#deleteEmployeeBtn').prop('disabled', !$(this).is(':checked'));
  console.log(`✓ Delete confirmation checkbox ${isChecked ? 'checked' : 'unchecked'}`);
});

$('#deleteEmployeeBtn').on('click', function (e) {
  e.preventDefault();
  $.ajax({
    url: 'libs/php/deletePersonnel.php',
    type: 'POST',
    dataType: 'json',
    data: { id: $('#id_d').val() },
    beforeSend: function () { $('#loader').removeClass('hidden');
    console.log("⏳ Sending delete request to server..."); 
     },
    success: function (response) {
      if (response.status.name === 'ok') {
        deleteEmployeeModal.modal('hide');
        $('#viewEmployeeModal').modal('hide');
        showEmployees();
      }
    },
    error: function (textStatus, errorThrown) {
      console.error("❌ Deletion failed:", textStatus, errorThrown);
    },
    complete: function () { $('#loader').addClass('hidden'); }
  });
});

// <!-- / Add Department Modal / -->
$('#checkConfirmAddDepartment').on('click', function () {
  let isValid = $('#addDepartmentForm').valid();
  $('#addDepartmentBtn').prop('disabled', !($(this).is(':checked') && isValid));
});

$('#addDepartmentBtn').on('click', function (e) {
  e.preventDefault();
  
  // Define the data to be sent
  const departmentData = {
    name: toTitleCase($('#departmentName_add').val()),
    locationID: $('#addDepartmentLocationSelect').val()
  };
  
  console.log("➕ Attempting to add department:", departmentData); // Log the actual data
  
  $.ajax({
    url: 'libs/php/insertDepartment.php',
    type: 'POST',
    dataType: 'json',
    data: departmentData, // Use the defined data object
    beforeSend: function () { 
      $('#loader').removeClass('hidden');
      console.log("⏳ Sending department data to server..."); 
    },
    success: function (response) {
      console.log("✅ Server response:", response);
      if (response.status.name === 'ok') {
        addDepartmentModal.modal('hide');
        showDepartments();
      } else {
        console.warn("⚠️ Unexpected response status:", response.status.name);
      }
    },
    error: function (jqXHR, errorThrown) {
      console.error("❌ Failed to add department:", {
        status: jqXHR.status,
        error: errorThrown,
        response: jqXHR.responseText
      });
    },
    complete: function () { 
      $('#loader').addClass('hidden');
      console.log("🏁 Add department process completed"); 
    }
  });
});
      
      

// <!-- / Update Department Modal / -->
$(document).on('click', '.updateDepartment', function () {
  $('#id_ud').val($(this).data('id'));
  $('#departmentName_ud').val($(this).data('name'));
  $('#editDepartmentLocationSelect option:first').replaceWith(`<option selected value="${$(this).data('locationid')}">${$(this).data('location')}</option>`);
  editDepartmentModal.modal('show');
  $('#updateDepartmentBtn').prop('disabled', true);
  console.log("🔒 Update button disabled (awaiting confirmation)");
});

$('#checkConfirmEditDepartment').on('click', function () {
  let isValid = $('#editDepartmentForm').valid();
  $('#updateDepartmentBtn').prop('disabled', !($(this).is(':checked') && isValid));
});

$('#updateDepartmentBtn').on('click', function (e) {
  e.preventDefault();
  $.ajax({
    url: 'libs/php/updateDepartment.php',
    type: 'POST',
    dataType: 'json',
    data: {
      id: $('#id_ud').val(),
      name: toTitleCase($('#departmentName_ud').val()),
      locationID: $('#editDepartmentLocationSelect').val()
    },
    beforeSend: function () { $('#loader').removeClass('hidden');
    console.log("⏳ Sending update request to server..."); 
     },
    success: function (response) {
      console.log("✅ Update response:", response);
      if (response.status.name === 'ok') {
        editDepartmentModal.modal('hide');
        showDepartments();
      } else {
        console.warn("⚠️ Unexpected response status:", response.status.name);
      }
    },
    error: function (jqXHR, errorThrown) {
      console.error("❌ Update failed:", {
        status: jqXHR.status,
        error: errorThrown,
        response: jqXHR.responseText
      });
    },
    complete: function () { 
      $('#loader').addClass('hidden');
      console.log("🏁 Update process completed"); 
    }
  });
});
      


// <!-- / Delete Department Modal / -->
$(document).on('click', '.deleteDepartment', function () {
  let id = $(this).data('id');
  let name = $(this).data('name');
  $('#id_dd').val(id);
  $('#deleteDepartmentName').text(name);
  $.ajax({
    url: 'libs/php/deleteDepartmentCheck.php',
    type: 'POST',
    dataType: 'json',
    data: { id: id },
    beforeSend: function() {
      console.log("🔍 Checking if department can be deleted...");
    },
    success: function (response) {
      console.log("✅ Deletion check response:", response);
      if (response.status.name === 'ok') {
        console.log("✔️ Department can be deleted - showing confirmation modal");
        deleteDepartmentModal.modal('show');
      } else {
        console.warn("⚠️ Department cannot be deleted - showing warning modal");
        $('.cannotDeleteDepartmentName').text(name);
        cannotDeleteDeptModal.modal('show');
      }
    },
    error: function(jqXHR, errorThrown) {
      console.error("❌ Deletion check failed:", {
        status: jqXHR.status,
        error: errorThrown,
        response: jqXHR.responseText
      });
    },
    complete: function() {
      console.log("🏁 Deletion check process completed");
    }
  });
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
  $.ajax({
    url: 'libs/php/deleteDepartment.php',
    type: 'POST',
    dataType: 'json',
    data: { id: $('#id_dd').val() },
    beforeSend: function () { $('#loader').removeClass('hidden');
    console.log("⏳ Sending delete request to server..."); 
     },
    success: function (response) {
      console.log("🗂️ Server deletion response:", response);
      if (response.status.name === 'ok') {
        console.log("✅ Department successfully deleted");
        deleteDepartmentModal.modal('hide');
        showDepartments();
      } else {
        console.warn("⚠️ Unexpected deletion response status:", response.status.name);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error("❌ Department deletion failed:", {
        status: jqXHR.status,
        error: errorThrown,
        response: jqXHR.responseText
      });
    },
    complete: function () { 
      $('#loader').addClass('hidden');
      console.log("🏁 Department deletion process completed"); 
    }
  });
});
      



// <!-- / Add Location Modal / -->
$('#checkConfirmAddLocation').on('click', function () {
  let isValid = $('#addLocationForm').valid();
  $('#addLocationBtn').prop('disabled', !($(this).is(':checked') && isValid));
});

$('#addLocationBtn').on('click', function (e) {
  e.preventDefault();
  $.ajax({
    url: 'libs/php/insertLocation.php',
    type: 'POST',
    dataType: 'json',
    data: { name: toTitleCase($('#locationName_addl').val()) },
    beforeSend: function () { $('#loader').removeClass('hidden');
    console.log("⏳ Sending location data to server..."); 
     },
    success: function (response) {
      console.log("✅ Server response:", response);
      if (response.status.name === 'ok') {
        addLocationModal.modal('hide');
        showLocations();
      } else {
        console.warn("⚠️ Unexpected response status:", response.status.name);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error("❌ Failed to add location:", {
        status: jqXHR.status,
        error: errorThrown,
        response: jqXHR.responseText
      });
    },
    complete: function () { 
      $('#loader').addClass('hidden');
      console.log("🏁 Add location process completed"); 
    }
  });
});
      


// <!-- / Delete Location Modal / -->
$(document).on('click', '.deleteLocation', function () {
  let id = $(this).data('id');
  let name = $(this).data('name');
  $('#id_dl').val(id);
  $('#deleteLocationName').text(name);
  $.ajax({
    url: 'libs/php/deleteLocationCheck.php',
    type: 'POST',
    dataType: 'json',
    data: { id: id },
    beforeSend: function() {
      console.log("🔍 Checking if location can be deleted...");
    },
    success: function (response) {
      console.log("✅ Deletion check response:", response);
      if (response.status.name === 'ok') {
        deleteLocationModal.modal('show');
      } else {
        console.warn("⚠️ Location cannot be deleted - showing warning modal");
        $('.cannotDeleteLocationName').text(name);
        cannotDeleteLocModal.modal('show');
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("❌ Deletion check failed:", {
        status: jqXHR.status,
        error: errorThrown,
        response: jqXHR.responseText
      });
    }
  });
});
// Confirmation checkbox
$('#checkConfirmDeleteLocation').on('click', function () {
  $('#deleteLocationBtn').prop('disabled', !$(this).is(':checked'));
});
// Final deletion 
$('#deleteLocationBtn').on('click', function (e) {
  e.preventDefault();
  $.ajax({
    url: 'libs/php/deleteLocation.php',
    type: 'POST',
    dataType: 'json',
    data: { id: $('#id_dl').val() },
    beforeSend: function () { $('#loader').removeClass('hidden');
    console.log("⏳ Sending delete request to server..."); 
     },
    success: function (response) {
      console.log("🗂️ Server deletion response:", response);
      if (response.status.name === 'ok') {
        deleteLocationModal.modal('hide');
        showLocations();
      } else {
        console.warn("⚠️ Unexpected deletion response:", response.status.name);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error("❌ Location deletion failed:", {
        status: jqXHR.status,
        error: errorThrown,
        response: jqXHR.responseText
      });
    },
    complete: function () { 
      $('#loader').addClass('hidden');
      console.log("🏁 Deletion process completed"); 
    }
  });
});


